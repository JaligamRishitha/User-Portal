from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users, bank_details, payment_history, upcoming_payments

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

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(bank_details.router, prefix="/api/bank-details", tags=["Bank Details"])
app.include_router(payment_history.router, prefix="/api/payment-history", tags=["Payment History"])
app.include_router(upcoming_payments.router, prefix="/api/upcoming-payments", tags=["Upcoming Payments"])

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
