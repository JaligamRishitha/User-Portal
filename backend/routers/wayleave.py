from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import WayleaveAgreement
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class WayleaveAgreementCreate(BaseModel):
    filename: str
    grantor_name: Optional[str] = None
    grantor_address: Optional[str] = None
    grantor_postcode: Optional[str] = None
    grantor_telephone: Optional[str] = None
    grantor_email: Optional[str] = None
    agreement_date: Optional[str] = None
    agreement_ref: Optional[str] = None
    company_with: Optional[str] = None
    tq_number: Optional[str] = None
    payment: Optional[str] = None
    duration: Optional[str] = None
    property_location: Optional[str] = None
    works_description: Optional[str] = None
    drawing_number: Optional[str] = None
    extracted_text: Optional[str] = None


@router.post("/admin/wayleave-agreements")
async def create_wayleave_agreement(
    agreement: WayleaveAgreementCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new wayleave agreement record
    """
    try:
        logger.info(f"Creating wayleave agreement for file: {agreement.filename}")
        
        new_agreement = WayleaveAgreement(
            filename=agreement.filename,
            grantor_name=agreement.grantor_name,
            grantor_address=agreement.grantor_address,
            grantor_postcode=agreement.grantor_postcode,
            grantor_telephone=agreement.grantor_telephone,
            grantor_email=agreement.grantor_email,
            agreement_date=agreement.agreement_date,
            agreement_ref=agreement.agreement_ref,
            company_with=agreement.company_with,
            tq_number=agreement.tq_number,
            payment=agreement.payment,
            duration=agreement.duration,
            property_location=agreement.property_location,
            works_description=agreement.works_description,
            drawing_number=agreement.drawing_number,
            extracted_text=agreement.extracted_text
        )
        
        db.add(new_agreement)
        db.commit()
        db.refresh(new_agreement)
        
        logger.info(f"Wayleave agreement created with ID: {new_agreement.id}")
        
        return JSONResponse(content={
            "id": new_agreement.id,
            "filename": new_agreement.filename,
            "grantor_name": new_agreement.grantor_name,
            "grantor_address": new_agreement.grantor_address,
            "grantor_postcode": new_agreement.grantor_postcode,
            "grantor_telephone": new_agreement.grantor_telephone,
            "grantor_email": new_agreement.grantor_email,
            "agreement_date": new_agreement.agreement_date,
            "agreement_ref": new_agreement.agreement_ref,
            "company_with": new_agreement.company_with,
            "tq_number": new_agreement.tq_number,
            "payment": new_agreement.payment,
            "duration": new_agreement.duration,
            "property_location": new_agreement.property_location,
            "works_description": new_agreement.works_description,
            "drawing_number": new_agreement.drawing_number,
            "created_at": new_agreement.created_at.isoformat() if new_agreement.created_at else None
        })
        
    except Exception as e:
        logger.error(f"Error creating wayleave agreement: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/wayleave-agreements")
async def get_wayleave_agreements(db: Session = Depends(get_db)):
    """
    Get all wayleave agreements
    """
    try:
        agreements = db.query(WayleaveAgreement).order_by(WayleaveAgreement.created_at.desc()).all()
        
        return JSONResponse(content=[{
            "id": agreement.id,
            "filename": agreement.filename,
            "grantor_name": agreement.grantor_name,
            "grantor_address": agreement.grantor_address,
            "grantor_postcode": agreement.grantor_postcode,
            "grantor_telephone": agreement.grantor_telephone,
            "grantor_email": agreement.grantor_email,
            "agreement_date": agreement.agreement_date,
            "agreement_ref": agreement.agreement_ref,
            "company_with": agreement.company_with,
            "tq_number": agreement.tq_number,
            "payment": agreement.payment,
            "duration": agreement.duration,
            "property_location": agreement.property_location,
            "works_description": agreement.works_description,
            "drawing_number": agreement.drawing_number,
            "created_at": agreement.created_at.isoformat() if agreement.created_at else None
        } for agreement in agreements])
        
    except Exception as e:
        logger.error(f"Error fetching wayleave agreements: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/wayleave-agreements/{agreement_id}")
async def get_wayleave_agreement(agreement_id: int, db: Session = Depends(get_db)):
    """
    Get a specific wayleave agreement by ID
    """
    try:
        agreement = db.query(WayleaveAgreement).filter(WayleaveAgreement.id == agreement_id).first()
        
        if not agreement:
            raise HTTPException(status_code=404, detail="Wayleave agreement not found")
        
        return JSONResponse(content={
            "id": agreement.id,
            "filename": agreement.filename,
            "grantor_name": agreement.grantor_name,
            "grantor_address": agreement.grantor_address,
            "grantor_postcode": agreement.grantor_postcode,
            "grantor_telephone": agreement.grantor_telephone,
            "grantor_email": agreement.grantor_email,
            "agreement_date": agreement.agreement_date,
            "agreement_ref": agreement.agreement_ref,
            "company_with": agreement.company_with,
            "tq_number": agreement.tq_number,
            "payment": agreement.payment,
            "duration": agreement.duration,
            "property_location": agreement.property_location,
            "works_description": agreement.works_description,
            "drawing_number": agreement.drawing_number,
            "extracted_text": agreement.extracted_text,
            "created_at": agreement.created_at.isoformat() if agreement.created_at else None
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching wayleave agreement: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/admin/wayleave-agreements/{agreement_id}")
async def delete_wayleave_agreement(agreement_id: int, db: Session = Depends(get_db)):
    """
    Delete a wayleave agreement
    """
    try:
        agreement = db.query(WayleaveAgreement).filter(WayleaveAgreement.id == agreement_id).first()
        
        if not agreement:
            raise HTTPException(status_code=404, detail="Wayleave agreement not found")
        
        db.delete(agreement)
        db.commit()
        
        logger.info(f"Wayleave agreement {agreement_id} deleted")
        
        return JSONResponse(content={"message": "Wayleave agreement deleted successfully"})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting wayleave agreement: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
