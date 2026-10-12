# OKRSystem (Objecto)

<div align="center">

**Enterprise Objectives & Key Results (OKR) Desktop Management Platform**

*Powered by React 19, Electron 41, Node.js Express, MongoDB, FastAPI, and Groq AI*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![Electron](https://img.shields.io/badge/Electron-41.7-lightgrey.svg)](https://electronjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-teal.svg)](https://fastapi.tiangolo.com)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
  - [Docker Compose (Fastest)](#1-docker-compose-fastest)
  - [Local Development](#2-local-development)
- [Default Administrator Credentials](#default-administrator-credentials)
- [Documentation Index](#documentation-index)
- [License](#license)

---

## Overview

**Objecto (OKRSystem)** is a full-stack, enterprise-grade OKR (Objectives and Key Results) tracking and management system built for hierarchical organizations. Developed by **GridSeven Technologies**, the system enables teams at all tiers to formulate, align, track, and analyze OKRs on a quarterly cycle, boosted with real-time AI-powered strategic insights and statistical machine learning performance forecasts.

---

## Key Features

- **7-Tier Organizational Hierarchy**: Seamlessly cascades OKRs through:
  1. *Level 1*: Organization
  2. *Level 2*: Division / Group
  3. *Level 3*: Department
  4. *Level 4*: Team
  5. *Level 5*: Subteam
  6. *Level 6*: Individual / Employee
  7. *Level 7*: Key Deliverables & Tasks
- **Quarterly Performance Tracking**: Manage targets, log completion percentages per quarter (Q1–Q4), and record contextual feedback.
- **AI Strategic Advisor**: Embedded conversational assistant powered by Groq LLM (`openai/gpt-oss-120b`) providing instant suggestions, clarity audits, and goal refinement.
- **Predictive ML Forecasting**: Uses ARIMA (AutoRegressive Integrated Moving Average) time-series forecasting via a dedicated Python FastAPI service to project next-quarter success likelihoods.
- **Enterprise Analytics**: Visual performance histograms, progress distributions, and departmental KPI breakdowns powered by Recharts.
- **Native Desktop Application**: Packaged with Electron into a standalone Windows NSIS installer and portable executable (`.exe`).
- **Secure Authentication**: Salted PBKDF2-SHA512 password protection paired with Gmail SMTP-based One-Time Password (OTP) verification.

---

## System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        DESKTOP CLIENT LAYER                            │
│                 Electron 41 + React 19 + Tailwind CSS                  │
│       (Windows NSIS Installer / Standalone Portable Executable)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API LAYER                              │
│                 Node.js (ESM) + Express.js 4.19.2                      │
│                                                                        │
│   • Auth & OTP (/api/auth)          • Employees (/api/employees)       │
│   • 7-Level OKRs (/api/level1..7)   • Performance (/api/performance)   │
│   • Analytics (/api/analytics)      • Groq AI Agent (/api/agent)       │
└──────────────────────┬───────────────────────────┬─────────────────────┘
                       │                           │
         Mongoose 7.6  │                           │ HTTP POST /forecast
                       ▼                           ▼
┌────────────────────────────────┐   ┌───────────────────────────────────┐
│     MONGODB DATABASE           │   │    ML FORECASTING SERVICE         │
│  (Atlas Cluster or Local v6+)  │   │    FastAPI + Statsmodels (ARIMA)  │
│                                │   │                                   │
│  Collections: employees,       │   │  • Time-Series ARIMA Engine       │
│  authsessions, level1..7okrs   │   │  • Moving Average Fallback        │
└────────────────────────────────┘   └───────────────────────────────────┘
```

---

## Repository Structure

```text
OKRSystem/
├── okr_backend/                  # Express.js REST API
│   ├── src/                          # Controllers, routes, models, middleware
│   ├── .env.example                  # Environment configuration template
│   ├── Dockerfile                    # Container definition
│   └── README.md                     # Backend documentation
├── okr_frontend/                 # React 19 + Electron 41 Desktop Application
│   ├── src/                          # Pages, components, electron main process
│   ├── .env.example                  # Frontend configuration template
│   ├── dist_electron/                # Generated Windows executables (.exe)
│   └── README.md                     # Frontend documentation
├── okr_ml/                       # Python FastAPI Predictive Service
│   ├── main.py                       # ARIMA forecasting logic
│   ├── requirements.txt              # Python dependencies
│   ├── Dockerfile                    # Container definition
│   └── README.md                     # ML service documentation
├── Docs/                         # Formal Project Specifications
│   ├── SRS.md                        # Software Requirements Specification (IEEE 830)
│   └── Technical_Documentation.md    # Comprehensive system technical reference
├── docker-compose.yml            # Multi-service container orchestration
├── SETUP_GUIDE.md                # Complete local & Docker installation guide
├── TECHNICAL_DOCUMENTS.md        # Technical architecture summary
└── README.md                     # Repository root overview
```

---

## Quick Start

### 1. Docker Compose (Fastest)

Launch MongoDB, Backend API, and ML Service in one command:

```bash
docker compose up --build
```

Then in a second terminal, start the desktop frontend:
```bash
cd okr_frontend
npm install
npm run dev
```

---

### 2. Local Development

Refer to the detailed [SETUP_GUIDE.md](SETUP_GUIDE.md) for full instructions.

#### Summary:
1. **Backend** (`okr_backend`):
   ```bash
   cd okr_backend
   npm install
   copy .env.example .env   # configure your MONGODB_URI & GROQ_API_KEY
   npm run dev
   ```
2. **ML Service** (`okr_ml`):
   ```bash
   cd okr_ml
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```
3. **Frontend / Desktop** (`okr_frontend`):
   ```bash
   cd okr_frontend
   npm install
   npm run dev
   ```

---

## Default Administrator Credentials

Upon initial database connection, a master administrator account is automatically provisioned:

- **Email**: `gridseventech@gmail.com`
- **Password**: `admin@123`
- **Privilege**: Master Administrator (`isAdmin: true`)

---

## Documentation Index

| Document | Purpose |
|---|---|
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Step-by-step setup guide for local environments and Docker |
| [TECHNICAL_DOCUMENTS.md](TECHNICAL_DOCUMENTS.md) | Tech stack, dependencies, scripts, and build configurations |
| [Docs/SRS.md](Docs/SRS.md) | Formal Software Requirements Specification (IEEE 830 compliant) |
| [Docs/Technical_Documentation.md](Docs/Technical_Documentation.md) | Full architectural reference, data schemas, and API documentation |
| [okr_backend/README.md](okr_backend/README.md) | Backend service endpoints, models, and configuration |
| [okr_frontend/README.md](okr_frontend/README.md) | Desktop client structure, Electron lifecycle, and packaging |
| [okr_ml/README.md](okr_ml/README.md) | ML time-series forecasting service specification and API |

---

## License

This project is licensed under the [MIT License](LICENSE).
