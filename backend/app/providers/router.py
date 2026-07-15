from app.providers.anthropic_provider import AnthropicProvider
from app.providers.base import AIProvider
from app.providers.gemini_provider import GeminiProvider
from app.providers.groq_provider import GroqProvider
from app.providers.openai_provider import OpenAIProvider
from app.schemas.chat import ModelInfo

_providers: list[AIProvider] = [
    OpenAIProvider(),
    AnthropicProvider(),
    GeminiProvider(),
    GroqProvider(),
]

_model_to_provider: dict[str, AIProvider] = {}
for provider in _providers:
    for model in provider.list_models():
        _model_to_provider[model.id] = provider


def get_provider_for_model(model_id: str) -> AIProvider | None:
    return _model_to_provider.get(model_id)


def list_all_models(include_unavailable: bool = True) -> list[ModelInfo]:
    models: list[ModelInfo] = []
    for provider in _providers:
        for model in provider.list_models():
            if include_unavailable or model.available:
                models.append(model)
    return models


def list_provider_status() -> list[dict[str, str | bool]]:
    return [{"id": provider.id, "name": provider.name, "configured": provider.is_configured()} for provider in _providers]
