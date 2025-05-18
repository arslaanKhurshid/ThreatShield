# backend/app/api/logs.py
from fastapi import APIRouter, HTTPException
from app.models.log import Log
from app.services.memory_storage_service import MemoryStorageService


router = APIRouter()
storage_service = MemoryStorageService()

@router.post("/")
async def ingest_log(log: Log):
    try:
        await storage_service.store_log(log)
        return {"message": "Log ingested", "log_id": log.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_logs():
    return await storage_service.get_logs()

