from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db
from config import get_settings, Settings
from pydantic import BaseModel
from typing import List, Optional
import logging
import os
from datetime import datetime
import shutil

router = APIRouter()
logger = logging.getLogger(__name__)


# Pydantic models for request/response
class GeographicalDocument(BaseModel):
    postcode: str
    document_name: str
    document_url: Optional[str] = None
    document_type: Optional[str] = "PDF"
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class RemittanceDocument(BaseModel):
    fiscal_year: int
    document_name: str
    document_url: Optional[str] = None
    document_type: Optional[str] = "PDF"
    upload_date: Optional[str] = None


async def geocode_postcode(postcode: str, api_key: str) -> tuple:
    """
    Get latitude and longitude from postcode using Google Geocoding API
    """
    try:
        import httpx
        
        # Format postcode for UK (add space if needed)
        formatted_postcode = postcode.upper()
        if len(formatted_postcode) > 3 and ' ' not in formatted_postcode:
            formatted_postcode = f"{formatted_postcode[:-3]} {formatted_postcode[-3:]}"
        
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            "address": f"{formatted_postcode}, UK",
            "key": api_key
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()
            
            if data.get("status") == "OK" and data.get("results"):
                location = data["results"][0]["geometry"]["location"]
                return location["lat"], location["lng"]
            else:
                logger.warning(f"Geocoding failed for {postcode}: {data.get('status')}")
                return None, None
                
    except Exception as e:
        logger.error(f"Error geocoding postcode {postcode}: {str(e)}")
        return None, None


@router.post("/admin/reports/geographical/upload")
async def upload_geographical_document(
    postcode: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings)
):
    """
    Upload a geographical document file with postcode
    Automatically geocodes the postcode and saves the file
    """
    try:
        logger.info(f"Received upload request - Postcode: {postcode}, File: {file.filename}, Content-Type: {file.content_type}")
        # Clean postcode
        clean_postcode = postcode.upper().replace(" ", "")
        
        # Create upload directory if it doesn't exist
        upload_dir = "documents/geographical"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(file.filename)[1]
        safe_filename = f"{clean_postcode}_{timestamp}{file_extension}"
        file_path = os.path.join(upload_dir, safe_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"File saved: {file_path}")
        
        # Get coordinates
        logger.info(f"Geocoding postcode: {clean_postcode}")
        latitude, longitude = await geocode_postcode(clean_postcode, settings.google_maps_api_key)
        
        if latitude is None or longitude is None:
            logger.warning(f"Could not geocode postcode {clean_postcode}, using default London coordinates")
            latitude = 51.5074
            longitude = -0.1278
        
        # Determine document type from file extension
        document_type = file_extension.upper().replace(".", "")
        
        # Insert into database
        insert_query = text("""
            INSERT INTO geographical_documents 
            (postcode, document_name, document_url, document_type, latitude, longitude, created_at)
            VALUES (:postcode, :document_name, :document_url, :document_type, :latitude, :longitude, NOW())
            RETURNING id
        """)
        
        result = db.execute(insert_query, {
            "postcode": clean_postcode,
            "document_name": file.filename,
            "document_url": f"/{file_path}",
            "document_type": document_type,
            "latitude": latitude,
            "longitude": longitude
        })
        
        doc_id = result.fetchone()[0]
        db.commit()
        
        return JSONResponse(content={
            "success": True,
            "message": "Document uploaded successfully",
            "document_id": doc_id,
            "file_path": file_path,
            "geocoded": {
                "latitude": latitude,
                "longitude": longitude
            }
        })
        
    except Exception as e:
        logger.error(f"Error uploading geographical document: {str(e)}")
        db.rollback()
        # Clean up file if database insert failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/reports/geographical")
