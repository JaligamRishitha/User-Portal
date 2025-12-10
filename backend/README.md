# UKPN Power Portal - Backend API (FastAPI)

Backend API for the UKPN Power Portal application built with Python FastAPI and PostgreSQL.

## Features

- RESTful API endpoints
- PostgreSQL database with SQLAlchemy ORM
- JWT authentication
- Automatic API documentation (Swagger/OpenAPI)
- Docker support
- Environment-based configuration

## Tech Stack

- **Python 3.11** - Programming language
- **FastAPI** - Modern web framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **Pydantic** - Data validation
- **Docker** - Containerization

## Prerequisites

- Python 3.11+ (if running locally)
- PostgreSQL 15+ (if running locally)
- Docker & Docker Compose (for containerized setup)

## Installation

### Using Docker (Recommended)

1. From the project root directory, run:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 8000
- Frontend on port 5173

### Local Setup

1. Create virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials

5. Create database and run migrations:
```bash
psql -U postgres
CREATE DATABASE ukpn_portal;
\c ukpn_portal
\i database/schema.sql
\i database/seed.sql
```

6. Start the server:
```bash
uvicorn main:app --reload
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### User Details
- `GET /api/users/{vendor_id}` - Get user details
- `PUT /api/users/{vendor_id}` - Update user details

### Bank Details
- `GET /api/bank-details/{vendor_id}` - Get bank details
- `PUT /api/bank-details/{vendor_id}` - Update bank details

### Payment History
- `GET /api/payment-history/{vendor_id}` - Get payment history
- `GET /api/payment-history/{vendor_id}/summary` - Get payment summary
- Query params: `?year=2024` - Filter by year

### Upcoming Payments
- `GET /api/upcoming-payments/{vendor_id}` - Get upcoming payments
- `GET /api/upcoming-payments/{vendor_id}/agreement/{agreement_number}` - Get agreement breakdown

## Project Structure

```
backend/
├── routers/
│   ├── __init__.py
│   ├── auth.py              # Authentication endpoints
│   ├── users.py             # User management
│   ├── bank_details.py      # Bank details
│   ├── payment_history.py   # Payment history
│   └── upcoming_payments.py # Upcoming payments
├── database/
│   ├── schema.sql           # Database schema
│   └── seed.sql             # Sample data
├── main.py                  # FastAPI application
├── models.py                # SQLAlchemy models
├── schemas.py               # Pydantic schemas
├── database.py              # Database connection
├── config.py                # Configuration
├── requirements.txt         # Python dependencies
├── Dockerfile               # Docker configuration
└── .env                     # Environment variables
```

## Database Models

The application uses SQLAlchemy ORM with the following models:

- **Vendor** - User/vendor information
- **UserDetail** - Address and contact details
- **BankDetail** - Banking information
- **PaymentHistory** - Historical payment records
- **PaymentScheduleHeader** - Agreement headers
- **PaymentScheduleItem** - Agreement line items

## Environment Variables

```
ENVIRONMENT=development
DATABASE_URL=postgresql://ukpn_user:ukpn_password@postgres:5432/ukpn_portal
DB_HOST=postgres
DB_PORT=5432
DB_NAME=ukpn_portal
DB_USER=ukpn_user
DB_PASSWORD=ukpn_password
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

## Testing

Test the API health:
```bash
curl http://localhost:8000/api/health
```

Test with Swagger UI:
```
http://localhost:8000/docs
```

## Default Credentials

- Username: `admin`
- Password: `admin`
- Vendor ID: `5000000061`

## Development

Run with auto-reload:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Production

For production deployment:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```
