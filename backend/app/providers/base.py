from dataclasses import dataclass
from typing import AsyncIterator, Literal, Protocol

from app.schemas.chat import ChatMessage, ModelInfo


@dataclass
class StreamEvent:
    type: Literal["chunk", "usage", "done", "error"]
    content: str = ""
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    response_time_ms: int = 0
    code: str = ""
    message: str = ""


class AIProvider(Protocol):
    id: str
    name: str

    def is_configured(self) -> bool: ...

    def list_models(self) -> list[ModelInfo]: ...

    async def stream_chat(self, model: str, messages: list[ChatMessage]) -> AsyncIterator[StreamEvent]: ...
