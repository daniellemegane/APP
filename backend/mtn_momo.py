"""MTN MoMo Collection API integration for Elles Market."""
import os
import uuid
import httpx
import base64
import logging
from typing import Optional

logger = logging.getLogger(__name__)

MTN_BASE_URL = "https://sandbox.momodeveloper.mtn.com"
MTN_PRIMARY_KEY = os.environ.get("MTN_MOMO_PRIMARY_KEY", "")
MTN_ENV = os.environ.get("MTN_MOMO_ENV", "sandbox")
MTN_CURRENCY = "EUR"  # sandbox=EUR, production=XAF


async def create_api_user() -> tuple:
    """Crée un utilisateur API sandbox et retourne (user_id, api_key)."""
    reference_id = str(uuid.uuid4())
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{MTN_BASE_URL}/v1_0/apiuser",
            headers={
                "X-Reference-Id": reference_id,
                "Ocp-Apim-Subscription-Key": MTN_PRIMARY_KEY,
                "Content-Type": "application/json",
            },
            json={"providerCallbackHost": "localhost"},
            timeout=30,
        )
        if resp.status_code != 201:
            raise Exception(f"Erreur création utilisateur: {resp.text}")

        key_resp = await client.post(
            f"{MTN_BASE_URL}/v1_0/apiuser/{reference_id}/apikey",
            headers={"Ocp-Apim-Subscription-Key": MTN_PRIMARY_KEY},
            timeout=30,
        )
        api_key = key_resp.json().get("apiKey")
        return reference_id, api_key


async def get_access_token(api_user: str, api_key: str) -> str:
    """Obtenir le token OAuth2."""
    credentials = base64.b64encode(f"{api_user}:{api_key}".encode()).decode()
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{MTN_BASE_URL}/collection/token/",
            headers={
                "Authorization": f"Basic {credentials}",
                "Ocp-Apim-Subscription-Key": MTN_PRIMARY_KEY,
            },
            timeout=30,
        )
        if resp.status_code != 200:
            raise Exception(f"Erreur token: {resp.text}")
        return resp.json().get("access_token")


async def request_payment(
    phone_number: str,
    amount: float,
    order_id: str,
    access_token: str,
) -> dict:
    """Demander un paiement au client."""
    reference_id = str(uuid.uuid4())
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{MTN_BASE_URL}/collection/v1_0/requesttopay",
            headers={
                "Authorization": f"Bearer {access_token}",
                "X-Reference-Id": reference_id,
                "X-Target-Environment": MTN_ENV,
                "Ocp-Apim-Subscription-Key": MTN_PRIMARY_KEY,
                "Content-Type": "application/json",
            },
            json={
                "amount": str(int(amount)),
                "currency": MTN_CURRENCY,
                "externalId": order_id,
                "payer": {
                    "partyIdType": "MSISDN",
                    "partyId": phone_number,
                },
                "payerMessage": f"Paiement Elles Market commande {order_id}",
                "payeeNote": f"Commande {order_id}",
            },
            timeout=30,
        )
        return {
            "reference_id": reference_id,
            "success": resp.status_code == 202,
        }


async def get_payment_status(reference_id: str, access_token: str) -> dict:
    """Vérifier le statut d'un paiement."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{MTN_BASE_URL}/collection/v1_0/requesttopay/{reference_id}",
            headers={
                "Authorization": f"Bearer {access_token}",
                "X-Target-Environment": MTN_ENV,
                "Ocp-Apim-Subscription-Key": MTN_PRIMARY_KEY,
            },
            timeout=30,
        )
        if resp.status_code == 200:
            data = resp.json()
            return {
                "status": data.get("status"),
                "reason": data.get("reason", ""),
            }
    return {"status": "UNKNOWN", "reason": ""}