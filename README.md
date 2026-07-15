# AI Workspace

Unified interface for interacting with AI models. FastAPI backend with a React frontend.

## Features

- Natural chat with streaming markdown responses
- Custom system prompt per session
- Model selection (OpenAI; Anthropic & Gemini coming soon)
- Built-in prompt templates + save custom templates
- Multiple chat sessions with localStorage persistence
- Dark mode, export (JSON/Markdown), token usage counter, response time
- Error handling for invalid keys, connection failures, empty prompts

## Project Structure

```
ai-workspace/
├── backend/     # FastAPI API (Railway / Render)
└── frontend/    # Vite + React (Vercel)
```

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env        # add OPENAI_API_KEY
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — the dev server proxies `/api` to the backend.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes (v1) | OpenAI API key |
| `ANTHROPIC_API_KEY` | No | For future Anthropic support |
| `GOOGLE_AI_API_KEY` | No | For future Gemini support |
| `CORS_ORIGINS` | Yes (prod) | Comma-separated allowed origins |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Prod only | Backend URL (empty for local dev proxy) |

## Deployment

### Backend → Railway

1. Push repo to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Deploy from repo, set **Root Directory** to `backend`
4. Add env vars: `OPENAI_API_KEY`, `CORS_ORIGINS=https://your-app.vercel.app`
5. Copy the public URL (e.g. `https://ai-workspace-api.up.railway.app`)

### Frontend → Vercel

1. Import repo on [Vercel](https://vercel.com/new)
2. Set **Root Directory** to `frontend`
3. Add env var: `VITE_API_URL=https://your-railway-url`
4. Deploy

### CLI Deploy (optional)

```bash
# Backend (Railway)
cd backend && railway login && railway init && railway up

# Frontend (Vercel)
cd frontend && npx vercel --prod
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health + provider status |
| GET | `/api/models` | Available models |
| POST | `/api/chat` | Stream chat (SSE) |

## License

MIT
