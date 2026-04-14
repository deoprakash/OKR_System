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

   4. Configure Gmail API credentials in `.env` for OTP delivery:

   - `OTP_EMAIL_FROM`
   - `GMAIL_CLIENT_ID`
   - `GMAIL_CLIENT_SECRET`
   - `GMAIL_REFRESH_TOKEN`
   - Optional: `GMAIL_REDIRECT_URI` (defaults to Google OAuth Playground URL)

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
