from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
import httpx
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

OCR_BASE_URL = "http://149.102.158.71:2101"
OCR_USERNAME = "pradeep"
OCR_PASSWORD = "shibin"


@router.get("/admin/ocr/auth-url")
async def get_authenticated_ocr_url():
    """
    Authenticate with OCR service and return the authenticated URL or session token
    """
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
            # Try to login to the OCR service
            login_url = f"{OCR_BASE_URL}/login"
            
            # First, get the login page to check for CSRF tokens or session cookies
            login_page_response = await client.get(login_url)
            
            # Attempt login with credentials
            login_data = {
                "username": OCR_USERNAME,
                "password": OCR_PASSWORD
            }
            
            login_response = await client.post(
                login_url,
                data=login_data,
                headers={
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            )
            
            # Check if login was successful
            if login_response.status_code == 200 or login_response.status_code == 302:
                # Get cookies from the session
                cookies = dict(login_response.cookies)
                
                return JSONResponse(content={
                    "success": True,
                    "ocr_url": f"{OCR_BASE_URL}/ocr",
                    "cookies": cookies,
                    "message": "Authentication successful"
                })
            else:
                return JSONResponse(content={
                    "success": False,
                    "ocr_url": f"{OCR_BASE_URL}/ocr",
                    "message": "Auto-login not available, please login manually"
                })
                
    except Exception as e:
        logger.error(f"Error authenticating with OCR service: {str(e)}")
        return JSONResponse(content={
            "success": False,
            "ocr_url": f"{OCR_BASE_URL}/ocr",
            "message": "Could not authenticate automatically"
        })


@router.get("/admin/ocr/session-info")
async def get_ocr_session_info():
    """
    Get information about OCR service and credentials
    """
    return JSONResponse(content={
        "success": True,
        "ocr_url": f"{OCR_BASE_URL}/ocr",
        "login_url": f"{OCR_BASE_URL}/login",
        "credentials": {
            "username": OCR_USERNAME,
            "password": OCR_PASSWORD
        },
        "instructions": "Use these credentials to login to the OCR service"
    })
