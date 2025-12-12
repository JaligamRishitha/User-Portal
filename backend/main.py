from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import auth, users, bank_details, payment_history, upcoming_payments, moving_house, remittance, admin, ocr, reports, user_agreement
import os

app = FastAPI(
    title="UKPN Power Portal API",
    description="Backend API for UKPN Power Portal",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create documents directory if it doesn't exist
os.makedirs("documents/geographical", exist_ok=True)
os.makedirs("documents/remittance", exist_ok=True)
os.makedirs("documents/user_agreements", exist_ok=True)

# Mount static files for document serving
app.mount("/documents", StaticFiles(directory="documents"), name="documents")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(bank_details.router, prefix="/api/bank-details", tags=["Bank Details"])
app.include_router(payment_history.router, prefix="/api/payment-history", tags=["Payment History"])
app.include_router(upcoming_payments.router, prefix="/api/upcoming-payments", tags=["Upcoming Payments"])
app.include_router(moving_house.router, prefix="/api", tags=["Moving House"])
app.include_router(remittance.router, prefix="/api", tags=["Remittance"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])
app.include_router(ocr.router, prefix="/api", tags=["OCR"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(user_agreement.router, tags=["User Agreement"])

@app.get("/api/health")
async def health_check():
    return {
        "status": "OK",
        "message": "UKPN API is running"
    }

@app.get("/")
async def root():
    return {
        "message": "UKPN Power Portal API",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
