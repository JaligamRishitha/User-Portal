from sqlalchemy import Column, String, Integer, Numeric, Date, DateTime, ForeignKey, Text, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Vendor(Base):
    __tablename__ = "vendors"
    
    vendor_id = Column(String(20), primary_key=True)
    title = Column(String(10))
    first_name = Column(String(100))
    last_name = Column(String(100))
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255))
    mobile = Column(String(20))
    telephone = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user_details = relationship("UserDetail", back_populates="vendor", cascade="all, delete-orphan")
    bank_details = relationship("BankDetail", back_populates="vendor", cascade="all, delete-orphan")
    payment_history = relationship("PaymentHistory", back_populates="vendor", cascade="all, delete-orphan")
    payment_schedules = relationship("PaymentScheduleHeader", back_populates="vendor", cascade="all, delete-orphan")

class UserDetail(Base):
    __tablename__ = "user_details"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    vendor_id = Column(String(20), ForeignKey("vendors.vendor_id", ondelete="CASCADE"))
    street = Column(String(255))
    address_line1 = Column(String(255))
    address_line2 = Column(String(255))
    city = Column(String(100))
    postcode = Column(String(20))
    house = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    vendor = relationship("Vendor", back_populates="user_details")

class BankDetail(Base):
    __tablename__ = "bank_details"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    vendor_id = Column(String(20), ForeignKey("vendors.vendor_id", ondelete="CASCADE"))
    account_number = Column(String(20))
    sort_code = Column(String(10))
    account_holder_name = Column(String(255))
    payment_method = Column(String(10))
    zahls = Column(String(10))
    confs = Column(String(10))
    sperr = Column(String(10))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    vendor = relationship("Vendor", back_populates="bank_details")

class PaymentHistory(Base):
    __tablename__ = "payment_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    vendor_id = Column(String(20), ForeignKey("vendors.vendor_id", ondelete="CASCADE"))
    company_code = Column(String(10))
    fiscal_year = Column(String(10))
    clearing_doc = Column(String(20))
    document_number = Column(String(20))
    reference_doc = Column(String(20))
    gross_amount = Column(Numeric(15, 2))
    net_amount = Column(Numeric(15, 2))
    tax_amount = Column(Numeric(15, 2))
    tax_code = Column(String(10))
    tax_text = Column(String(255))
    purchase_order = Column(String(20))
    document_type = Column(String(10))
    posting_date = Column(Date)
    document_date = Column(Date)
    doc_type = Column(String(10))
    rental_amount = Column(Numeric(15, 2))
    compensation_amount = Column(Numeric(15, 2))
    lease_amount = Column(Numeric(15, 2))
    cheque_number = Column(String(20))
    payment_date = Column(Date)
    payment_method = Column(String(10))
    payment_amount = Column(Numeric(15, 2))
    encashment_date = Column(Date)
    void_reason = Column(String(10))
    void_text = Column(String(255))
    void_date = Column(Date)
    void_user = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    vendor = relationship("Vendor", back_populates="payment_history")

class PaymentScheduleHeader(Base):
    __tablename__ = "payment_schedule_headers"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    vendor_id = Column(String(20), ForeignKey("vendors.vendor_id", ondelete="CASCADE"))
    agreement_number = Column(String(20), unique=True, nullable=False)
    agreement_type = Column(String(10))
    location = Column(String(255))
    last_payment_date = Column(Date)
    next_payment_date = Column(Date)
    total_consent = Column(Numeric(15, 2))
    currency = Column(String(10))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    vendor = relationship("Vendor", back_populates="payment_schedules")
    items = relationship("PaymentScheduleItem", back_populates="header", cascade="all, delete-orphan")

class PaymentScheduleItem(Base):
    __tablename__ = "payment_schedule_items"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    agreement_number = Column(String(20), ForeignKey("payment_schedule_headers.agreement_number", ondelete="CASCADE"))
    item_number = Column(String(10))
    agreement_type = Column(String(10))
    start_date = Column(Date)
    location = Column(String(255))
    land_reg_number = Column(String(50))
    functional_location = Column(String(50))
    asset_type = Column(String(100))
    asset_number = Column(String(50))
    short_text = Column(String(255))
    last_payment_date = Column(Date)
    next_payment_date = Column(Date)
    multiplier = Column(Numeric(10, 3))
    rental = Column(Numeric(15, 2))
    compensation = Column(Numeric(15, 2))
    lease_amount = Column(Numeric(15, 2))
    currency = Column(String(10))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    header = relationship("PaymentScheduleHeader", back_populates="items")

class RemittanceDocument(Base):
    __tablename__ = "remittance_documents"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    vendor_id = Column(String(20), ForeignKey("vendors.vendor_id", ondelete="CASCADE"))
    fiscal_year = Column(String(10), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_data = Column(Text, nullable=False)  # Base64 encoded
    mime_type = Column(String(100), default="application/pdf")
    file_size = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    vendor = relationship("Vendor")


class WayleaveAgreement(Base):
    __tablename__ = "wayleave_agreements"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String(255))
    
    # Grantor Details
    grantor_name = Column(String(255))
    grantor_address = Column(Text)
    grantor_postcode = Column(String(20))
    grantor_telephone = Column(String(50))
    grantor_email = Column(String(255))
    
    # Agreement Details
    agreement_date = Column(String(100))
    agreement_ref = Column(String(100))
    company_with = Column(Text)
    tq_number = Column(String(100))
    payment = Column(String(50))
    duration = Column(String(50))
    
    # Wayleave Information
    property_location = Column(Text)
    works_description = Column(Text)
    drawing_number = Column(String(100))
    
    # Full extracted text
    extracted_text = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
