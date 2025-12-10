# UKPN Power Portal - Complete Setup Guide (Python FastAPI)

## 🚀 Quick Start (5 minutes)

### Step 1: Start with Docker
From the project root:
```bash
docker-compose up -d
```

This command will:
- ✅ Start PostgreSQL database
- ✅ Create database schema and tables
- ✅ Seed initial data
- ✅ Start Python FastAPI backend server
- ✅ Start frontend development server

### Step 2: Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **API Docs (Swagger)**: http://localhost:8000/docs
- **Database**: localhost:5432

### Step 3: Login
- Username: `admin`
- Password: `admin`

## 📊 What's Been Created

### Backend (Python FastAPI)
```
backend/
├── routers/              # API route handlers
│   ├── auth.py          # Authentication
│   ├── users.py         # User management
│   ├── bank_details.py  # Bank details
│   ├── payment_history.py
│   └── upcoming_payments.py
├── main.py              # FastAPI app
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── database.py          # DB connection
└── config.py            # Configuration
```

### Database Structure
```
vendors (main user table)
├── user_details (address info)
├── bank_details (banking info)
├── payment_history (past payments)
└── payment_schedule_headers
    └── payment_schedule_items (upcoming payments)
```

### API Endpoints Created

#### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

#### User Management
- `GET /api/users/{vendor_id}` - Get user details
- `PUT /api/users/{vendor_id}` - Update user details

#### Bank Details
- `GET /api/bank-details/{vendor_id}` - Get bank details
- `PUT /api/bank-details/{vendor_id}` - Update bank details

#### Payment History
- `GET /api/payment-history/{vendor_id}` - Get all payments
- `GET /api/payment-history/{vendor_id}?year=2024` - Filter by year
- `GET /api/payment-history/{vendor_id}/summary` - Get summary

#### Upcoming Payments
- `GET /api/upcoming-payments/{vendor_id}` - Get agreements
- `GET /api/upcoming-payments/{vendor_id}/agreement/{agreement_number}` - Get breakdown

## 🔧 Manual Setup (Without Docker)

### 1. Install Python 3.11+
Download from https://www.python.org/downloads/

### 2. Install PostgreSQL
Download and install PostgreSQL 15+

### 3. Create Database
```bash
psql -U postgres
CREATE DATABASE ukpn_portal;
CREATE USER ukpn_user WITH PASSWORD 'ukpn_password';
GRANT ALL PRIVILEGES ON DATABASE ukpn_portal TO ukpn_user;
\q
```

### 4. Run Database Scripts
```bash
psql -U ukpn_user -d ukpn_portal -f backend/database/schema.sql
psql -U ukpn_user -d ukpn_portal -f backend/database/seed.sql
```

### 5. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 6. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📝 Sample Data Included

The seed file includes:
- 1 Vendor (ID: 5000000061)
- User details (D L BOLTON)
- Bank details
- 4 Payment history records (2023-2024)
- 1 Agreement with 2 line items

## 🧪 Testing the API

### Using Swagger UI (Recommended)
Visit: http://localhost:8000/docs

### Using cURL

#### Test Health Endpoint
```bash
curl http://localhost:8000/api/health
```

#### Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

#### Test Get User Details
```bash
curl http://localhost:8000/api/users/5000000061
```

#### Test Payment History
```bash
curl http://localhost:8000/api/payment-history/5000000061
```

#### Test Upcoming Payments
```bash
curl http://localhost:8000/api/upcoming-payments/5000000061
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Remove everything including volumes
docker-compose down -v

# Access backend container
docker exec -it ukpn-backend bash

# Access database
docker exec -it ukpn-postgres psql -U ukpn_user -d ukpn_portal
```

## 📂 Project Structure

```
.
├── backend/                  # Python FastAPI backend
│   ├── routers/             # API endpoints
│   ├── database/            # SQL scripts
│   ├── main.py              # FastAPI app
│   ├── models.py            # Database models
│   ├── schemas.py           # Request/Response schemas
│   ├── database.py          # DB connection
│   ├── config.py            # Configuration
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile
│   └── .env
├── frontend/                # React + Vite frontend
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml       # Docker orchestration
└── README.md
```

## 🔐 Security Notes

⚠️ **Important for Production:**
1. Change SECRET_KEY in .env
2. Use proper password hashing
3. Implement rate limiting
4. Add input validation
5. Use HTTPS
6. Implement proper authentication middleware
7. Add CORS restrictions
8. Use environment-specific settings

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Backend Not Starting
```bash
# Check backend logs
docker-compose logs backend

# Access backend container
docker exec -it ukpn-backend bash

# Check Python version
python --version

# Test database connection
python -c "from database import engine; print(engine)"
```

### Port Already in Use
```bash
# Change ports in docker-compose.yml
# Frontend: 5173 -> 5174
# Backend: 8000 -> 8001
# Database: 5432 -> 5433
```

### Python Dependencies Issues
```bash
# Rebuild backend container
docker-compose build backend
docker-compose up -d backend
```

## 📚 Additional Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **SQLAlchemy Documentation**: https://docs.sqlalchemy.org/
- **Pydantic Documentation**: https://docs.pydantic.dev/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

## 📞 Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Visit API docs: http://localhost:8000/docs
3. Check database: `docker exec -it ukpn-postgres psql -U ukpn_user -d ukpn_portal`
