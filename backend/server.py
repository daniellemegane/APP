"""Elles Market - FastAPI backend for Cameroonian women entrepreneurs marketplace."""
from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List

from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends, UploadFile, File, Query, Header
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel as PydanticModel

from auth import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    set_auth_cookies, clear_auth_cookies, decode_token, get_current_user,
    get_token_from_request,
)
from storage import init_storage, put_object, get_object, APP_NAME
from models import (
    RegisterRequest, LoginRequest, ShopCreate, ShopUpdate,
    ProductCreate, ProductUpdate, CheckoutRequest, OrderStatusUpdate,
    ReviewCreate, BannerCreate, SubscriptionUpgrade, now_iso, new_id,
)
from email_service import generate_otp, send_otp_email, send_reset_email
from mtn_momo import create_api_user, get_access_token, request_payment, get_payment_status

# ============ Setup ============
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(
    mongo_url,
    tls=True,
    tlsAllowInvalidCertificates=True,
    serverSelectionTimeoutMS=30000
)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Elles Market API")

# CORS en premier — avant toutes les routes
_frontend_url = os.environ.get("FRONTEND_URL", "https://elles-market.acodaf.org")
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        _frontend_url,
        "https://elles-market.acodaf.org",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

CAMEROON_CITIES = [
    "Yaoundé", "Douala", "Bafoussam", "Bertoua", "Garoua",
    "Ngaoundéré", "Maroua", "Kribi", "Limbé", "Buea",
    "Edéa", "Bamenda", "Ebolowa", "Kumba", "Dschang"
]

PRODUCT_CATEGORIES = [
    "Mode & Vêtements", "Chaussures", "Sacs & Maroquinerie", "Accessoires",
    "Cosmétiques & Beauté", "Artisanat", "Livres", "Produits locaux",
    "E-books", "Formations", "Templates", "Guides PDF"
]


# ============ Commission Logic ============
def compute_commission(amount: float, plan: str) -> float:
    """Returns commission amount based on plan and order amount in FCFA."""
    if plan == "premium":
        if amount <= 100_000:
            rate = 0.08
        elif amount <= 200_000:
            rate = 0.075
        elif amount <= 800_000:
            rate = 0.07
        else:
            rate = 0.065
    else:  # free
        if amount <= 100_000:
            rate = 0.09
        elif amount <= 200_000:
            rate = 0.08
        else:
            rate = 0.07
    return round(amount * rate, 2)


def formatPrice_py(amount: float) -> str:
    return f"{int(amount):,}".replace(",", " ")


# ============ Auth Dependency ============
async def current_user(request: Request) -> dict:
    return await get_current_user(request, db)


def role_required(*roles):
    async def _check(user: dict = Depends(current_user)) -> dict:
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Permissions insuffisantes")
        return user
    return _check


# ============ AUTH ROUTES (avec vérification OTP par email) ============
@api.post("/auth/register")
async def register(payload: RegisterRequest, response: Response):
    email = payload.email.lower()
    if payload.role not in ("customer", "vendor"):
        raise HTTPException(status_code=400, detail="Rôle invalide")
    existing = await db.users.find_one({"email": email})
    if existing and existing.get("is_verified", False):
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")

    user_id = new_id()
    user = {
        "id": user_id,
        "email": email,
        "password_hash": hash_password(payload.password),
        "full_name": payload.full_name,
        "role": payload.role,
        "phone": payload.phone,
        "city": payload.city,
        "subscription_plan": "free",
        "is_active": False,
        "is_verified": False,
        "created_at": now_iso(),
    }
    if existing:
        await db.users.replace_one({"email": email}, user)
    else:
        await db.users.insert_one(user)

    otp = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    await db.otps.delete_many({"email": email})
    await db.otps.insert_one({
        "email": email,
        "otp": otp,
        "expires_at": expires_at,
        "attempts": 0,
    })

    try:
        await send_otp_email(email, otp, payload.full_name)
    except Exception as e:
        logger.error(f"Email OTP failed: {e}")
        raise HTTPException(status_code=500, detail="Erreur envoi email. Vérifiez votre adresse.")

    return {"message": "Code envoyé par email", "email": email, "requires_verification": True}
