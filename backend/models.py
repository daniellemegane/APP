"""Pydantic models for the marketplace."""
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import re


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


# ===== AUTH =====
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=2)
    role: str = Field(default="customer")  # customer | vendor
    phone: str = Field(min_length=8)
    city: Optional[str] = None
    otp_channel: str = Field(default="email")  # email | sms | whatsapp

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        cleaned = re.sub(r"[^\d+]", "", v)
        if not re.match(r"^\+?237?\d{9}$", cleaned) and not re.match(r"^\+?\d{9,15}$", cleaned):
            raise ValueError("Numéro de téléphone invalide")
        return cleaned

    @field_validator("otp_channel")
    @classmethod
    def validate_channel(cls, v):
        if v not in ("email", "sms", "whatsapp"):
            raise ValueError("Canal invalide")
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ===== SHOP =====
class ShopCreate(BaseModel):
    name: str
    description: str
    city: str
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    whatsapp: Optional[str] = None


class ShopUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    logo_url: Optional[str] = None
    cover_url: Optional[str] = None
    whatsapp: Optional[str] = None


# ===== PRODUCT =====
class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    type: str = "physical"  # physical | digital
    stock: int = 0
    images: List[str] = []
    digital_file_url: Optional[str] = None
    promotion_price: Optional[float] = None
    is_active: bool = True


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    type: Optional[str] = None
    stock: Optional[int] = None
    images: Optional[List[str]] = None
    digital_file_url: Optional[str] = None
    promotion_price: Optional[float] = None
    is_active: Optional[bool] = None


# ===== CART =====
class CartItem(BaseModel):
    product_id: str
    quantity: int = 1


# ===== ORDER =====
class CheckoutRequest(BaseModel):
    items: List[CartItem]
    shipping_address: str
    shipping_city: str
    shipping_phone: str
    payment_method: str  # mtn_momo | orange_money | card
    notes: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: str  # pending | confirmed | preparing | shipped | delivered | cancelled


# ===== REVIEW =====
class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(ge=1, le=5)
    comment: str


# ===== BANNER =====
class BannerCreate(BaseModel):
    title: str
    image_url: str
    link_url: Optional[str] = None
    position: str = "home_hero"  # home_hero | home_middle
    is_active: bool = True


# ===== SUBSCRIPTION =====
class SubscriptionUpgrade(BaseModel):
    plan: str  # free | premium
