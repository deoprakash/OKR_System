# OKRSystem (Objecto) - Installation & Setup Guide

## Overview

**OKRSystem (Objecto)** is an enterprise Objectives & Key Results (OKR) desktop application and management platform. The system is architected across three core modules:

```text
OKRSystem/
├── okr_backend/        # Node.js + Express + MongoDB REST API server
├── okr_frontend/       # React 19 + Electron 41 + Tailwind CSS desktop app
├── okr_ml/             # Python + FastAPI + ARIMA predictive forecasting service
├── Docs/               # Software Requirements Specification (SRS) & deep dive docs
├── docker-compose.yml  # Multi-container orchestration (MongoDB + Backend + ML)
├── SETUP_GUIDE.md      # This guide
└── TECHNICAL_DOCUMENTS.md
```

---

## Prerequisites

Before starting, ensure the following software is installed on your computer:

### 1. Node.js (v18 or higher)
- Download & install: [https://nodejs.org](https://nodejs.org)
- Verify installation:
  ```bash
  node -v
  npm -v
  ```

### 2. MongoDB Community Server (v6+) or MongoDB Atlas
- Download local server: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- Verify installation:
  ```bash
  mongod --version
  mongosh --version
  ```
  *(Alternatively, you can provide a cloud MongoDB Atlas connection URI in `.env`)*.

### 3. Python 3.9+ (For ML Service)
- Download & install: [https://www.python.org/downloads/](https://www.python.org/downloads/)
- Verify installation:
  ```bash
  python --version
  pip --version
  ```

### 4. Docker & Docker Compose (Optional)
- If you prefer running all services in containers without installing local runtimes: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

---

## Default Master Admin Credentials

When the backend starts and connects to MongoDB, it automatically provisions the default administrator account:

- **Email**: `gridseventech@gmail.com`
- **Password**: `admin@123`
- **Role**: Master Admin (`isAdmin: true`)

---

## Method 1: Quick Start with Docker Compose (Recommended for Backend + ML)

If you have Docker Desktop installed, you can launch MongoDB, the Backend API, and the ML Forecasting service in one command:

```bash
docker compose up --build
```

This launches:
- **MongoDB**: `localhost:27017`
- **Backend API**: `localhost:5000`
- **ML Forecasting Service**: `localhost:8000`

Once Docker is running, you only need to run the desktop frontend locally:
```bash
cd okr_frontend
npm install
npm run dev
```

---

## Method 2: Manual Local Setup (Step-by-Step)

Follow these steps to run each service individually on your local environment:

### Step 1: Start MongoDB

#### Windows Service:
```cmd
net start MongoDB
```

#### Manual mongod:
```bash
mongod --dbpath <path-to-data-directory>
```

Verify connection:
```bash
mongosh
```

---

### Step 2: Configure & Start the Backend (`okr_backend`)

1. Open a terminal and navigate to `okr_backend`:
   ```bash
   cd okr_backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file from the template:
   - **Windows**:
     ```cmd
     copy .env.example .env
     ```
   - **Linux / macOS**:
     ```bash
     cp .env.example .env
     ```

4. Configure your `.env` file:
   ```env
   PORT=5000
   CLIENT_ORIGIN=http://localhost:5173
   ALLOW_NULL_ORIGIN=true

   # MongoDB connection string
   MONGODB_URI=mongodb://127.0.0.1:27017/OKRSystem
   LOCAL_MONGODB_URI=mongodb://127.0.0.1:27017/OKRSystem

   # Gmail OTP configuration (for email verification)
   OTP_EMAIL_FROM=your-email@gmail.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   OTP_EMAIL_ENABLED=true
   OTP_TEMPLATE_TEXT=Your login OTP is {}. This OTP is valid for 1 minute. NEVER share your OTP.

   # Groq AI API Key (for conversational AI agent)
   GROQ_API_KEY=your-groq-api-key

   # ML Service endpoint
   ML_SERVICE_URL=http://localhost:8000
   ```

   > **Note on Gmail SMTP**: To send OTP emails via Gmail, enable 2-Step Verification on your Google Account and generate an **App Password** under Security settings. Paste that 16-character token as `SMTP_PASS`.

5. Start the backend server:
   ```bash
   npm run dev
   ```

   **Expected Output**:
   ```text
   Connected to MongoDB
   Master admin seeded successfully.
   OKR backend listening on port 5000
   ```

---

### Step 3: Configure & Start the ML Service (`okr_ml`)

1. Open a second terminal and navigate to `okr_ml`:
   ```bash
   cd okr_ml
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server on port 8000:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   **Expected Output**:
   ```text
   INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
   ```

---

### Step 4: Configure & Start the Desktop App (`okr_frontend`)

1. Open a third terminal and navigate to `okr_frontend`:
   ```bash
   cd okr_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. *(Optional)* Verify frontend configuration:
   The frontend automatically connects to `http://localhost:5000` during development. If you need a custom URL, create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Launch the application:
   ```bash
   npm run dev
   ```

   This launches both the Vite development server and the Electron desktop application window.

---

## Verifying the Installation

Test service endpoints in your browser or with `curl`:

| Service | Endpoint | Expected Output |
|---|---|---|
| **Backend Health** | [http://localhost:5000/health](http://localhost:5000/health) | `{"status":"ok","timestamp":"..."}` |
| **ML Service Health** | [http://localhost:8000/health](http://localhost:8000/health) | `{"status":"ok"}` |
| **ML Documentation** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive Swagger UI |
| **Frontend Web** | [http://localhost:5173](http://localhost:5173) | Objecto login screen |

---

## Production Build & Desktop Distribution

### 1. Build Frontend Static Bundle
```bash
cd okr_frontend
npm run build
```
Creates production-optimized assets in `okr_frontend/dist/`.

### 2. Package Windows Installer & Portable EXE
```bash
cd okr_frontend
npm run build:exe
```

The resulting distribution files will be located in `okr_frontend/dist_electron/`:
- `OKRSystem Setup 0.0.0.exe` — Windows NSIS Installer (with standard install wizard)
- `OKRSystem 0.0.0.exe` — Portable executable (can be run directly without installation)

---

## Troubleshooting

### MongoDB Connection Error
- Ensure the MongoDB service is running:
  ```cmd
  net start MongoDB
  ```
- Or verify your MongoDB Atlas IP whitelist allows your current public IP address (`0.0.0.0/0` for universal dev access).

### Port Conflicts
- **Port 5000 already in use**:
  Update `PORT=5001` in `okr_backend/.env` and configure `VITE_API_URL=http://localhost:5001` in `okr_frontend/.env`.
- **Port 8000 already in use**:
  Run uvicorn with `--port 8001` and update `ML_SERVICE_URL=http://localhost:8001` in `okr_backend/.env`.

### Python ARIMA / Statsmodels Import Errors
- Ensure your virtual environment is active before running `pip install -r requirements.txt`.
- Upgrade pip if necessary:
  ```bash
  python -m pip install --upgrade pip
  ```

### Electron Window Shows White Screen
- Ensure `ALLOW_NULL_ORIGIN=true` is set in `okr_backend/.env` (packaged Electron executables make API requests with `Origin: null`).
- Check that the backend is running and reachable on `http://localhost:5000`.

### Node Module Inconsistencies
If dependencies become corrupted:
```bash
rmdir /s /q node_modules
del package-lock.json
npm install
```
