import json
import time
from typing import AsyncIterator

from openai import APIConnectionError, AuthenticationError, OpenAI, RateLimitError

from app.config import get_settings
from app.providers.base import StreamEvent
from app.schemas.chat import ChatMessage, ModelInfo

GROQ_MODELS = [
    ("llama-3.3-70b-versatile", "Llama 3.3 70B"),
    ("llama-3.1-8b-instant", "Llama 3.1 8B Instant"),
    ("mixtral-8x7b-32768", "Mixtral 8x7B"),
    ("gemma2-9b-it", "Gemma 2 9B"),
]


class GroqProvider:
    id = "groq"
    name = "Groq"

    def is_configured(self) -> bool:
        return bool(get_settings().groq_api_key.strip())

    def list_models(self) -> list[ModelInfo]:
        configured = self.is_configured()
        return [
            ModelInfo(id=model_id, name=name, provider=self.id, available=configured)
            for model_id, name in GROQ_MODELS
        ]

    def _client(self) -> OpenAI:
        settings = get_settings()
        if not settings.groq_api_key.strip():
            raise AuthenticationError(message="Groq API key is not configured", response=None, body=None)
        return OpenAI(api_key=settings.groq_api_key, base_url="https://api.groq.com/openai/v1")

    async def stream_chat(self, model: str, messages: list[ChatMessage]) -> AsyncIterator[StreamEvent]:
        start = time.perf_counter()
        try:
            client = self._client()
            stream = client.chat.completions.create(
                model=model,
                messages=[{"role": message.role, "content": message.content} for message in messages],
                stream=True,
            )

            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield StreamEvent(type="chunk", content=chunk.choices[0].delta.content)

            elapsed_ms = int((time.perf_counter() - start) * 1000)
            yield StreamEvent(type="done", response_time_ms=elapsed_ms)

        except AuthenticationError:
            yield StreamEvent(type="error", code="invalid_api_key", message="Invalid Groq API key.")
        except RateLimitError:
            yield StreamEvent(type="error", code="rate_limit", message="Groq rate limit exceeded. Try again shortly.")
        except APIConnectionError:
            yield StreamEvent(type="error", code="connection_failed", message="Could not connect to Groq.")
        except Exception as exc:
            yield StreamEvent(type="error", code="provider_error", message=str(exc))
