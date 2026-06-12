# OKR Backend

## Setup

1. Install dependencies:
   # OKR Backend

   ## Setup

   1. Install dependencies:

   ```bash
   npm install
   ```

   2. Create a local env file from the example:

   ```bash
   copy .env.example .env
   ```

   3. Make sure MongoDB is running and reachable from `MONGODB_URI` in `.env`.

   4. Configure SMTP credentials in `.env` for OTP and account emails:

   - `OTP_EMAIL_FROM` — sender address shown to recipients
   - `SMTP_HOST` — e.g. `smtp.gmail.com`
   - `SMTP_PORT` — e.g. `587` (TLS) or `465` (SSL)
   - `SMTP_USER` — SMTP login username (often the same as the sender email)
   - `SMTP_PASS` — SMTP password or app password
   - Optional: `SMTP_SECURE=true` — force SSL (defaults to `true` when port is 465)

   5. Run in dev mode:

   ```bash
   npm run dev
   ```

   ## Endpoints

   - GET /health
   - GET /api/okrs
   - GET /api/okrs/:id
   - POST /api/okrs
   - PUT /api/okrs/:id
   - DELETE /api/okrs/:id

   The OKR model includes a `title`, optional `objective`, `keyResults` (array), `owner`, `quarter`, and `level`.
