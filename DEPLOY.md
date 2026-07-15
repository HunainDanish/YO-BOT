# Deployment Guide

AI Workspace uses a **split deploy**: React frontend on **Vercel**, FastAPI backend on **Railway** (or Render).

## Prerequisites

- GitHub account (recommended)
- [Vercel](https://vercel.com) account
- [Railway](https://railway.app) account
- OpenAI API key

---

## Step 1: Push to GitHub

```powershell
cd C:\Users\Beyond\Desktop\ai-workspace
git add .
git commit -m "Initial AI Workspace implementation"
git remote add origin https://github.com/YOUR_USER/ai-workspace.git
git push -u origin main
```

---

## Step 2: Deploy Backend (Railway)

1. Go to [railway.app/new](https://railway.app/new) → **Deploy from GitHub repo**
2. Select your `ai-workspace` repository
3. Set **Root Directory** to `backend`
4. Railway auto-detects the Dockerfile
5. Add **Variables**:
   - `OPENAI_API_KEY` = your key
   - `CORS_ORIGINS` = `https://YOUR-APP.vercel.app` (update after Vercel deploy)
6. Deploy and copy the public URL, e.g. `https://ai-workspace-api-production.up.railway.app`

### CLI alternative

```powershell
npm i -g @railway/cli
cd backend
railway login
railway init
railway variables set OPENAI_API_KEY=sk-...
railway up
railway domain
```

---

## Step 3: Deploy Frontend (Vercel)

1. Go to [vercel.com/new](https://vercel.com/new) → Import GitHub repo
2. Set **Root Directory** to `frontend`
3. Framework preset: **Vite**
4. Add **Environment Variable**:
   - `VITE_API_URL` = your Railway backend URL (no trailing slash)
5. Deploy

### CLI alternative

```powershell
npm i -g vercel
cd frontend
vercel login
vercel --prod
```

When prompted for env vars, set `VITE_API_URL`.

---

## Step 4: Finalize CORS

After you have your Vercel URL, update Railway:

```
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:5173
```

Redeploy the backend if needed.

---

## Verify

1. Open your Vercel URL
2. Health check: `https://YOUR-RAILWAY-URL/api/health`
3. Send a test message in the chat UI

---

## GitHub Actions (optional)

The repo includes `.github/workflows/deploy.yml`. Add these secrets in GitHub → Settings → Secrets:

| Secret | Source |
|--------|--------|
| `VERCEL_TOKEN` | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel project settings |
| `VERCEL_PROJECT_ID` | Vercel project settings |
| `VITE_API_URL` | Railway backend URL |
| `RAILWAY_TOKEN` | Railway → Account → Tokens |

---

## Render (backend alternative)

1. [render.com](https://render.com) → New Web Service
2. Connect repo, set root to `backend`
3. Use `render.yaml` blueprint or Docker
4. Add env vars same as Railway
