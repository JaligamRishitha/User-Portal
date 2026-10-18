from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
import os
import shutil
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = "documents/user_agreements"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/api/user-agreement/upload/{vendor_id}")
async def upload_user_agreement(
    vendor_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload user agreement document for a specific vendor
    """
    try:
        # Validate file type
        allowed_extensions = ['.pdf', '.doc', '.docx']
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Create unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"user_agreement_{vendor_id}_{timestamp}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Update database
        file_url = f"/documents/user_agreements/{filename}"
        
        query = text("""
            UPDATE user_details 
            SET user_agreement_url = :file_url 
            WHERE vendor_id = :vendor_id
        """)
        
        result = db.execute(query, {"file_url": file_url, "vendor_id": vendor_id})
        db.commit()
        
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Vendor not found")
        
        return {
            "success": True,
            "message": "User agreement uploaded successfully",
            "file_url": file_url,
            "vendor_id": vendor_id
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/user-agreement/{vendor_id}")
async def get_user_agreement(vendor_id: str, db: Session = Depends(get_db)):
    """
    Get user agreement URL for a specific vendor
    """
    try:
        query = text("""
            SELECT user_agreement_url 
            FROM user_details 
            WHERE vendor_id = :vendor_id
        """)
        
        result = db.execute(query, {"vendor_id": vendor_id}).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Vendor not found")
        
        if not result[0]:
            return {
                "success": True,
                "has_agreement": False,
                "file_url": None
            }
        
        return {
            "success": True,
            "has_agreement": True,
            "file_url": result[0]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/api/user-agreement/{vendor_id}")
async def delete_user_agreement(vendor_id: str, db: Session = Depends(get_db)):
    """
    Delete user agreement for a specific vendor
    """
    try:
        # Get current file URL
        query = text("SELECT user_agreement_url FROM user_details WHERE vendor_id = :vendor_id")
        result = db.execute(query, {"vendor_id": vendor_id}).fetchone()
        
        if not result or not result[0]:
            raise HTTPException(status_code=404, detail="No user agreement found")
        
        # Delete file from filesystem
        file_path = result[0].replace("/documents/user_agreements/", "")
        full_path = os.path.join(UPLOAD_DIR, file_path)
        
        if os.path.exists(full_path):
            os.remove(full_path)
        
        # Update database
        update_query = text("""
            UPDATE user_details 
            SET user_agreement_url = NULL 
            WHERE vendor_id = :vendor_id
        """)
        db.execute(update_query, {"vendor_id": vendor_id})
        db.commit()
        
        return {
            "success": True,
            "message": "User agreement deleted successfully"
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
