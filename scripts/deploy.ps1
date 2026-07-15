#Requires -Version 5.1
$ErrorActionPreference = "Stop"

Write-Host "=== AI Workspace Deploy ===" -ForegroundColor Cyan

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Backend (Railway)
$railway = Get-Command railway -ErrorAction SilentlyContinue
if ($railway) {
    Write-Host "Deploying backend to Railway..."
    Push-Location (Join-Path $root "backend")
    railway up --detach
    Pop-Location
} else {
    Write-Host "Railway CLI not found. Run: npm i -g @railway/cli" -ForegroundColor Yellow
    Write-Host "Then: cd backend; railway login; railway init; railway up"
}

# Frontend (Vercel)
$vercel = Get-Command vercel -ErrorAction SilentlyContinue
if ($vercel) {
    Write-Host "Deploying frontend to Vercel..."
    Push-Location (Join-Path $root "frontend")
    vercel --prod
    Pop-Location
} else {
    Write-Host "Vercel CLI not found. Run: npm i -g vercel" -ForegroundColor Yellow
    Write-Host "Then: cd frontend; vercel login; vercel --prod"
}

Write-Host "Done. Set VITE_API_URL on Vercel to your Railway backend URL." -ForegroundColor Green
