"""Anthropic provider — enable in Phase 2 by implementing stream_chat."""

from app.providers.base import StreamEvent
from app.schemas.chat import ChatMessage, ModelInfo


class AnthropicProvider:
    id = "anthropic"
    name = "Anthropic"

    def is_configured(self) -> bool:
        return False

    def list_models(self) -> list[ModelInfo]:
        return [
            ModelInfo(id="claude-sonnet-4-20250514", name="Claude Sonnet 4", provider=self.id, available=False),
            ModelInfo(id="claude-3-5-haiku-20241022", name="Claude Haiku 3.5", provider=self.id, available=False),
        ]

    async def stream_chat(self, model: str, messages: list[ChatMessage]):
        yield StreamEvent(
            type="error",
            code="provider_unavailable",
            message="Anthropic support coming soon. Add ANTHROPIC_API_KEY when available.",
        )
        if False:
            yield
