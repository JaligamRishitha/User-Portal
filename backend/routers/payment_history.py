from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from schemas import PaymentHistoryResponse, PaymentSummary
from database import get_db

router = APIRouter()

@router.get("/{vendor_id}", response_model=dict)
async def get_payment_history(
    vendor_id: str,
    year: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get payment history by vendor ID with optional year filter"""
    try:
        query_str = """
            SELECT 
                ph.purchase_order as "agreementNumber",
                v.first_name as "firstName",
                v.last_name as "lastName",
                ph.payment_method as "paymentType",
                ph.posting_date as "paymentDate",
                ph.cheque_number as "chequeNumber",
                ph.payment_amount as "chequeBACSAmount",
                ph.net_amount as "netInvoiceAmount",
                ph.rental_amount as "rental",
                ph.compensation_amount as "compensation",
                ph.lease_amount as "leaseAmount",
                ph.gross_amount as "grossInvoiceAmount",
                ph.encashment_date as "encashmentDate"
            FROM payment_history ph
            LEFT JOIN vendors v ON ph.vendor_id = v.vendor_id
            WHERE ph.vendor_id = :vendor_id
        """
        
        params = {"vendor_id": vendor_id}
        
        if year:
            query_str += " AND ph.fiscal_year = :year"
            params["year"] = year
        
        query_str += " ORDER BY ph.posting_date DESC"
        
        result = db.execute(text(query_str), params).fetchall()
        
        data = []
        for row in result:
            data.append({
                "agreementNumber": row[0],
                "firstName": row[1],
                "lastName": row[2],
                "paymentType": row[3],
                "paymentDate": row[4].isoformat() if row[4] else None,
                "chequeNumber": row[5],
                "chequeBACSAmount": float(row[6]) if row[6] else None,
                "netInvoiceAmount": float(row[7]) if row[7] else None,
                "rental": float(row[8]) if row[8] else None,
                "compensation": float(row[9]) if row[9] else None,
                "leaseAmount": float(row[10]) if row[10] else None,
                "grossInvoiceAmount": float(row[11]) if row[11] else None,
                "encashmentDate": row[12].isoformat() if row[12] else None
            })
        
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{vendor_id}/summary", response_model=dict)
async def get_payment_summary(vendor_id: str, db: Session = Depends(get_db)):
    """Get payment summary by vendor ID"""
    try:
        query = text("""
            SELECT 
                COUNT(*) as total_payments,
                SUM(payment_amount) as total_amount,
                SUM(rental_amount) as total_rental,
                SUM(compensation_amount) as total_compensation,
                MAX(posting_date) as last_payment_date
            FROM payment_history
            WHERE vendor_id = :vendor_id
        """)
        
        result = db.execute(query, {"vendor_id": vendor_id}).fetchone()
        
        return {
            "success": True,
            "data": {
                "total_payments": result[0],
                "total_amount": float(result[1]) if result[1] else 0,
                "total_rental": float(result[2]) if result[2] else 0,
                "total_compensation": float(result[3]) if result[3] else 0,
                "last_payment_date": result[4].isoformat() if result[4] else None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
