import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.providers.router import get_provider_for_model
from app.schemas.chat import ChatRequest

router = APIRouter(prefix="/api", tags=["chat"])


def _format_sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@router.post("/chat")
async def chat(request: ChatRequest):
    provider = get_provider_for_model(request.model)
    if provider is None:
        raise HTTPException(status_code=400, detail=f"Unknown model: {request.model}")

    if not provider.is_configured():
        raise HTTPException(
            status_code=401,
            detail=f"{provider.name} API key is not configured on the server.",
        )

    async def event_generator():
        async for event in provider.stream_chat(request.model, request.messages):
            if event.type == "chunk":
                yield _format_sse("chunk", {"content": event.content})
            elif event.type == "usage":
                yield _format_sse(
                    "usage",
                    {
                        "prompt_tokens": event.prompt_tokens,
                        "completion_tokens": event.completion_tokens,
                        "total_tokens": event.total_tokens,
                    },
                )
            elif event.type == "done":
                yield _format_sse("done", {"response_time_ms": event.response_time_ms})
            elif event.type == "error":
                yield _format_sse("error", {"code": event.code, "message": event.message})

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
