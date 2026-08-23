import ssl as ssl_module
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.db.base import Base
from typing import AsyncGenerator


def _prepare_url_and_args(url: str):
    """Strip sslmode from URL (asyncpg doesn't accept it) and return SSL connect_args."""
    connect_args = {}

    if "postgresql" in url or "asyncpg" in url:
        # Parse and remove sslmode from query string
        parsed = urlparse(url)
        query_params = parse_qs(parsed.query)
        query_params.pop("sslmode", None)
        clean_query = urlencode(query_params, doseq=True)
        url = urlunparse(parsed._replace(query=clean_query))

        # asyncpg uses ssl= in connect_args
        ssl_ctx = ssl_module.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl_module.CERT_NONE
        connect_args = {"ssl": ssl_ctx}

    return url, connect_args


db_url, connect_args = _prepare_url_and_args(settings.async_database_url)

engine = create_async_engine(db_url, echo=False, connect_args=connect_args)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
