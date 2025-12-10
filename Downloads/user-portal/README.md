# UKPN Power Portal

A full-stack web application for managing property consents, tracking payments, and updating user details for UK Power Networks.

## Project Structure

```
.
├── frontend/          # React + Vite frontend
├── backend/           # Node.js + Express backend
├── docker-compose.yml # Docker orchestration
└── README.md
```

## Features

- 🔐 User authentication
- 👤 User profile management
- 🏦 Bank details management
- 📊 Payment history tracking
- 📅 Upcoming payments schedule
- 🔄 Multi-step update workflows
- 📱 Responsive design

## Tech Stack

### Frontend
- React 19
- Vite
- React Router DOM
- Tailwind CSS
- SweetAlert2

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication

### DevOps
- Docker
- Docker Compose

## Quick Start

### Using Docker (Recommended)

1. Clone the repository
2. Run Docker Compose:
```bash
docker-compose up -d
```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api
   - PostgreSQL: localhost:5432

### Manual Setup

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your configuration
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Database Setup
```bash
# Create database
psql -U postgres
CREATE DATABASE ukpn_portal;

# Run migrations
\c ukpn_portal
\i backend/database/schema.sql
\i backend/database/seed.sql
```

## Default Credentials

- **Username:** admin
- **Password:** admin
- **Vendor ID:** 5000000061

## API Documentation

See [backend/README.md](backend/README.md) for detailed API documentation.

## Database Schema

The application uses PostgreSQL with the following main tables:
- vendors
- user_details
- bank_details
- payment_history
- payment_schedule_headers
- payment_schedule_items

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ukpn_portal
DB_USER=ukpn_user
DB_PASSWORD=ukpn_password
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build

# Stop and remove volumes
docker-compose down -v
```

## Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
npm run dev
```

## Production Build

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

### Backend
```bash
cd backend
npm start
```

## License

Proprietary - UK Power Networks
