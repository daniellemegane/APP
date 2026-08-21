"""Cloudflare R2 storage helper (S3-compatible) — remplace le stockage local."""
import os
import logging
import boto3
from botocore.client import Config

logger = logging.getLogger(__name__)

APP_NAME = os.environ.get("APP_NAME", "elles-market")

R2_ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID")
R2_ACCESS_KEY_ID = os.environ.get("R2_ACCESS_KEY_ID")
R2_SECRET_ACCESS_KEY = os.environ.get("R2_SECRET_ACCESS_KEY")
R2_BUCKET_NAME = os.environ.get("R2_BUCKET_NAME", "elles-market-uploads")
R2_ENDPOINT_URL = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = boto3.client(
            "s3",
            endpoint_url=R2_ENDPOINT_URL,
            aws_access_key_id=R2_ACCESS_KEY_ID,
            aws_secret_access_key=R2_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
            region_name="auto",
        )
    return _client


def init_storage() -> str:
    """Vérifie que le bucket est accessible au démarrage."""
    client = _get_client()
    client.head_bucket(Bucket=R2_BUCKET_NAME)
    logger.info(f"R2 storage initialized, bucket: {R2_BUCKET_NAME}")
    return R2_BUCKET_NAME


def put_object(path: str, data: bytes, content_type: str) -> dict:
    client = _get_client()
    client.put_object(
        Bucket=R2_BUCKET_NAME,
        Key=path,
        Body=data,
        ContentType=content_type,
    )
    logger.info(f"Saved to R2: {path}")
    return {"path": path, "size": len(data)}


def get_object(path: str) -> tuple:
    client = _get_client()
    try:
        response = client.get_object(Bucket=R2_BUCKET_NAME, Key=path)
    except client.exceptions.NoSuchKey:
        raise FileNotFoundError(f"File not found: {path}")
    data = response["Body"].read()
    content_type = response.get("ContentType", "application/octet-stream")
    return data, content_type
