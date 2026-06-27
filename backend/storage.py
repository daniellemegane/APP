"""Local file storage helper — replaces Emergent Object Storage."""
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

APP_NAME = os.environ.get("APP_NAME", "elles-market")

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def init_storage() -> str:
    UPLOAD_DIR.mkdir(exist_ok=True)
    return str(UPLOAD_DIR)


def put_object(path: str, data: bytes, content_type: str) -> dict:
    safe_path = path.replace("/", "_").replace("\\", "_")
    file_path = UPLOAD_DIR / safe_path
    file_path.write_bytes(data)
    logger.info(f"Saved file: {file_path}")
    return {"path": safe_path, "size": len(data)}


def get_object(path: str) -> tuple:
    safe_path = path.replace("/", "_").replace("\\", "_")
    file_path = UPLOAD_DIR / safe_path
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {safe_path}")
    ext = safe_path.rsplit(".", 1)[-1].lower() if "." in safe_path else "bin"
    content_types = {
        "jpg": "image/jpeg", "jpeg": "image/jpeg",
        "png": "image/png", "webp": "image/webp",
        "gif": "image/gif", "pdf": "application/pdf",
    }
    content_type = content_types.get(ext, "application/octet-stream")
    return file_path.read_bytes(), content_type