from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from schemas import UserDetailsResponse, UserUpdateRequest, GenericResponse
from database import get_db
from models import Vendor, UserDetail
from email_service import send_update_notification

router = APIRouter()

@router.get("/{vendor_id}", response_model=dict)
async def get_user_details(vendor_id: str, db: Session = Depends(get_db)):
    """Get user details by vendor ID"""
    try:
        query = text("""
            SELECT 
                v.vendor_id as "grantorNumber",
                CONCAT(v.first_name, ' ', v.last_name) as name,
                v.email,
                v.mobile,
                v.telephone,
                CONCAT(ud.street, ', ', ud.address_line1, ', ', ud.address_line2, ', ', ud.city, ', ', ud.postcode) as address
            FROM vendors v
            LEFT JOIN user_details ud ON v.vendor_id = ud.vendor_id
            WHERE v.vendor_id = :vendor_id
        """)
        
        result = db.execute(query, {"vendor_id": vendor_id}).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "success": True,
            "data": {
                "grantorNumber": result[0],
                "name": result[1],
                "email": result[2],
                "mobile": result[3],
                "telephone": result[4],
                "address": result[5]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{vendor_id}", response_model=GenericResponse)
async def update_user_details(
    vendor_id: str,
    request: UserUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update user details"""
    try:
        updated_fields = {}
        user_name = ""
        
        # Update vendor table
        if request.name:
            name_parts = request.name.split(' ', 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            user_name = request.name
            
            vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()
            if vendor:
                if request.name:
                    vendor.first_name = first_name
                    vendor.last_name = last_name
                    updated_fields['Name'] = request.name
                if request.email:
                    vendor.email = request.email
                    updated_fields['Email'] = request.email
                if request.mobile:
                    vendor.mobile = request.mobile
                    updated_fields['Mobile Number'] = request.mobile
                if request.telephone:
                    vendor.telephone = request.telephone
                    updated_fields['Telephone'] = request.telephone
        
        # Update address if provided
        if request.address:
            address_parts = [part.strip() for part in request.address.split(',')]
            user_detail = db.query(UserDetail).filter(UserDetail.vendor_id == vendor_id).first()
            if user_detail:
                user_detail.street = address_parts[0] if len(address_parts) > 0 else ''
                user_detail.address_line1 = address_parts[1] if len(address_parts) > 1 else ''
                user_detail.address_line2 = address_parts[2] if len(address_parts) > 2 else ''
                user_detail.city = address_parts[3] if len(address_parts) > 3 else ''
                user_detail.postcode = address_parts[4] if len(address_parts) > 4 else ''
                updated_fields['Address'] = request.address
        
        db.commit()
        
        # Send email notification
        if updated_fields:
            await send_update_notification(
                grantor_number=vendor_id,
                update_type="User Details",
                updated_fields=updated_fields,
                user_name=user_name
            )
        
        return GenericResponse(
            success=True,
            message="User details updated successfully"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
