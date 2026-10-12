"""Lightweight in-process rate limiting.

Good enough for a single-container deployment. If Zerdeli is ever scaled to
multiple workers/replicas, move this to Redis so the window is shared.
"""
import threading
import time
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import HTTPException, Request, status

_lock = threading.Lock()
_hits: Dict[str, Deque[float]] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def rate_limit(request: Request, bucket: str, max_calls: int, window_seconds: int) -> None:
    """Raise HTTP 429 if this client exceeded `max_calls` within the window."""
    key = f"{bucket}:{_client_ip(request)}"
    now = time.monotonic()
    with _lock:
        q = _hits[key]
        while q and now - q[0] > window_seconds:
            q.popleft()
        if len(q) >= max_calls:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Тым көп әрекет жасалды. Біраздан соң қайталап көріңіз.",
            )
        q.append(now)
