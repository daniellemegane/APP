import random
import string
import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os

GMAIL_USER = os.environ.get("GMAIL_USER")
GMAIL_PASSWORD = os.environ.get("GMAIL_PASSWORD")

def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

async def send_otp_email(to_email: str, otp: str, full_name: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #E91E8C, #9C27B0); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Elles Market</h1>
            <p style="color: white;">La marketplace des femmes entrepreneures du Cameroun</p>
        </div>
        <div style="padding: 40px; background: #fff;">
            <h2>Bonjour {full_name} 👋</h2>
            <p>Merci de vous être inscrite sur <strong>Elles Market</strong> !</p>
            <p>Voici votre code de vérification :</p>
            <div style="background: #f5f5f5; border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0;">
                <span style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #E91E8C;">
                    {otp}
                </span>
            </div>
            <p style="color: #666;">Ce code expire dans <strong>10 minutes</strong>.</p>
            <p style="color: #666;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
        </div>
        <div style="background: #f9f9f9; padding: 20px; text-align: center; color: #999;">
            <p>© 2025 Elles Market — Cameroun 🇨🇲</p>
        </div>
    </div>
    """
    message = MIMEMultipart("alternative")
    message["Subject"] = f"🔐 Votre code de vérification Elles Market : {otp}"
    message["From"] = f"Elles Market <{GMAIL_USER}>"
    message["To"] = to_email
    message.attach(MIMEText(html, "html"))

    await aiosmtplib.send(
        message,
        hostname="smtp.gmail.com",
        port=587,
        start_tls=True,
        username=GMAIL_USER,
        password=GMAIL_PASSWORD,
    )
