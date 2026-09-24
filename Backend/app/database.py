from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client: AsyncIOMotorClient = AsyncIOMotorClient(settings.mongodb_uri)
db = client[settings.database_name]

async def ping_database() -> bool:
    await client.admin.command("ping")
    return True