import os
import json
from typing import List, Optional, Dict, Any

class MedicalKnowledgeService:
    _entries: List[Dict[str, Any]] = []
    _by_code: Dict[str, Dict[str, Any]] = {}
    _by_alias: Dict[str, str] = {} # lowercase alias -> canonical_code

    @classmethod
    def load_knowledge_base(cls):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        kb_path = os.path.join(base_dir, "knowledge_base", "entries.json")
        if not os.path.exists(kb_path):
            return

        with open(kb_path, "r", encoding="utf-8") as f:
            cls._entries = json.load(f)

        cls._by_code = {e["canonical_code"]: e for e in cls._entries}
        cls._by_alias = {}
        for e in cls._entries:
            code = e["canonical_code"]
            cls._by_alias[e["test_name"].lower()] = code
            for alias in e.get("verified_aliases", []):
                cls._by_alias[alias.lower()] = code

    @classmethod
    def get_all_entries(cls) -> List[Dict[str, Any]]:
        if not cls._entries:
            cls.load_knowledge_base()
        return cls._entries

    @classmethod
    def get_by_code(cls, code: str) -> Optional[Dict[str, Any]]:
        if not cls._entries:
            cls.load_knowledge_base()
        return cls._by_code.get(code)

    @classmethod
    def find_canonical_code(cls, test_name: str) -> Optional[str]:
        if not cls._entries:
            cls.load_knowledge_base()
        query = test_name.strip().lower()
        if query in cls._by_alias:
            return cls._by_alias[query]
        # Partial substring match
        for alias, code in cls._by_alias.items():
            if alias in query or query in alias:
                return code
        return None

    @classmethod
    def search(cls, query: str) -> List[Dict[str, Any]]:
        if not cls._entries:
            cls.load_knowledge_base()
        q = query.lower()
        results = []
        for e in cls._entries:
            if q in e["test_name"].lower() or any(q in a.lower() for a in e.get("verified_aliases", [])):
                results.append(e)
        return results

MedicalKnowledgeService.load_knowledge_base()
