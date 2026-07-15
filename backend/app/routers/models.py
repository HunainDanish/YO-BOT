from fastapi import APIRouter

from app.providers.router import list_all_models

router = APIRouter(prefix="/api", tags=["models"])


@router.get("/models")
async def get_models():
    return {"models": list_all_models(include_unavailable=True)}