async def add_geographical_document(doc: GeographicalDocument, db: Session = Depends(get_db), settings: Settings = Depends(get_settings)):
    """
    Add a geographical document linked to a postcode
    Automatically geocodes the postcode if latitude/longitude not provided
    """
    try:
        # Clean postcode
        clean_postcode = doc.postcode.upper().replace(" ", "")
        
        # Get coordinates if not provided
        latitude = doc.latitude
        longitude = doc.longitude
        
        if latitude is None or longitude is None:
            logger.info(f"Geocoding postcode: {clean_postcode}")
            latitude, longitude = await geocode_postcode(clean_postcode, settings.google_maps_api_key)
            
            if latitude is None or longitude is None:
                logger.warning(f"Could not geocode postcode {clean_postcode}, using default London coordinates")
                latitude = 51.5074
                longitude = -0.1278
        
        # Insert geographical document
        insert_query = text("""
            INSERT INTO geographical_documents 
            (postcode, document_name, document_url, document_type, latitude, longitude, created_at)
            VALUES (:postcode, :document_name, :document_url, :document_type, :latitude, :longitude, NOW())
            RETURNING id
        """)
        
        result = db.execute(insert_query, {
            "postcode": clean_postcode,
            "document_name": doc.document_name,
            "document_url": doc.document_url,
            "document_type": doc.document_type,
            "latitude": latitude,
            "longitude": longitude
        })
        
        doc_id = result.fetchone()[0]
        db.commit()
        
        return JSONResponse(content={
            "success": True,
            "message": "Geographical document added successfully",
            "document_id": doc_id,
            "geocoded": {
                "latitude": latitude,
                "longitude": longitude
            }
        })
        
    except Exception as e:
        logger.error(f"Error adding geographical document: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/reports/geographical/{postcode}")
