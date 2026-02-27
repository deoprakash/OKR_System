# Deploying `okr_backend` to Render (Node service — no Docker)

This document explains how to deploy the backend to Render using the Node environment (no Docker).

Prerequisites
- A Git provider (GitHub/GitLab) with this repository pushed.
- A Render account (https://render.com).
- A MongoDB connection URI (e.g., MongoDB Atlas) for `MONGODB_URI`.

Quick steps

1. Push your repo to GitHub/GitLab (if not already):

```bash
# from repository root
git add .
git commit -m "add render deploy docs"
git push origin main
```

2. Create a MongoDB database (MongoDB Atlas recommended) and copy the connection string.

3. On Render (Node service):
- Sign in and click "New" → "Web Service".
- Connect your Git provider and choose this repository.
- Render should detect `render.yaml` and create a service named `okr-backend` using the Node environment.
  - If Render asks for the "Root directory", set it to `okr_backend` so the service uses the folder that contains `package.json`, `src/`, and `render.yaml`.

4. In the Render service settings, set Environment > Environment Vars:
- `MONGODB_URI` = your MongoDB connection string
- `CLIENT_ORIGIN` = your frontend URL (or `http://localhost:5173` for dev)
- You do not need to set `PORT` (Render supplies it), but you may set it to `5000` if desired.

5. Deploy:
- Click "Create Service" / "Manual Deploy" to trigger a build.
- Monitor build logs in the Render dashboard.

6. Verify:
- Once deployed, call the health endpoint:

```bash
curl https://<your-service>.onrender.com/health
```

You should get JSON like:

```json
{ "status": "ok", "timestamp": "..." }
```

Notes
- The repository previously contained a `Dockerfile`. You no longer need Docker for Render; `render.yaml` specifies the Node environment and the `buildCommand`/`startCommand`.
- Ensure `MONGODB_URI` includes credentials and the database name (e.g., `mongodb+srv://user:pass@cluster0.mongodb.net/okr_db?retryWrites=true&w=majority`).

If you want, I can:
- Help create a MongoDB Atlas cluster and generate a connection string interactively.
- Push changes and trigger a Render deploy if you give repository push access (or run the commands locally).