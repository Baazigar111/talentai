import os
import uuid
from fastapi import UploadFile, HTTPException

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB

async def save_upload_file(file: UploadFile, upload_dir: str) -> tuple[str, str]:
    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files allowed")

    # Read and validate size
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB allowed")

    # Save with unique name
    unique_name = f"{uuid.uuid4()}{ext}"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, unique_name)

    with open(file_path, "wb") as f:
        f.write(content)

    return file_path, unique_name