import json
import time
from typing import AsyncIterator

from openai import APIConnectionError, AuthenticationError, OpenAI, RateLimitError

from app.config import get_settings
from app.providers.base import StreamEvent
from app.schemas.chat import ChatMessage, ModelInfo

OPENAI_MODELS = [
    ("gpt-4o", "GPT-4o"),
    ("gpt-4o-mini", "GPT-4o Mini"),
]


class OpenAIProvider:
    id = "openai"
    name = "OpenAI"

    def is_configured(self) -> bool:
        return bool(get_settings().openai_api_key.strip())

    def list_models(self) -> list[ModelInfo]:
        configured = self.is_configured()
        return [
            ModelInfo(id=model_id, name=name, provider=self.id, available=configured)
            for model_id, name in OPENAI_MODELS
        ]

    def _client(self) -> OpenAI:
        settings = get_settings()
        if not settings.openai_api_key.strip():
            raise AuthenticationError(message="OpenAI API key is not configured", response=None, body=None)
        return OpenAI(api_key=settings.openai_api_key)

    async def stream_chat(self, model: str, messages: list[ChatMessage]) -> AsyncIterator[StreamEvent]:
        start = time.perf_counter()
        try:
            client = self._client()
            stream = client.chat.completions.create(
                model=model,
                messages=[{"role": message.role, "content": message.content} for message in messages],
                stream=True,
                stream_options={"include_usage": True},
            )

            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield StreamEvent(type="chunk", content=chunk.choices[0].delta.content)

                if chunk.usage:
                    yield StreamEvent(
                        type="usage",
                        prompt_tokens=chunk.usage.prompt_tokens or 0,
                        completion_tokens=chunk.usage.completion_tokens or 0,
                        total_tokens=chunk.usage.total_tokens or 0,
                    )

            elapsed_ms = int((time.perf_counter() - start) * 1000)
            yield StreamEvent(type="done", response_time_ms=elapsed_ms)

        except AuthenticationError:
            yield StreamEvent(type="error", code="invalid_api_key", message="Invalid OpenAI API key.")
        except RateLimitError:
            yield StreamEvent(type="error", code="rate_limit", message="OpenAI rate limit exceeded. Try again shortly.")
        except APIConnectionError:
            yield StreamEvent(type="error", code="connection_failed", message="Could not connect to OpenAI.")
        except Exception as exc:
            yield StreamEvent(type="error", code="provider_error", message=str(exc))