async def get_geographical_documents(postcode: str, db: Session = Depends(get_db)):
    """
    Get all documents for a specific postcode
    """
    try:
        # Clean postcode
        clean_postcode = postcode.upper().replace(" ", "")
        
        # Get documents for postcode
        query = text("""
            SELECT 
                id,
                postcode,
                document_name,
                document_url,
                document_type,
                latitude,
                longitude,
                created_at
            FROM geographical_documents
            WHERE postcode = :postcode
            ORDER BY created_at DESC
        """)
        
        results = db.execute(query, {"postcode": clean_postcode}).fetchall()
        
        documents = []
        for row in results:
            documents.append({
                "id": row[0],
                "postcode": row[1],
                "document_name": row[2],
                "document_url": row[3],
                "document_type": row[4],
                "latitude": float(row[5]) if row[5] else None,
                "longitude": float(row[6]) if row[6] else None,
                "created_at": row[7].isoformat() if row[7] else None
            })
        
        # Get count
        count_query = text("""
            SELECT COUNT(*) FROM geographical_documents WHERE postcode = :postcode
        """)
        count = db.execute(count_query, {"postcode": clean_postcode}).fetchone()[0]
        
        return JSONResponse(content={
            "success": True,
            "postcode": postcode,
            "count": count,
            "documents": documents,
            "location": {
                "latitude": documents[0]["latitude"] if documents and documents[0]["latitude"] else 51.5074,
                "longitude": documents[0]["longitude"] if documents and documents[0]["longitude"] else -0.1278
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching geographical documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/reports/remittance/upload")
async def upload_remittance_document(
    fiscal_year: int = Form(...),
    file: UploadFile = File(...),
    upload_date: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload a remittance document file for a fiscal year
    """
    try:
        # Create upload directory if it doesn't exist
        upload_dir = f"documents/remittance/{fiscal_year}"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(file.filename)[1]
        safe_filename = f"{fiscal_year}_{timestamp}{file_extension}"
        file_path = os.path.join(upload_dir, safe_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"File saved: {file_path}")
        
        # Determine document type from file extension
        document_type = file_extension.upper().replace(".", "")
        
        # Insert into database
        insert_query = text("""
            INSERT INTO remittance_reports 
            (fiscal_year, document_name, document_url, document_type, upload_date, created_at)
            VALUES (:fiscal_year, :document_name, :document_url, :document_type, :upload_date, NOW())
            RETURNING id
        """)
        
        result = db.execute(insert_query, {
            "fiscal_year": fiscal_year,
            "document_name": file.filename,
            "document_url": f"/{file_path}",
            "document_type": document_type,
            "upload_date": upload_date
        })
        
        doc_id = result.fetchone()[0]
        db.commit()
        
        return JSONResponse(content={
            "success": True,
            "message": "Document uploaded successfully",
            "document_id": doc_id,
            "file_path": file_path
        })
        
    except Exception as e:
        logger.error(f"Error uploading remittance document: {str(e)}")
        db.rollback()
        # Clean up file if database insert failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/reports/remittance")
async def add_remittance_document(doc: RemittanceDocument, db: Session = Depends(get_db)):
    """
    Add a remittance document for a fiscal year
    """
    try:
        # Insert remittance document
        insert_query = text("""
            INSERT INTO remittance_reports 
            (fiscal_year, document_name, document_url, document_type, upload_date, created_at)
            VALUES (:fiscal_year, :document_name, :document_url, :document_type, :upload_date, NOW())
            RETURNING id
        """)
        
        result = db.execute(insert_query, {
            "fiscal_year": doc.fiscal_year,
            "document_name": doc.document_name,
            "document_url": doc.document_url,
            "document_type": doc.document_type,
            "upload_date": doc.upload_date
        })
        
        doc_id = result.fetchone()[0]
        db.commit()
        
        return JSONResponse(content={
            "success": True,
            "message": "Remittance document added successfully",
            "document_id": doc_id
        })
        
    except Exception as e:
        logger.error(f"Error adding remittance document: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/reports/remittance/{fiscal_year}")
async def get_remittance_documents(fiscal_year: int, db: Session = Depends(get_db)):
    """
    Get all remittance documents for a specific fiscal year
    """
    try:
        # Get documents for fiscal year
        query = text("""
            SELECT 
                id,
                fiscal_year,
                document_name,
                document_url,
                document_type,
                upload_date,
                created_at
            FROM remittance_reports
            WHERE fiscal_year = :fiscal_year
            ORDER BY created_at DESC
        """)
        
        results = db.execute(query, {"fiscal_year": fiscal_year}).fetchall()
        
        documents = []
        for row in results:
            documents.append({
                "id": row[0],
                "fiscal_year": row[1],
                "document_name": row[2],
                "document_url": row[3],
                "document_type": row[4],
                "upload_date": row[5].isoformat() if row[5] else None,
                "created_at": row[6].isoformat() if row[6] else None
            })
        
        # Get count
        count_query = text("""
            SELECT COUNT(*) FROM remittance_reports WHERE fiscal_year = :fiscal_year
        """)
        count = db.execute(count_query, {"fiscal_year": fiscal_year}).fetchone()[0]
        
        return JSONResponse(content={
            "success": True,
            "fiscal_year": fiscal_year,
            "count": count,
            "documents": documents
        })
        
    except Exception as e:
        logger.error(f"Error fetching remittance documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/reports/test-upload")
async def test_upload(
    postcode: str = Form(None),
    file: UploadFile = File(None)
):
    """
    Test endpoint to verify file upload is working
    """
    logger.info(f"Test upload called - postcode: {postcode}, file: {file}")
    
    if not postcode:
        return JSONResponse(status_code=400, content={"error": "postcode is missing"})
    
    if not file:
        return JSONResponse(status_code=400, content={"error": "file is missing"})
    
    return JSONResponse(content={
        "success": True,
        "postcode": postcode,
        "filename": file.filename,
        "content_type": file.content_type
    })


@router.get("/admin/reports/stats")
async def get_reports_stats(db: Session = Depends(get_db)):
    """
    Get statistics for reports dashboard
    """
    try:
        # Get geographical stats
        geo_stats_query = text("""
            SELECT 
                COUNT(DISTINCT postcode) as unique_postcodes,
                COUNT(*) as total_documents
            FROM geographical_documents
        """)
        geo_stats = db.execute(geo_stats_query).fetchone()
        
        # Get remittance stats
        rem_stats_query = text("""
            SELECT 
                COUNT(DISTINCT fiscal_year) as unique_years,
                COUNT(*) as total_documents
            FROM remittance_reports
        """)
        rem_stats = db.execute(rem_stats_query).fetchone()
        
        return JSONResponse(content={
            "success": True,
            "geographical": {
                "unique_postcodes": geo_stats[0] if geo_stats else 0,
                "total_documents": geo_stats[1] if geo_stats else 0
            },
            "remittance": {
                "unique_years": rem_stats[0] if rem_stats else 0,
                "total_documents": rem_stats[1] if rem_stats else 0
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching reports stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
