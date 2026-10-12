# OKR Backend

The backend REST API server for the **OKRSystem (Objecto)** platform, powered by Node.js, Express, MongoDB (Mongoose), and integrated with Groq AI and an ARIMA-based ML forecasting service.

---

## Features

- **7-Tier Organizational OKR Hierarchy**: Dedicated routes and models spanning Organization (L1), Division (L2), Department (L3), Team (L4), Subteam (L5), Individual/Employee (L6), and Key Tasks (L7).
- **Secure Authentication**: Password hashing via PBKDF2-SHA512 with optional Gmail SMTP-based One-Time Password (OTP) verification.
- **Master Admin Seeding**: Automatically seeds default administrator credentials (`gridseventech@gmail.com` / `admin@123`) upon database initialization.
- **AI Agent Integration**: Conversational assistant powered by Groq LLM (`openai/gpt-oss-120b`) for OKR alignment, generation, and actionable feedback.
- **Predictive Performance**: Connects to the `okr_ml` FastAPI service to forecast upcoming quarterly completion percentages.
- **Robust CORS Handling**: Supports browser origins and Electron desktop applications (`Origin: null` handling).

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js (ESM)** | JavaScript runtime (`"type": "module"`) |
| **Express.js (`^4.19.2`)** | Web application framework and HTTP router |
| **MongoDB / Mongoose (`^7.6.0`)** | Document database & Object Data Modeling |
| **Groq SDK (`^1.6.0`)** | Integration with Groq AI API |
| **Nodemailer (`^9.0.3`)** | SMTP email delivery for OTP verification |
| **Morgan (`^1.10.0`)** | HTTP request logger |
| **Dotenv (`^16.4.5`)** | Environment variable management |

---

## Directory Structure

```text
okr_backend/
├── src/
│   ├── index.js                  # Main server entry point & route mounting
│   ├── controllers/              # Route controllers
│   │   ├── agentController.js        # Groq AI chat and recommendation handler
│   │   ├── analyticsController.js    # Performance metric aggregations
│   │   ├── authController.js         # Authentication, OTP, and session handling
│   │   ├── employeeController.js     # Employee CRUD and role management
│   │   ├── level1Controller.js ..    # Controllers for Levels 1 through 7
│   │   ├── performanceController.js  # Quarterly completion tracking & ML proxy
│   │   └── setupController.js        # System setup state verification
│   ├── middleware/               # Auth and permission middlewares
│   ├── models/                   # Mongoose schemas (Level1-7, Employee, AuthSession, Counter)
│   ├── routes/                   # Express route definitions
│   └── scripts/                  # Utility scripts (e.g., testConnection.js)
├── .env.example                  # Environment configuration template
├── Dockerfile                    # Container definition
├── package.json
└── vercel.json                   # Serverless deployment configuration
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (port 27017) or MongoDB Atlas connection string

### 2. Install Dependencies

```bash
cd okr_backend
npm install
```

### 3. Configure Environment Variables

Create your `.env` file from the example:

```bash
# Windows
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

Edit `.env` to configure your settings:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
ALLOW_NULL_ORIGIN=true

# Database connection
MONGODB_URI=mongodb://127.0.0.1:27017/OKRSystem
LOCAL_MONGODB_URI=mongodb://127.0.0.1:27017/OKRSystem

# Gmail SMTP for OTP
OTP_EMAIL_FROM=your-email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
OTP_EMAIL_ENABLED=true
OTP_TEMPLATE_TEXT=Your login OTP is {}. This OTP is valid for 1 minute. NEVER share your OTP.

# Groq AI API Key
GROQ_API_KEY=your-groq-api-key

# ML Microservice URL
ML_SERVICE_URL=http://localhost:8000
```

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

**Test MongoDB Connection:**
```bash
npm run test-db
```

The backend will listen on `http://localhost:5000`.

---

## API Endpoints

### System & Health
- `GET /health` — Health check endpoint
- `GET /` — Service status endpoint

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticate employee with email and password
- `POST /api/auth/request-otp` — Request login OTP via email
- `POST /api/auth/verify-otp` — Verify email OTP and establish session
- `POST /api/auth/reset-password` — Reset account password

### Setup (`/api/setup`)
- `GET /api/setup/status` — Check whether initial system setup is completed
- `POST /api/setup/complete` — Finalize initial organization setup

### Employee Management (`/api/employees`)
- `GET /api/employees` — List all employees (supports level/department filtering)
- `POST /api/employees` — Create new employee record
- `GET /api/employees/:id` — Get specific employee details
- `PUT /api/employees/:id` — Update employee profile
- `DELETE /api/employees/:id` — Delete employee record

### OKR Hierarchy Levels (`/api/level1` – `/api/level7`)
Each level supports standard RESTful operations:
- `GET /api/level{N}` — Fetch OKRs for level N
- `POST /api/level{N}` — Create an OKR at level N
- `GET /api/level{N}/:id` — Get specific level N OKR
- `PUT /api/level{N}/:id` — Update level N OKR
- `DELETE /api/level{N}/:id` — Delete level N OKR

| Route | Hierarchy Level | Target |
|---|---|---|
| `/api/level1` | Level 1 | Organization |
| `/api/level2` | Level 2 | Division / Group |
| `/api/level3` | Level 3 | Department |
| `/api/level4` | Level 4 | Team |
| `/api/level5` | Level 5 | Subteam |
| `/api/level6` | Level 6 | Individual / Employee |
| `/api/level7` | Level 7 | Key Deliverable / Task |

### Performance Tracking (`/api/performance`)
- `GET /api/performance` — Retrieve quarterly performance records
- `POST /api/performance` — Record or update quarterly completion percentage and comments
- `POST /api/performance/forecast` — Trigger ML forecast calculation for an OKR

### Analytics (`/api/analytics`)
- `GET /api/analytics/overview` — High-level enterprise OKR statistics
- `GET /api/analytics/departments` — Departmental performance breakdown
- `GET /api/analytics/forecasting` — Aggregate predictive performance insights

### AI Agent (`/api/agent`)
- `POST /api/agent/chat` — Conversational OKR assistant (Groq LLM)
- `POST /api/agent/suggest` — Generate recommended OKRs and key metrics

---

## Default Master Admin Credentials

When the backend starts and connects to MongoDB, it automatically provisions the initial admin account if not already present:

- **Email**: `gridseventech@gmail.com`
- **Password**: `admin@123`
- **Role**: Master Admin (`isAdmin: true`)
