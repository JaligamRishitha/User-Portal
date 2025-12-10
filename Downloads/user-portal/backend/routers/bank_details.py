from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from schemas import BankDetailsResponse, BankDetailsUpdateRequest, GenericResponse
from database import get_db
from models import BankDetail, Vendor

router = APIRouter()

@router.get("/{vendor_id}", response_model=dict)
async def get_bank_details(vendor_id: str, db: Session = Depends(get_db)):
    """Get bank details by vendor ID"""
    try:
        query = text("""
            SELECT 
                bd.account_number as "accountNumber",
                bd.sort_code as "sortCode",
                bd.account_holder_name as "accountHolder",
                bd.payment_method as "paymentMethod",
                v.email,
                v.mobile
            FROM bank_details bd
            LEFT JOIN vendors v ON bd.vendor_id = v.vendor_id
            WHERE bd.vendor_id = :vendor_id
        """)
        
        result = db.execute(query, {"vendor_id": vendor_id}).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Bank details not found")
        
        return {
            "success": True,
            "data": {
                "accountNumber": result[0],
                "sortCode": result[1],
                "accountHolder": result[2],
                "paymentMethod": result[3],
                "email": result[4],
                "mobile": result[5]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{vendor_id}", response_model=GenericResponse)
async def update_bank_details(
    vendor_id: str,
    request: BankDetailsUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update bank details"""
    try:
        # Update bank details
        bank_detail = db.query(BankDetail).filter(BankDetail.vendor_id == vendor_id).first()
        
        if not bank_detail:
            raise HTTPException(status_code=404, detail="Bank details not found")
        
        if request.sortCode:
            bank_detail.sort_code = request.sortCode
        if request.accountNumber:
            bank_detail.account_number = request.accountNumber
        if request.accountHolder:
            bank_detail.account_holder_name = request.accountHolder
        if request.paymentMethod:
            bank_detail.payment_method = request.paymentMethod
        
        # Update vendor email and mobile if provided
        if request.email or request.mobile:
            vendor = db.query(Vendor).filter(Vendor.vendor_id == vendor_id).first()
            if vendor:
                if request.email:
                    vendor.email = request.email
                if request.mobile:
                    vendor.mobile = request.mobile
        
        db.commit()
        
        return GenericResponse(
            success=True,
            message="Bank details updated successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
