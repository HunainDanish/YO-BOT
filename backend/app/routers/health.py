from fastapi import APIRouter

from app.providers.router import list_provider_status
from app.schemas.chat import HealthResponse, ProviderStatus

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health():
    providers = [
        ProviderStatus(id=item["id"], name=item["name"], configured=item["configured"])
        for item in list_provider_status()
    ]
    return HealthResponse(status="ok", providers=providers)
