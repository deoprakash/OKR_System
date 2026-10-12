# Objecto Desktop App (`okr_frontend`)

The desktop client application for the **OKRSystem (Objecto)** platform, built using React 19, Vite 7, Tailwind CSS, Framer Motion, and packaged as a Windows desktop application with Electron 41.

---

## Features

- **Desktop-Native Experience**: Packaged with Electron to deliver an installer-based (`.exe`) and portable Windows desktop application.
- **Dynamic 7-Level OKR Management**: Interactive navigation and management across organizational, divisional, departmental, team, and individual OKRs.
- **Quarterly Performance & ML Forecasts**: Record quarterly completion percentages and view AI/ML-driven future completion projections.
- **Embedded AI Chat Assistant**: In-app conversational assistant powered by Groq LLM to aid in crafting measurable objectives and strategic alignment.
- **Interactive Visualizations**: High-performance analytical charts rendered with Recharts and styled with Tailwind CSS and Framer Motion micro-interactions.
- **Secure Authentication Flow**: Support for credentials-based login, email OTP verification, password resets, and role-based interface restrictions.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **React (`^19.2.0`)** | Single-Page Application (SPA) component framework |
| **Electron (`^41.7.1`)** | Native desktop runtime wrapper for Windows |
| **Vite (`^7.2.4`)** | Development server with Fast HMR and production bundler |
| **Tailwind CSS (`^3.4.19`)** | Utility-first styling framework |
| **Framer Motion (`^12.43.0`)** | Declarative animations and transitions |
| **Recharts (`^3.9.2`)** | Analytical performance visualizations and progress graphs |
| **Lucide React (`^1.28.0`)** | Iconography |
| **React Router DOM (`^7.12.0`)** | Client-side routing |
| **electron-builder (`^26.8.1`)** | Packaging into Windows NSIS installer and portable executable |
| **electron-updater (`^6.8.3`)** | Over-the-air (OTA) desktop application updates |

---

## Directory Structure

```text
okr_frontend/
├── src/
│   ├── main.jsx              # React DOM entry point
│   ├── App.jsx               # Root routing and application layout
│   ├── electron/             # Electron main process scripts
│   │   ├── main.cjs              # Electron window lifecycle & IPC configuration
│   │   └── preload.cjs           # Secure context bridge preload script
│   ├── pages/                # Application views (12 screens)
│   │   ├── Home.jsx              # Dashboard overview & summary metrics
│   │   ├── OKRWorkspace.jsx      # 7-level OKR CRUD & alignment view
│   │   ├── OKRPerformance.jsx    # Quarterly progress tracking & ML forecasting
│   │   ├── Analytics.jsx         # Cross-department analytical insights
│   │   ├── AdminUsers.jsx        # Admin user management & privilege assignment
│   │   ├── EmployeeMaster.jsx    # Employee directory
│   │   ├── Login.jsx             # User sign-in screen
│   │   ├── ForgotPassword.jsx    # Password recovery request
│   │   ├── ResetPassword.jsx     # Password reset confirmation
│   │   ├── ChangePassword.jsx    # Password change
│   │   ├── MyProfile.jsx         # Employee profile
│   │   └── Setup.jsx             # Initial organization onboarding wizard
│   ├── components/           # Reusable UI components & modals
│   ├── agent/                # AI Assistant drawer & API integration
│   ├── context/              # AuthContext & global states
│   ├── lib/                  # API client helper & utilities
│   └── styles/               # Global CSS & Tailwind imports
├── dist/                     # Vite production build output
├── dist_electron/            # Windows executable packaging output
├── package.json
└── vite.config.js
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: Package manager (comes with Node.js)
- Running Backend server (`okr_backend`) on `http://localhost:5000`

### 2. Install Dependencies

```bash
cd okr_frontend
npm install
```

### 3. Environment Configuration

If you need to connect to an external or custom backend URL, create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

*(If omitted in development, requests automatically route to `http://localhost:5000`)*.

---

## Development & Build Commands

### Run in Development Mode
Launches Vite dev server with Hot Module Replacement (HMR) and opens the Electron desktop window simultaneously:

```bash
npm run dev
```

### Run Web Client Only
If you prefer running just the browser client without Electron:

```bash
npx vite --port 5173
```

### Build Production Web Assets
Compiles and optimizes React files into the `dist/` directory:

```bash
npm run build
```

### Package Windows Desktop Executable (`.exe`)
Compiles the React bundle and runs `electron-builder` to produce the Windows NSIS installer and portable executable:

```bash
npm run build:exe
```

The resulting distribution packages will be generated in:
```text
dist_electron/
├── OKRSystem Setup 0.0.0.exe      # NSIS Windows Installer
└── OKRSystem 0.0.0.exe            # Portable standalone executable
```

---

## Code Quality

Run ESLint to check for code formatting and potential bugs:

```bash
npm run lint
```
