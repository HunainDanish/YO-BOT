#!/usr/bin/env bash
set -euo pipefail

echo "=== AI Workspace Deploy ==="

# Backend (Railway)
if command -v railway &>/dev/null; then
  echo "Deploying backend to Railway..."
  cd backend
  railway up --detach
  cd ..
else
  echo "Railway CLI not found. Install: npm i -g @railway/cli"
  echo "Then: cd backend && railway login && railway init && railway up"
fi

# Frontend (Vercel)
if command -v vercel &>/dev/null; then
  echo "Deploying frontend to Vercel..."
  cd frontend
  vercel --prod
else
  echo "Vercel CLI not found. Install: npm i -g vercel"
  echo "Then: cd frontend && vercel login && vercel --prod"
fi

echo "Done. Set VITE_API_URL on Vercel to your Railway backend URL."
