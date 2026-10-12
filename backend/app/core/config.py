import secrets
import warnings
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings

# Repo-root .env (…/zerdeli/.env), resolved independently of the current working
# directory so `cd backend && uvicorn …` and docker-compose both pick it up.
_ROOT_ENV = Path(__file__).resolve().parents[3] / ".env"


# Keys that must never be used to sign real tokens.
_WEAK_SECRETS = {
    "",
    "changeme",
    "secret",
    "zerdeli_super_secret_jwt_key_change_in_production_2026",
}


class Settings(BaseSettings):
    PROJECT_NAME: str = "Zerdeli EdTech"
    ENV: str = "development"

    # SECURITY: no usable default. Provide a strong value via the environment / .env.
    # Generate one with:  python -c "import secrets; print(secrets.token_urlsafe(64))"
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    DATABASE_URL: str = "sqlite+aiosqlite:///./zerdeli.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # Comma-separated browser Origin values allowed to call the API from a browser.
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8080"

    class Config:
        # Later files win; a local backend/.env can override the repo-root one.
        env_file = (str(_ROOT_ENV), ".env")
        extra = "ignore"

    @property
    def is_production(self) -> bool:
        return self.ENV.strip().lower() in {"production", "prod", "staging"}

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()

# Fail fast on a missing/weak signing key. In production this is fatal; in
# development we fall back to a random ephemeral key (tokens then don't survive
# a restart, which is fine locally and far safer than a predictable secret).
if settings.SECRET_KEY in _WEAK_SECRETS or len(settings.SECRET_KEY) < 32:
    if settings.is_production:
        raise RuntimeError(
            "SECRET_KEY is missing or weak. Set a strong SECRET_KEY (>= 32 random "
            "chars) in the environment before starting Zerdeli in production."
        )
    settings.SECRET_KEY = secrets.token_urlsafe(64)
    warnings.warn(
        "SECRET_KEY is not set or is weak - using a random ephemeral key for this "
        "dev run. Login sessions will not persist across a backend restart.",
        RuntimeWarning,
        stacklevel=2,
    )
