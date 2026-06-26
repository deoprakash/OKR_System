# OKRSystem - Installation & Setup Guide

## Overview

OKRSystem is a desktop-based Objectives & Key Results (OKR) management application built using:

* React + Vite
* Electron
* Node.js + Express
* MongoDB

The application consists of:

```text
OKRSystem/
├── okr_backend/
└── okr_frontend/
```

---

# Prerequisites

Install the following software before running the application:

## 1. Node.js

Download and install:

https://nodejs.org

Verify installation:

```bash
node -v
npm -v
```

Recommended version:

```text
Node.js 18+
```

---

## 2. MongoDB Community Server

Download and install:

https://www.mongodb.com/try/download/community

Verify installation:

```bash
mongod --version
mongosh --version
```

---

# Step 1: Extract the ZIP

Extract the project ZIP file.

Example:

```text
C:\Projects\OKRSystem
```

---

# Step 2: Start MongoDB

Start MongoDB service.

### Windows

Open Command Prompt as Administrator:

```cmd
net start MongoDB
```

Verify:

```cmd
mongosh
```

If MongoDB shell opens successfully, the database server is running.

---

# Step 3: Configure Backend

Open terminal:

```bash
cd okr_backend
```

Install dependencies:

```bash
npm install
```

---

## Environment Configuration

The backend includes a `.env.example` file.

Create a copy:

### Windows

```cmd
copy .env.example .env
```

### Linux / macOS

```bash
cp .env.example .env
```

Open `.env` and update the values:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/okr_db

# Gmail OTP configuration
OTP_EMAIL_FROM=your-email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

OTP_TEMPLATE_TEXT=Your login OTP is {}. This OTP is valid for 1 minute. NEVER share your OTP.
```

---

## Gmail Configuration

To enable OTP email delivery:

1. Enable 2-Step Verification on your Google account.
2. Generate a Gmail App Password.
3. Use the generated App Password as:

```env
SMTP_PASS=your-gmail-app-password
```

4. Set:

```env
OTP_EMAIL_FROM=your-email@gmail.com
SMTP_USER=your-email@gmail.com
```

---

# Step 4: Start Backend Server

From the `okr_backend` folder:

```bash
npm run dev
```

Expected output:

```text
MongoDB Connected
Server running on port 5000
```

Keep this terminal running.

---

# Step 5: Configure Frontend

Open a new terminal:

```bash
cd okr_frontend
```

Install dependencies:

```bash
npm install
```

If a frontend `.env` file is required, create:

```env
VITE_API_URL=http://localhost:5000
```

---

# Step 6: Start Electron Application

Run:

```bash
npm run dev
```

The Electron desktop application should launch automatically.

---

# Verify Installation

Backend health endpoint:

```text
http://localhost:5000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

---

# Production Build

## Build Frontend

```bash
cd okr_frontend
npm run build
```

---

## Create Windows Executable

```bash
cd okr_frontend
npm run build:exe
```

Generated files will be available in:

```text
dist_electron/
```

---

# Troubleshooting

## MongoDB Connection Error

Verify MongoDB is running:

```cmd
net start MongoDB
```

or

```bash
mongosh
```

---

## Port Already In Use

Change the backend port in `.env`:

```env
PORT=5001
```

Update frontend configuration accordingly:

```env
VITE_API_URL=http://localhost:5001
```

---

## Dependency Issues

Delete:

```text
node_modules
package-lock.json
```

Reinstall:

```bash
npm install
```

---

# Quick Start

## Terminal 1

```bash
cd okr_backend
npm install
npm run dev
```

## Terminal 2

```bash
cd okr_frontend
npm install
npm run dev
```

---

# Support

If you encounter any issues during installation:

1. Verify Node.js is installed correctly.
2. Verify MongoDB service is running.
3. Verify `.env` values are configured correctly.
4. Restart the backend and frontend after making configuration changes.

The application is now ready to use.
