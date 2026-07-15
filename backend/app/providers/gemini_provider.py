"""Gemini provider — enable in Phase 2 by implementing stream_chat."""

from app.providers.base import StreamEvent
from app.schemas.chat import ChatMessage, ModelInfo


class GeminiProvider:
    id = "gemini"
    name = "Google Gemini"

    def is_configured(self) -> bool:
        return False

    def list_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(id="gemini-2.0-flash", name="Gemini 2.0 Flash", provider=self.id, available=False),
            ModelInfo(id="gemini-2.5-pro", name="Gemini 2.5 Pro", provider=self.id, available=False),
        ]

    async def stream_chat(self, model: str, messages: list[ChatMessage]):
        yield StreamEvent(
            type="error",
            code="provider_unavailable",
            message="Gemini support coming soon. Add GOOGLE_AI_API_KEY when available.",
        )
        if False:
            yield
