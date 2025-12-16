# UKPN Portal - Server Deployment Guide

This guide explains how to deploy the UKPN Portal application to a production server with all database migrations and seed data.

## Prerequisites

- PostgreSQL 15+ installed and running
- Python 3.11+ installed
- Git installed
- Server access (SSH or RDP)

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd User-Portal
```

### 2. Set Up Python Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/ukpn_portal
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ukpn_portal
DB_USER=your_user
DB_PASSWORD=your_password

# Application Configuration
ENVIRONMENT=production
SECRET_KEY=your-secret-key-here-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Email Configuration (if using email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@ukpn.com

# OCR Configuration (if using OCR features)
OCR_API_KEY=your-ocr-api-key

# Google Maps API (if using maps)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 4. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ukpn_portal;

# Create user (if needed)
CREATE USER your_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ukpn_portal TO your_user;

# Exit
\q
```

### 5. Run Database Migrations

This will create all tables and insert seed data:

#### Option A: Using the deployment script (Recommended)

**On Linux/Mac:**
```bash
chmod +x deploy_migrations.sh
./deploy_migrations.sh
```

**On Windows:**
```cmd
deploy_migrations.bat
```

#### Option B: Manual migration

```bash
cd backend
alembic upgrade head
```

This will:
- Create all database tables (vendors, user_details, bank_details, payment_history, etc.)
- Insert initial seed data (sample vendors and users)
- Set up the database schema with all relationships

### 6. Verify Migration

```bash
cd backend
alembic current
```

You should see:
```
95b6c1509bb5 (head)
seed_initial_data (head)
```

### 7. Start the Backend Server

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

For production with auto-reload disabled:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 8. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# The build output will be in frontend/dist
```

### 9. Configure Web Server (Nginx Example)

Create `/etc/nginx/sites-available/ukpn-portal`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/User-Portal/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Documents
    location /documents {
        alias /path/to/User-Portal/backend/documents;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/ukpn-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 10. Set Up Systemd Service (Linux)

Create `/etc/systemd/system/ukpn-backend.service`:

```ini
[Unit]
Description=UKPN Portal Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/User-Portal/backend
Environment="PATH=/path/to/User-Portal/venv/bin"
ExecStart=/path/to/User-Portal/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ukpn-backend
sudo systemctl start ukpn-backend
sudo systemctl status ukpn-backend
```

## Updating the Application

### 1. Pull Latest Code

```bash
cd User-Portal
git pull origin main
```

### 2. Update Dependencies

```bash
cd backend
pip install -r requirements.txt

cd ../frontend
npm install
```

### 3. Run New Migrations

```bash
cd backend
alembic upgrade head
```

### 4. Rebuild Frontend

```bash
cd frontend
npm run build
```

### 5. Restart Services

```bash
sudo systemctl restart ukpn-backend
sudo systemctl reload nginx
```

## Database Backup

### Create Backup

```bash
pg_dump -U your_user -d ukpn_portal -F c -f ukpn_portal_backup_$(date +%Y%m%d).dump
```

### Restore Backup

```bash
pg_restore -U your_user -d ukpn_portal -c ukpn_portal_backup_20251216.dump
```

## Troubleshooting

### Check Backend Logs

```bash
sudo journalctl -u ukpn-backend -f
```

### Check Nginx Logs

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Check Database Connection

```bash
cd backend
python -c "from database import engine; print(engine.connect())"
```

### Reset Database (Development Only - DESTRUCTIVE)

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE ukpn_portal;"
psql -U postgres -c "CREATE DATABASE ukpn_portal;"

# Run migrations
cd backend
alembic upgrade head
```

## Security Checklist

- [ ] Change default SECRET_KEY in .env
- [ ] Use strong database passwords
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure firewall rules
- [ ] Set up regular database backups
- [ ] Enable PostgreSQL authentication
- [ ] Restrict database access to localhost
- [ ] Set proper file permissions (chmod 600 .env)
- [ ] Disable debug mode in production
- [ ] Set up monitoring and logging

## Support

For issues or questions, refer to:
- Backend README: `backend/README.md`
- Alembic Guide: `backend/ALEMBIC_MIGRATION_GUIDE.md`
- Frontend README: `frontend/README.md`
