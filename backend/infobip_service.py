"""Infobip service - envoi OTP par SMS et WhatsApp."""
import os
import httpx

INFOBIP_BASE_URL = os.environ.get("INFOBIP_BASE_URL", "k942w3.api.infobip.com")
INFOBIP_API_KEY = os.environ.get("INFOBIP_API_KEY")
INFOBIP_SMS_SENDER = os.environ.get("INFOBIP_SMS_SENDER", "447491163443")
INFOBIP_WHATSAPP_SENDER = os.environ.get("INFOBIP_WHATSAPP_SENDER", "")

HEADERS = {
    "Authorization": f"App {INFOBIP_API_KEY}",
    "Content-Type": "application/json",
    "Accept": "application/json",
}


def _normalize_phone(phone: str) -> str:
    """Retire le + et les espaces pour le format attendu par Infobip (ex: 237690276118)."""
    return phone.replace("+", "").replace(" ", "").strip()


async def send_otp_sms(phone: str, otp: str, full_name: str):
    to = _normalize_phone(phone)
    payload = {
        "messages": [
            {
                "destinations": [{"to": to}],
                "sender": INFOBIP_SMS_SENDER,
                "content": {
                    "text": f"Elles Market - Bonjour {full_name}, votre code de verification est : {otp}. Valide 10 minutes."
                },
            }
        ]
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            f"https://{INFOBIP_BASE_URL}/sms/3/messages",
            headers=HEADERS,
            json=payload,
        )
        resp.raise_for_status()
        return resp.json()


async def send_otp_whatsapp(phone: str, otp: str, full_name: str):
    """Nécessite un numéro WhatsApp Business + template approuvé par Meta sur Infobip."""
    to = _normalize_phone(phone)
    if not INFOBIP_WHATSAPP_SENDER:
        raise ValueError("WhatsApp non configuré (INFOBIP_WHATSAPP_SENDER manquant)")
    payload = {
        "messages": [
            {
                "from": INFOBIP_WHATSAPP_SENDER,
                "to": to,
                "messageId": None,
                "content": {
                    "templateName": "otp_verification",  # nom exact du template approuvé sur Infobip
                    "templateData": {
                        "body": {"placeholders": [full_name, otp]}
                    },
                    "language": "fr",
                },
            }
        ]
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            f"https://{INFOBIP_BASE_URL}/whatsapp/1/message/template",
            headers=HEADERS,
            json=payload,
        )
        resp.raise_for_status()
        return resp.json()