from typing import Literal

from pydantic import BaseModel, Field, field_validator


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    model: str
    messages: list[ChatMessage]
    stream: bool = True

    @field_validator("messages")
    @classmethod
    def validate_messages(cls, messages: list[ChatMessage]) -> list[ChatMessage]:
        if not messages:
            raise ValueError("Messages cannot be empty")
        user_messages = [message for message in messages if message.role == "user"]
        if not user_messages:
            raise ValueError("At least one user message is required")
        for message in messages:
            if not message.content.strip():
                raise ValueError("Message content cannot be empty")
        return messages


class ModelInfo(BaseModel):
    id: str
    name: str
    provider: str
    available: bool


class ProviderStatus(BaseModel):
    id: str
    name: str
    configured: bool


class HealthResponse(BaseModel):
    status: str
    providers: list[ProviderStatus]
