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

   4. Run in dev mode:

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
