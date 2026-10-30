from typing import List, Optional
from fastapi import APIRouter, Query
from app.services.knowledge.service import MedicalKnowledgeService

router = APIRouter(prefix="/knowledge", tags=["Medical Resources Hub"])

@router.get("/tests")
def get_all_tests():
    """
    Returns verified medical tests with definitions and MedlinePlus citations.
    """
    return MedicalKnowledgeService.get_all_entries()

@router.get("/search")
def search_tests(q: str = Query(..., min_length=2)):
    return MedicalKnowledgeService.search(q)

@router.get("/sources")
def get_all_sources():
    entries = MedicalKnowledgeService.get_all_entries()
    sources = []
    seen = set()
    for e in entries:
        for s in e.get("sources", []):
            if s["source_id"] not in seen:
                sources.append(s)
                seen.add(s["source_id"])
    return sources
