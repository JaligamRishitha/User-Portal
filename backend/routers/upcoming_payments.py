from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from schemas import UpcomingPaymentsResponse, AgreementBreakdownResponse
from database import get_db

router = APIRouter()

@router.get("/{vendor_id}", response_model=dict)
async def get_upcoming_payments(vendor_id: str, db: Session = Depends(get_db)):
    """Get upcoming payments (agreements) by vendor ID"""
    try:
        query = text("""
            SELECT 
                psh.agreement_number as "id",
                psh.agreement_type as "agreementType",
                psh.location,
                TO_CHAR(psh.last_payment_date, 'DD/MM/YYYY') as "lastPaid",
                TO_CHAR(psh.next_payment_date, 'DD/MM/YYYY') as "nextPay",
                CONCAT('£', psh.total_consent) as "lastRent",
                psh.last_payment_date as "leaseStart"
            FROM payment_schedule_headers psh
            WHERE psh.vendor_id = :vendor_id
            ORDER BY psh.next_payment_date DESC
        """)
        
        result = db.execute(query, {"vendor_id": vendor_id}).fetchall()
        
        data = []
        for row in result:
            data.append({
                "id": row[0],
                "agreementType": row[1],
                "location": row[2],
                "lastPaid": row[3],
                "nextPay": row[4],
                "lastRent": row[5],
                "leaseStart": row[6].isoformat() if row[6] else None
            })
        
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{vendor_id}/agreement/{agreement_number}", response_model=dict)
async def get_agreement_breakdown(
    vendor_id: str,
    agreement_number: str,
    db: Session = Depends(get_db)
):
    """Get agreement breakdown (items) by agreement number"""
    try:
        query = text("""
            SELECT 
                psi.item_number as "itemNo",
                psi.land_reg_number as "landRegNo",
                psi.asset_type as "assetType",
                psi.asset_number as "assetNo",
                psi.short_text as "shortText",
                psi.multiplier,
                psi.rental,
                psi.compensation
            FROM payment_schedule_items psi
            WHERE psi.agreement_number = :agreement_number
            ORDER BY psi.item_number
        """)
        
        result = db.execute(query, {"agreement_number": agreement_number}).fetchall()
        
        items = []
        total_rental = 0
        total_compensation = 0
        
        for row in result:
            rental = float(row[6]) if row[6] else 0
            compensation = float(row[7]) if row[7] else 0
            
            items.append({
                "itemNo": row[0],
                "landRegNo": row[1],
                "assetType": row[2],
                "assetNo": row[3],
                "shortText": row[4],
                "multiplier": float(row[5]) if row[5] else 0,
                "rental": rental,
                "compensation": compensation
            })
            
            total_rental += rental
            total_compensation += compensation
        
        return {
            "success": True,
            "data": {
                "items": items,
                "totals": {
                    "rental": total_rental,
                    "compensation": total_compensation
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
