from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class MovingHouseRequest(BaseModel):
    vendor_id: str
    old_address: str
    old_postcode: str
    new_address: str
    new_postcode: str
    new_owner_name: str
    new_owner_email: EmailStr
    new_owner_mobile: str


@router.post("/moving-house")
async def submit_moving_house(request: MovingHouseRequest, db: Session = Depends(get_db)):
    """
    Submit a moving house notification with new address and new owner details
    """
    try:
        # Insert moving house record
        query = text("""
            INSERT INTO moving_house_notifications (
                vendor_id,
                old_address,
                old_postcode,
                new_address,
                new_postcode,
                new_owner_name,
                new_owner_email,
                new_owner_mobile,
                submission_date,
                status
            ) VALUES (
                :vendor_id,
                :old_address,
                :old_postcode,
                :new_address,
                :new_postcode,
                :new_owner_name,
                :new_owner_email,
                :new_owner_mobile,
                :submission_date,
                :status
            )
        """)

        result = db.execute(query, {
            "vendor_id": request.vendor_id,
            "old_address": request.old_address,
            "old_postcode": request.old_postcode,
            "new_address": request.new_address,
            "new_postcode": request.new_postcode,
            "new_owner_name": request.new_owner_name,
            "new_owner_email": request.new_owner_email,
            "new_owner_mobile": request.new_owner_mobile,
            "submission_date": datetime.now().isoformat(),
            "status": "pending"
        })

        db.commit()
        notification_id = result.lastrowid

        logger.info(f"Moving house notification submitted for vendor {request.vendor_id}")

        return {
            "success": True,
            "message": "Moving house notification submitted successfully",
            "notification_id": notification_id
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error submitting moving house notification: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/moving-house/{vendor_id}")
async def get_moving_house_notifications(vendor_id: str, db: Session = Depends(get_db)):
    """
    Get all moving house notifications for a vendor
    """
    try:
        query = text("""
            SELECT 
                id,
                vendor_id,
                old_address,
                old_postcode,
                new_address,
                new_postcode,
                new_owner_name,
                new_owner_email,
                new_owner_mobile,
                submission_date,
                status
            FROM moving_house_notifications
            WHERE vendor_id = :vendor_id
            ORDER BY submission_date DESC
        """)

        result = db.execute(query, {"vendor_id": vendor_id})
        rows = result.fetchall()
        
        notifications = []
        for row in rows:
            notifications.append({
                "id": row[0],
                "vendor_id": row[1],
                "old_address": row[2],
                "old_postcode": row[3],
                "new_address": row[4],
                "new_postcode": row[5],
                "new_owner_name": row[6],
                "new_owner_email": row[7],
                "new_owner_mobile": row[8],
                "submission_date": row[9],
                "status": row[10]
            })

        return {
            "success": True,
            "notifications": notifications
        }

    except Exception as e:
        logger.error(f"Error fetching moving house notifications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
