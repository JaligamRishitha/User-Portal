from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal

# Auth Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: str
    user: dict

class Token(BaseModel):
    access_token: str
    token_type: str

# User Schemas
class UserDetailsResponse(BaseModel):
    grantorNumber: str
    name: str
    email: Optional[str]
    mobile: Optional[str]
    telephone: Optional[str]
    address: str

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    telephone: Optional[str] = None
    address: Optional[str] = None

# Bank Details Schemas
class BankDetailsResponse(BaseModel):
    accountNumber: Optional[str]
    sortCode: Optional[str]
    accountHolder: Optional[str]
    paymentMethod: Optional[str]
    email: Optional[str]
    mobile: Optional[str]

class BankDetailsUpdateRequest(BaseModel):
    sortCode: Optional[str] = None
    accountNumber: Optional[str] = None
    accountHolder: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    paymentMethod: Optional[str] = None

# Payment History Schemas
class PaymentHistoryItem(BaseModel):
    agreementNumber: str
    firstName: str
    lastName: str
    paymentType: str
    paymentDate: Optional[date]
    chequeNumber: Optional[str]
    chequeBACSAmount: Optional[Decimal]
    netInvoiceAmount: Optional[Decimal]
    rental: Optional[Decimal]
    compensation: Optional[Decimal]
    leaseAmount: Optional[Decimal]
    grossInvoiceAmount: Optional[Decimal]
    encashmentDate: Optional[date]

    class Config:
        from_attributes = True

class PaymentHistoryResponse(BaseModel):
    success: bool
    data: List[PaymentHistoryItem]

class PaymentSummary(BaseModel):
    total_payments: int
    total_amount: Optional[Decimal]
    total_rental: Optional[Decimal]
    total_compensation: Optional[Decimal]
    last_payment_date: Optional[date]

# Upcoming Payments Schemas
class UpcomingPaymentItem(BaseModel):
    id: str
    agreementType: str
    location: str
    lastPaid: str
    nextPay: str
    lastRent: str
    leaseStart: Optional[date]

class UpcomingPaymentsResponse(BaseModel):
    success: bool
    data: List[UpcomingPaymentItem]

class AgreementBreakdownItem(BaseModel):
    itemNo: str
    landRegNo: str
    assetType: str
    assetNo: str
    shortText: str
    multiplier: Decimal
    rental: Decimal
    compensation: Decimal

class AgreementBreakdownResponse(BaseModel):
    success: bool
    data: dict

# Generic Response
class GenericResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
