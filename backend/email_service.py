import random
import string
import os
import resend

resend.api_key = os.environ.get("RESEND_API_KEY")

SENDER = "Elles Market <noreply@trade-policy.com>"

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
    resend.Emails.send({
        "from": SENDER,
        "to": [to_email],
        "subject": f"🔐 Votre code de vérification Elles Market : {otp}",
        "html": html,
    })


async def send_reset_email(to_email: str, otp: str, full_name: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #E91E8C, #9C27B0); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Elles Market</h1>
            <p style="color: white;">La marketplace des femmes entrepreneures du Cameroun</p>
        </div>
        <div style="padding: 40px; background: #fff;">
            <h2>Bonjour {full_name} 👋</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Voici votre code :</p>
            <div style="background: #f5f5f5; border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0;">
                <span style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #E91E8C;">
                    {otp}
                </span>
            </div>
            <p style="color: #666;">Ce code expire dans <strong>15 minutes</strong>.</p>
            <p style="color: #666;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
        <div style="background: #f9f9f9; padding: 20px; text-align: center; color: #999;">
            <p>© 2025 Elles Market — Cameroun 🇨🇲</p>
        </div>
    </div>
    """
    resend.Emails.send({
        "from": SENDER,
        "to": [to_email],
        "subject": "🔑 Réinitialisation de votre mot de passe Elles Market",
        "html": html,
    })
    
async def send_shop_approved_email(to_email: str, full_name: str, shop_name: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #E91E8C, #9C27B0); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Elles Market</h1>
            <p style="color: white;">La marketplace des femmes entrepreneures du Cameroun</p>
        </div>
        <div style="padding: 40px; background: #fff;">
            <h2>Félicitations {full_name} ! 🎉</h2>
            <p>Votre boutique <strong>{shop_name}</strong> a été vérifiée et approuvée par notre équipe.</p>
            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; color: #166534;"><strong>✓ Badge Vendeuse vérifiée</strong> attribué à votre boutique.</p>
            </div>
            <p>Vous pouvez dès maintenant ajouter vos produits et commencer à vendre sur Elles Market !</p>
            <p style="color: #666;">Bonne vente ! 💪</p>
        </div>
        <div style="background: #f9f9f9; padding: 20px; text-align: center; color: #999;">
            <p>© 2025 Elles Market — Cameroun 🇨🇲</p>
        </div>
    </div>
    """
    resend.Emails.send({
        "from": SENDER,
        "to": [to_email],
        "subject": "🎉 Votre boutique a été approuvée !",
        "html": html,
    })


async def send_shop_rejected_email(to_email: str, full_name: str, reason: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #E91E8C, #9C27B0); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Elles Market</h1>
            <p style="color: white;">La marketplace des femmes entrepreneures du Cameroun</p>
        </div>
        <div style="padding: 40px; background: #fff;">
            <h2>Bonjour {full_name},</h2>
            <p>Votre demande de vérification de boutique n'a pas pu être validée pour la raison suivante :</p>
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b;">{reason}</p>
            </div>
            <p>Merci de renvoyer des documents <strong>valides et lisibles</strong> (CNI ou passeport, ainsi que votre attestation d'immatriculation) depuis votre espace vendeuse.</p>
            <p style="color: #666;">Notre équipe les examinera à nouveau dans les meilleurs délais.</p>
        </div>
        <div style="background: #f9f9f9; padding: 20px; text-align: center; color: #999;">
            <p>© 2025 Elles Market — Cameroun 🇨🇲</p>
        </div>
    </div>
    """
    resend.Emails.send({
        "from": SENDER,
        "to": [to_email],
        "subject": "Documents à renvoyer — Elles Market",
        "html": html,
    })