# ============ MOT DE PASSE ============
@api.post("/auth/forgot-password")
async def forgot_password(email: str):
    email = email.lower()
    user = await db.users.find_one({"email": email})
    if not user:
        # On ne révèle pas si l'email existe ou non (sécurité)
        return {"message": "Si cet email existe, un code a été envoyé."}
    
    otp = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    await db.password_resets.delete_many({"email": email})
    await db.password_resets.insert_one({
        "email": email,
        "otp": otp,
        "expires_at": expires_at,
        "attempts": 0,
    })
    
    try:
        await send_reset_email(email, otp, user["full_name"])
    except Exception as e:
        logger.error(f"Reset email failed: {e}")
        raise HTTPException(status_code=500, detail="Erreur envoi email.")
    
    return {"message": "Si cet email existe, un code a été envoyé."}


@api.post("/auth/reset-password")
async def reset_password(email: str, otp: str, new_password: str):
    email = email.lower()
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Mot de passe trop court (min 6 caractères)")
    
    record = await db.password_resets.find_one({"email": email})
    if not record:
        raise HTTPException(status_code=400, detail="Code invalide ou expiré")
    
    if record.get("attempts", 0) >= 5:
        raise HTTPException(status_code=400, detail="Trop de tentatives.")
    
    expires_at = record["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires_at:
        await db.password_resets.delete_one({"email": email})
        raise HTTPException(status_code=400, detail="Code expiré. Recommencez.")
    
    if record["otp"] != otp:
        await db.password_resets.update_one({"email": email}, {"$inc": {"attempts": 1}})
        remaining = 4 - record.get("attempts", 0)
        raise HTTPException(status_code=400, detail=f"Code incorrect. {remaining} tentatives restantes.")
    
    await db.users.update_one(
        {"email": email},
        {"$set": {"password_hash": hash_password(new_password)}}
    )
    await db.password_resets.delete_one({"email": email})
    return {"message": "Mot de passe réinitialisé avec succès !"}


# ============ SUPPRESSION DE COMPTE ============
@api.delete("/auth/me")
async def delete_my_account(user: dict = Depends(current_user)):
    await db.users.delete_one({"id": user["id"]})
    await db.shops.delete_many({"vendor_id": user["id"]})
    await db.products.delete_many({"vendor_id": user["id"]})
    await db.orders.update_many(
        {"vendor_id": user["id"]},
        {"$set": {"status": "cancelled"}}
    )
    await db.otps.delete_many({"email": user["email"]})
    await db.password_resets.delete_many({"email": user["email"]})
    return {"ok": True, "message": "Compte supprimé avec succès."}


@api.post("/auth/verify-otp")
async def verify_otp(email: str, otp: str, response: Response):
    email = email.lower()
    record = await db.otps.find_one({"email": email})

    if not record:
        raise HTTPException(status_code=400, detail="Code invalide ou expiré")

    if record.get("attempts", 0) >= 5:
        raise HTTPException(status_code=400, detail="Trop de tentatives. Demandez un nouveau code.")

    expires_at = record["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires_at:
        await db.otps.delete_one({"email": email})
        raise HTTPException(status_code=400, detail="Code expiré. Inscrivez-vous à nouveau.")

    if record["otp"] != otp:
        await db.otps.update_one({"email": email}, {"$inc": {"attempts": 1}})
        remaining = 4 - record.get("attempts", 0)
        raise HTTPException(status_code=400, detail=f"Code incorrect. {remaining} tentatives restantes.")

    await db.users.update_one(
        {"email": email},
        {"$set": {"is_active": True, "is_verified": True}}
    )
    await db.otps.delete_one({"email": email})

    user = await db.users.find_one({"email": email})
    access = create_access_token(user["id"], email, user["role"])
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    user.pop("password_hash", None)
    user.pop("_id", None)

    return {"user": user, "access_token": access, "message": "Compte vérifié avec succès !"}

@api.post("/auth/resend-otp")
async def resend_otp(email: str):
    email = email.lower()
    user = await db.users.find_one({"email": email, "is_verified": False})
    if not user:
        raise HTTPException(status_code=400, detail="Utilisateur introuvable ou déjà vérifié")

    otp = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    await db.otps.delete_many({"email": email})
    await db.otps.insert_one({
        "email": email,
        "otp": otp,
        "expires_at": expires_at,
        "attempts": 0,
    })

    await send_otp_email(email, otp, user["full_name"])
    return {"message": "Nouveau code envoyé"}


@api.post("/auth/login")
async def login(payload: LoginRequest, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Compte désactivé. Vérifiez votre email.")
    access = create_access_token(user["id"], email, user["role"])
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    user.pop("password_hash", None)
    user.pop("_id", None)
    return {"user": user, "access_token": access}


@api.post("/auth/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(current_user)):
    return user


# ============ STATIC DATA ============
@api.get("/meta/cities")
async def get_cities():
    return CAMEROON_CITIES


@api.get("/meta/categories")
async def get_categories():
    return PRODUCT_CATEGORIES


# ============ SHOPS ============
@api.post("/shops")
async def create_shop(payload: ShopCreate, user: dict = Depends(role_required("vendor"))):
    existing = await db.shops.find_one({"vendor_id": user["id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà une boutique")
    shop = {
        "id": new_id(),
        "vendor_id": user["id"],
        "name": payload.name,
        "description": payload.description,
        "city": payload.city,
        "logo_url": payload.logo_url,
        "cover_url": payload.cover_url,
        "whatsapp": payload.whatsapp,
        "status": "pending",
        "is_premium": user.get("subscription_plan") == "premium",
        "rating_avg": 0.0,
        "created_at": now_iso(),
    }
    await db.shops.insert_one(shop)
    shop.pop("_id", None)
    return shop


@api.get("/shops")
async def list_shops(status: Optional[str] = None, city: Optional[str] = None, premium_only: bool = False):
    q = {}
    if status:
        q["status"] = status
    else:
        q["status"] = "approved"
    if city:
        q["city"] = city
    if premium_only:
        q["is_premium"] = True
    shops = await db.shops.find(q, {"_id": 0}).sort("is_premium", -1).to_list(500)
    return shops


@api.get("/shops/mine")
async def my_shop(user: dict = Depends(role_required("vendor"))):
    shop = await db.shops.find_one({"vendor_id": user["id"]}, {"_id": 0})
    return shop


@api.get("/shops/{shop_id}")
async def get_shop(shop_id: str):
    shop = await db.shops.find_one({"id": shop_id}, {"_id": 0})
    if not shop:
        raise HTTPException(status_code=404, detail="Boutique introuvable")
    return shop


@api.patch("/shops/{shop_id}")
async def update_shop(shop_id: str, payload: ShopUpdate, user: dict = Depends(current_user)):
    shop = await db.shops.find_one({"id": shop_id})
    if not shop:
        raise HTTPException(status_code=404, detail="Boutique introuvable")
    if user["role"] != "admin" and shop["vendor_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Non autorisé")
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update:
        await db.shops.update_one({"id": shop_id}, {"$set": update})
    out = await db.shops.find_one({"id": shop_id}, {"_id": 0})
    return out


@api.post("/admin/shops/{shop_id}/approve")
async def approve_shop(shop_id: str, user: dict = Depends(role_required("admin"))):
    res = await db.shops.update_one({"id": shop_id}, {"$set": {"status": "approved"}})
    if not res.matched_count:
        raise HTTPException(status_code=404, detail="Boutique introuvable")
    return {"ok": True}


@api.post("/admin/shops/{shop_id}/reject")
async def reject_shop(shop_id: str, user: dict = Depends(role_required("admin"))):
    res = await db.shops.update_one({"id": shop_id}, {"$set": {"status": "rejected"}})
    if not res.matched_count:
        raise HTTPException(status_code=404, detail="Boutique introuvable")
    return {"ok": True}


# ============ PRODUCTS ============
async def _check_product_limit(vendor_id: str, plan: str):
    if plan == "free":
        count = await db.products.count_documents({"vendor_id": vendor_id})
        if count >= 10:
            raise HTTPException(status_code=400, detail="Limite de 10 produits atteinte (offre Gratuite). Passez Premium pour des produits illimités.")


@api.post("/products")
async def create_product(payload: ProductCreate, user: dict = Depends(role_required("vendor"))):
    shop = await db.shops.find_one({"vendor_id": user["id"]})
    if not shop:
        raise HTTPException(status_code=400, detail="Créez votre boutique d'abord")
    if shop["status"] != "approved":
        raise HTTPException(status_code=403, detail="Votre boutique doit être validée par l'admin avant de publier")
    await _check_product_limit(user["id"], user.get("subscription_plan", "free"))
    product = {
        "id": new_id(),
        "vendor_id": user["id"],
        "shop_id": shop["id"],
        "shop_name": shop["name"],
        "shop_city": shop["city"],
        "name": payload.name,
        "description": payload.description,
        "price": payload.price,
        "promotion_price": payload.promotion_price,
        "category": payload.category,
        "type": payload.type,
        "stock": payload.stock,
        "images": payload.images,
        "digital_file_url": payload.digital_file_url,
        "is_active": payload.is_active,
        "rating_avg": 0.0,
        "rating_count": 0,
        "sold_count": 0,
        "created_at": now_iso(),
    }
    await db.products.insert_one(product)
    product.pop("_id", None)
    return product


@api.get("/products")
async def list_products(
    category: Optional[str] = None,
    city: Optional[str] = None,
    q: Optional[str] = None,
    type: Optional[str] = None,
    shop_id: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: str = "recent",
    limit: int = 60,
):
    query = {"is_active": True}
    if category:
        query["category"] = category
    if city:
        query["shop_city"] = city
    if type:
        query["type"] = type
    if shop_id:
        query["shop_id"] = shop_id
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]
    price_q = {}
    if min_price is not None:
        price_q["$gte"] = min_price
    if max_price is not None:
        price_q["$lte"] = max_price
    if price_q:
        query["price"] = price_q

    sort_field = [("created_at", -1)]
    if sort == "price_asc":
        sort_field = [("price", 1)]
    elif sort == "price_desc":
        sort_field = [("price", -1)]
    elif sort == "best":
        sort_field = [("sold_count", -1)]

    products = await db.products.find(query, {"_id": 0}).sort(sort_field).limit(limit).to_list(limit)
    return products


@api.get("/products/mine")
async def my_products(user: dict = Depends(role_required("vendor"))):
    products = await db.products.find({"vendor_id": user["id"]}, {"_id": 0}).sort([("created_at", -1)]).to_list(500)
    return products


@api.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    return product


@api.patch("/products/{product_id}")
async def update_product(product_id: str, payload: ProductUpdate, user: dict = Depends(current_user)):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    if user["role"] != "admin" and product["vendor_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Non autorisé")
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update:
        await db.products.update_one({"id": product_id}, {"$set": update})
    out = await db.products.find_one({"id": product_id}, {"_id": 0})
    return out


@api.delete("/products/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(current_user)):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    if user["role"] != "admin" and product["vendor_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Non autorisé")
    await db.products.delete_one({"id": product_id})
    return {"ok": True}


# ============ UPLOAD ============
@api.post("/upload")
async def upload_file(file: UploadFile = File(...), user: dict = Depends(current_user)):
    ext = (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin").lower()
    if ext not in ("jpg", "jpeg", "png", "webp", "gif", "pdf"):
        raise HTTPException(status_code=400, detail="Type de fichier non supporté")
    path = f"{APP_NAME}/uploads/{user['id']}/{new_id()}.{ext}"
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Fichier trop volumineux (max 10MB)")
    content_type = file.content_type or {
        "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
        "webp": "image/webp", "gif": "image/gif", "pdf": "application/pdf",
    }.get(ext, "application/octet-stream")
    try:
        result = put_object(path, data, content_type)
    except Exception as e:
        logger.exception("Upload failed")
        raise HTTPException(status_code=500, detail=f"Échec téléversement: {e}")
    file_id = new_id()
    await db.files.insert_one({
        "id": file_id,
        "owner_id": user["id"],
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": now_iso(),
    })
    return {"id": file_id, "url": f"/api/files/{file_id}", "path": result["path"]}


@api.get("/files/{file_id}")
async def serve_file(file_id: str):
    rec = await db.files.find_one({"id": file_id, "is_deleted": False})
    if not rec:
        raise HTTPException(status_code=404, detail="Fichier introuvable")
    try:
        data, ct = get_object(rec["storage_path"])
    except Exception:
        raise HTTPException(status_code=500, detail="Erreur de stockage")
    return Response(content=data, media_type=rec.get("content_type", ct))


# ============ ORDERS ============
@api.post("/orders/checkout")
async def checkout(payload: CheckoutRequest, user: dict = Depends(role_required("customer"))):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Panier vide")

    shop_groups: dict = {}
    for item in payload.items:
        prod = await db.products.find_one({"id": item.product_id})
        if not prod or not prod.get("is_active", True):
            raise HTTPException(status_code=400, detail="Produit indisponible")
        if prod["type"] == "physical" and prod.get("stock", 0) < item.quantity:
            raise HTTPException(status_code=400, detail=f"Stock insuffisant pour {prod['name']}")
        shop_groups.setdefault(prod["shop_id"], []).append((prod, item.quantity))

    created_orders = []
    for shop_id, items in shop_groups.items():
        vendor_id = items[0][0]["vendor_id"]
        vendor = await db.users.find_one({"id": vendor_id})
        plan = vendor.get("subscription_plan", "free") if vendor else "free"
        order_items = []
        subtotal = 0.0
        for prod, qty in items:
            unit_price = prod.get("promotion_price") or prod["price"]
            line_total = unit_price * qty
            subtotal += line_total
            order_items.append({
                "product_id": prod["id"],
                "name": prod["name"],
                "image": (prod.get("images") or [None])[0],
                "type": prod["type"],
                "unit_price": unit_price,
                "quantity": qty,
                "line_total": line_total,
            })
        commission = compute_commission(subtotal, plan)
        vendor_payout = subtotal - commission
        has_physical = any(p["type"] == "physical" for p, _ in items)
        shipping_fee = 1500.0 if has_physical else 0.0
        total = subtotal + shipping_fee
        order = {
            "id": new_id(),
            "order_number": f"CM-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}",
            "customer_id": user["id"],
            "customer_name": user["full_name"],
            "vendor_id": vendor_id,
            "shop_id": shop_id,
            "items": order_items,
            "subtotal": subtotal,
            "shipping_fee": shipping_fee,
            "total": total,
            "commission": commission,
            "vendor_payout": vendor_payout,
            "vendor_plan": plan,
            "status": "pending",
            "payment_method": payload.payment_method,
            "payment_status": "paid",
            "shipping_address": payload.shipping_address,
            "shipping_city": payload.shipping_city,
            "shipping_phone": payload.shipping_phone,
            "notes": payload.notes,
            "has_physical": has_physical,
            "created_at": now_iso(),
            "status_history": [{"status": "pending", "at": now_iso()}],
        }
        created_orders.append(order)

    for o in created_orders:
        await db.orders.insert_one(o)
        for it in o["items"]:
            await db.products.update_one(
                {"id": it["product_id"], "stock": {"$gte": it["quantity"]}},
                {"$inc": {"stock": -it["quantity"], "sold_count": it["quantity"]}}
            )
        o.pop("_id", None)

    return {"orders": created_orders, "count": len(created_orders)}


@api.get("/orders/mine")
async def my_orders(user: dict = Depends(current_user)):
    if user["role"] == "customer":
        q = {"customer_id": user["id"]}
    elif user["role"] == "vendor":
        q = {"vendor_id": user["id"]}
    else:
        q = {}
    orders = await db.orders.find(q, {"_id": 0}).sort([("created_at", -1)]).to_list(500)
    return orders


@api.get("/orders/{order_id}")
async def get_order(order_id: str, user: dict = Depends(current_user)):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    if user["role"] != "admin" and order["customer_id"] != user["id"] and order["vendor_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Non autorisé")
    return order


@api.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, payload: OrderStatusUpdate, user: dict = Depends(current_user)):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    if user["role"] not in ("admin", "vendor") or (user["role"] == "vendor" and order["vendor_id"] != user["id"]):
        raise HTTPException(status_code=403, detail="Non autorisé")
    valid = ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled"]
    if payload.status not in valid:
        raise HTTPException(status_code=400, detail="Statut invalide")
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": payload.status},
         "$push": {"status_history": {"status": payload.status, "at": now_iso()}}}
    )
    return {"ok": True, "status": payload.status}


# ============ REVIEWS ============
@api.post("/reviews")
async def create_review(payload: ReviewCreate, user: dict = Depends(role_required("customer"))):
    delivered = await db.orders.find_one({
        "customer_id": user["id"],
        "status": "delivered",
        "items.product_id": payload.product_id,
    })
    if not delivered:
        raise HTTPException(status_code=400, detail="Vous pouvez laisser un avis uniquement après livraison")
    existing = await db.reviews.find_one({"customer_id": user["id"], "product_id": payload.product_id})
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà laissé un avis")
    review = {
        "id": new_id(),
        "product_id": payload.product_id,
        "customer_id": user["id"],
        "customer_name": user["full_name"],
        "rating": payload.rating,
        "comment": payload.comment,
        "created_at": now_iso(),
    }
    await db.reviews.insert_one(review)
    cursor = db.reviews.find({"product_id": payload.product_id})
    ratings = [r["rating"] async for r in cursor]
    avg = round(sum(ratings) / len(ratings), 2) if ratings else 0.0
    await db.products.update_one(
        {"id": payload.product_id},
        {"$set": {"rating_avg": avg, "rating_count": len(ratings)}}
    )
    review.pop("_id", None)
    return review


@api.get("/reviews")
async def list_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).sort([("created_at", -1)]).to_list(200)
    return reviews


# ============ SUBSCRIPTION ============
@api.post("/subscription/upgrade")
async def upgrade_sub(payload: SubscriptionUpgrade, user: dict = Depends(role_required("vendor"))):
    if payload.plan not in ("free", "premium"):
        raise HTTPException(status_code=400, detail="Plan invalide")
    await db.users.update_one({"id": user["id"]}, {"$set": {"subscription_plan": payload.plan}})
    await db.shops.update_one({"vendor_id": user["id"]}, {"$set": {"is_premium": payload.plan == "premium"}})
    await db.subscription_payments.insert_one({
        "id": new_id(),
        "vendor_id": user["id"],
        "plan": payload.plan,
        "amount": 5000 if payload.plan == "premium" else 0,
        "status": "paid",
        "created_at": now_iso(),
    })
    return {"ok": True, "plan": payload.plan}


# ============ BANNERS ============
@api.post("/admin/banners")
async def create_banner(payload: BannerCreate, user: dict = Depends(role_required("admin"))):
    banner = {
        "id": new_id(),
        "title": payload.title,
        "image_url": payload.image_url,
        "link_url": payload.link_url,
        "position": payload.position,
        "is_active": payload.is_active,
        "created_at": now_iso(),
    }
    await db.banners.insert_one(banner)
    banner.pop("_id", None)
    return banner


@api.get("/banners")
async def list_banners(position: Optional[str] = None):
    q = {"is_active": True}
    if position:
        q["position"] = position
    banners = await db.banners.find(q, {"_id": 0}).sort([("created_at", -1)]).to_list(20)
    return banners


@api.delete("/admin/banners/{banner_id}")
async def delete_banner(banner_id: str, user: dict = Depends(role_required("admin"))):
    await db.banners.delete_one({"id": banner_id})
    return {"ok": True}


# ============ ADMIN STATS ============
@api.get("/admin/stats")
async def admin_stats(user: dict = Depends(role_required("admin"))):
    customers = await db.users.count_documents({"role": "customer"})
    vendors = await db.users.count_documents({"role": "vendor"})
    shops_pending = await db.shops.count_documents({"status": "pending"})
    shops_approved = await db.shops.count_documents({"status": "approved"})
    products = await db.products.count_documents({})
    orders = await db.orders.count_documents({})
    pipeline = [{"$group": {"_id": None, "total_gmv": {"$sum": "$total"}, "total_commission": {"$sum": "$commission"}}}]
    agg = await db.orders.aggregate(pipeline).to_list(1)
    gmv = agg[0]["total_gmv"] if agg else 0
    commission = agg[0]["total_commission"] if agg else 0
    return {
        "customers": customers,
        "vendors": vendors,
        "shops_pending": shops_pending,
        "shops_approved": shops_approved,
        "products": products,
        "orders": orders,
        "gmv": gmv,
        "commission": commission,
    }


@api.get("/admin/users")
async def admin_list_users(user: dict = Depends(role_required("admin"))):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort([("created_at", -1)]).to_list(500)
    return users


@api.get("/admin/orders")
async def admin_list_orders(user: dict = Depends(role_required("admin"))):
    orders = await db.orders.find({}, {"_id": 0}).sort([("created_at", -1)]).to_list(500)
    return orders


@api.get("/vendor/stats")
async def vendor_stats(user: dict = Depends(role_required("vendor"))):
    products = await db.products.count_documents({"vendor_id": user["id"]})
    pipeline = [
        {"$match": {"vendor_id": user["id"]}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}, "revenue": {"$sum": "$vendor_payout"}}}
    ]
    agg = await db.orders.aggregate(pipeline).to_list(20)
    total_orders = sum(a["count"] for a in agg)
    total_revenue = sum(a["revenue"] for a in agg if a["_id"] == "delivered")
    pending_revenue = sum(a["revenue"] for a in agg if a["_id"] not in ("delivered", "cancelled"))
    return {
        "products": products,
        "orders": total_orders,
        "revenue_paid": total_revenue,
        "revenue_pending": pending_revenue,
        "by_status": agg,
    }


# ============ PAIEMENT MTN MOMO ============
class MoMoPaymentRequest(PydanticModel):
    phone_number: str
    amount: float
    order_id: str


@api.post("/payments/mtn/initiate")
async def initiate_mtn_payment(payload: MoMoPaymentRequest, user: dict = Depends(current_user)):
    try:
        api_user, api_key = await create_api_user()
        access_token = await get_access_token(api_user, api_key)
        result = await request_payment(
            phone_number=payload.phone_number,
            amount=payload.amount,
            order_id=payload.order_id,
            access_token=access_token,
        )
        await db.payments.insert_one({
            "id": new_id(),
            "order_id": payload.order_id,
            "user_id": user["id"],
            "phone_number": payload.phone_number,
            "amount": payload.amount,
            "method": "mtn_momo",
            "reference_id": result["reference_id"],
            "api_user": api_user,
            "api_key": api_key,
            "status": "PENDING",
            "created_at": now_iso(),
        })
        return {
            "success": result["success"],
            "reference_id": result["reference_id"],
            "message": "Demande de paiement envoyée. Confirmez sur votre téléphone MTN."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur paiement MTN: {str(e)}")


@api.get("/payments/mtn/status/{reference_id}")
async def check_mtn_payment(reference_id: str, user: dict = Depends(current_user)):
    payment = await db.payments.find_one({"reference_id": reference_id}, {"_id": 0})
    if not payment:
        raise HTTPException(status_code=404, detail="Paiement introuvable")
    try:
        access_token = await get_access_token(payment["api_user"], payment["api_key"])
        status = await get_payment_status(reference_id, access_token)
        await db.payments.update_one(
            {"reference_id": reference_id},
            {"$set": {"status": status["status"]}}
        )
        if status["status"] == "SUCCESSFUL":
            await db.orders.update_one(
                {"id": payment["order_id"]},
                {"$set": {"payment_status": "paid", "status": "confirmed"}}
            )
        return {
            "reference_id": reference_id,
            "status": status["status"],
            "reason": status.get("reason", ""),
            "order_id": payment["order_id"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur vérification: {str(e)}")


# ============ RETRAITS ============
class RetraitRequest(PydanticModel):
    montant: float
    numero_mobile_money: str
    operateur: str  # mtn | orange


@api.post("/retraits")
async def demander_retrait(payload: RetraitRequest, user: dict = Depends(role_required("vendor"))):
    stats = await db.orders.aggregate([
        {"$match": {"vendor_id": user["id"], "status": "delivered"}},
        {"$group": {"_id": None, "total": {"$sum": "$vendor_payout"}}}
    ]).to_list(1)
    revenus_disponibles = stats[0]["total"] if stats else 0

    retraits_en_cours = await db.retraits.aggregate([
        {"$match": {"vendor_id": user["id"], "status": {"$in": ["pending", "processing"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$montant"}}}
    ]).to_list(1)
    deja_demande = retraits_en_cours[0]["total"] if retraits_en_cours else 0

    disponible = revenus_disponibles - deja_demande
    if payload.montant > disponible:
        raise HTTPException(status_code=400, detail=f"Montant supérieur au solde disponible ({formatPrice_py(disponible)} FCFA)")
    if payload.montant < 1000:
        raise HTTPException(status_code=400, detail="Montant minimum : 1 000 FCFA")

    retrait = {
        "id": new_id(),
        "vendor_id": user["id"],
        "vendor_nom": user["full_name"],
        "montant": payload.montant,
        "numero_mobile_money": payload.numero_mobile_money,
        "operateur": payload.operateur,
        "status": "pending",
        "created_at": now_iso(),
    }
    await db.retraits.insert_one(retrait)
    retrait.pop("_id", None)
    return {"message": "Demande de retrait envoyée !", "retrait": retrait}


@api.get("/retraits/mine")
async def mes_retraits(user: dict = Depends(role_required("vendor"))):
    retraits = await db.retraits.find({"vendor_id": user["id"]}, {"_id": 0}).sort([("created_at", -1)]).to_list(100)
    return retraits


@api.get("/admin/retraits")
async def admin_retraits(user: dict = Depends(role_required("admin"))):
    retraits = await db.retraits.find({}, {"_id": 0}).sort([("created_at", -1)]).to_list(500)
    return retraits


@api.patch("/admin/retraits/{retrait_id}")
async def maj_retrait(retrait_id: str, status: str, user: dict = Depends(role_required("admin"))):
    await db.retraits.update_one({"id": retrait_id}, {"$set": {"status": status}})
    return {"ok": True}


# ============ Health ============
@api.get("/")
async def root():
    return {"message": "Elles Market API", "status": "ok"}


# ============ STARTUP ============
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.shops.create_index("id", unique=True)
    await db.shops.create_index("vendor_id")
    await db.products.create_index("id", unique=True)
    await db.products.create_index("vendor_id")
    await db.products.create_index("shop_id")
    await db.orders.create_index("id", unique=True)
    await db.orders.create_index("customer_id")
    await db.orders.create_index("vendor_id")
    await db.reviews.create_index([("product_id", 1), ("customer_id", 1)], unique=True)

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@ellesmarket.cm")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin123!")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": new_id(),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "full_name": "Administrateur",
            "role": "admin",
            "is_active": True,
            "is_verified": True,
            "subscription_plan": "premium",
            "created_at": now_iso(),
        })
        logger.info(f"Admin seeded: {admin_email}")
    else:
        if not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# Mount router
app.include_router(api)