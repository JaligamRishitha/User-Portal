from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
import httpx
import base64
import logging
from config import get_settings, Settings

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/admin/ocr/process")
async def process_ocr(file: UploadFile = File(...), settings: Settings = Depends(get_settings)):
    """
    Process uploaded file with OCR.space API
    Supports PDF, JPG, PNG formats
    """
    try:
        logger.info(f"Processing OCR for file: {file.filename}, type: {file.content_type}")
        # Validate file type
        allowed_types = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: PDF, JPG, PNG"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Encode file to base64
        base64_file = base64.b64encode(file_content).decode('utf-8')
        
        # Prepare OCR.space API request
        ocr_api_url = "https://api.ocr.space/parse/image"
        
        payload = {
            'base64Image': f'data:{file.content_type};base64,{base64_file}',
            'apikey': settings.ocr_api_key,
            'language': 'eng',
            'isOverlayRequired': False,
            'detectOrientation': True,
            'scale': True,
            'OCREngine': 2,  # Engine 2 is more accurate
            'filetype': file.content_type.split('/')[-1].upper()
        }
        
        # Make request to OCR.space API
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(ocr_api_url, data=payload)
            
            logger.info(f"OCR API Response Status: {response.status_code}")
            
            if response.status_code == 403:
                raise HTTPException(
                    status_code=403,
                    detail="OCR API key is invalid or expired. Please check your API key at https://ocr.space/ocrapi"
                )
            
            if response.status_code != 200:
                error_text = response.text
                logger.error(f"OCR API Error: {error_text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"OCR API request failed: {error_text}"
                )
            
            ocr_result = response.json()
            logger.info(f"OCR Result: {ocr_result}")
            
            # Check if OCR was successful
            if not ocr_result.get('IsErroredOnProcessing', True):
                parsed_results = ocr_result.get('ParsedResults', [])
                
                if parsed_results:
                    extracted_text = parsed_results[0].get('ParsedText', '')
                    
                    return JSONResponse(content={
                        'success': True,
                        'filename': file.filename,
                        'text': extracted_text,
                        'confidence': parsed_results[0].get('FileParseExitCode', 0),
                        'processing_time': ocr_result.get('ProcessingTimeInMilliseconds', 0),
                        'message': 'OCR processing completed successfully'
                    })
                else:
                    raise HTTPException(
                        status_code=500,
                        detail="No text found in the document"
                    )
            else:
                error_message = ocr_result.get('ErrorMessage', ['Unknown error'])[0]
                raise HTTPException(
                    status_code=500,
                    detail=f"OCR processing failed: {error_message}"
                )
                
    except httpx.TimeoutException as e:
        logger.error(f"OCR API request timed out: {str(e)}")
        raise HTTPException(
            status_code=504,
            detail="OCR processing timed out. Please try again."
        )
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logger.error(f"Error processing OCR: {str(e)}\n{error_details}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing OCR: {str(e)}"
        )


@router.get("/admin/ocr/history")
async def get_ocr_history():
    """
    Get recent OCR scan history
    TODO: Implement database storage for scan history
    """
    # Mock data for now - you can implement database storage later
    return JSONResponse(content={
        'success': True,
        'scans': [
            {
                'id': 1,
                'filename': 'invoice_2024_001.pdf',
                'processed_at': '2024-12-11T10:30:00',
                'status': 'Completed',
                'text_length': 1250
            },
            {
                'id': 2,
                'filename': 'contract_scan.jpg',
                'processed_at': '2024-12-11T09:15:00',
                'status': 'Completed',
                'text_length': 890
            }
        ]
    })


@router.get("/admin/ocr/test")
async def test_ocr_config(settings: Settings = Depends(get_settings)):
    """
    Test OCR configuration
    """
    return JSONResponse(content={
        'success': True,
        'api_key_configured': bool(settings.ocr_api_key),
        'api_key_length': len(settings.ocr_api_key) if settings.ocr_api_key else 0,
        'api_key_prefix': settings.ocr_api_key[:10] if settings.ocr_api_key else 'None'
    })
