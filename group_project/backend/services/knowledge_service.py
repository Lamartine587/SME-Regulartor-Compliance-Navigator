import ast
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Tuple


KB_SOURCE_FILE = Path(__file__).resolve().parent.parent / "knowledge_base_data.py"


class KnowledgeBaseLoadError(RuntimeError):
    pass


def _literal(node: ast.AST) -> Any:
    try:
        return ast.literal_eval(node)
    except Exception as e:  # noqa: BLE001
        raise KnowledgeBaseLoadError(f"Unsupported literal in knowledge base: {type(node).__name__}") from e


def _extract_industry_map(tree: ast.AST) -> Dict[str, List[str]]:
    for node in getattr(tree, "body", []):
        if isinstance(node, ast.Assign) and len(node.targets) == 1:
            target = node.targets[0]
            if isinstance(target, ast.Name) and target.id == "INDUSTRY_MAP":
                value = _literal(node.value)
                if not isinstance(value, dict):
                    raise KnowledgeBaseLoadError("INDUSTRY_MAP must be a dict")
                return value
    raise KnowledgeBaseLoadError("INDUSTRY_MAP not found in knowledge_base_data.py")


def _extract_compliance_db(tree: ast.AST) -> Dict[str, Dict[str, Any]]:
    for node in getattr(tree, "body", []):
        if isinstance(node, ast.Assign) and len(node.targets) == 1:
            target = node.targets[0]
            if isinstance(target, ast.Name) and target.id == "COMPLIANCE_DB":
                if not isinstance(node.value, ast.Dict):
                    raise KnowledgeBaseLoadError("COMPLIANCE_DB must be a dict literal")

                out: Dict[str, Dict[str, Any]] = {}
                for k_node, v_node in zip(node.value.keys, node.value.values):
                    key = _literal(k_node)
                    if not isinstance(key, str):
                        continue

                    if not isinstance(v_node, ast.Call):
                        continue

                    # We only accept ComplianceItem(...) constructor calls.
                    callee = v_node.func
                    callee_name = callee.id if isinstance(callee, ast.Name) else None
                    if callee_name != "ComplianceItem":
                        continue

                    item: Dict[str, Any] = {}
                    for kw in v_node.keywords:
                        if kw.arg is None:
                            continue
                        item[kw.arg] = _literal(kw.value)

                    # Minimal sanity checks
                    if "id" not in item or "title" not in item:
                        continue

                    out[key] = item

                return out
    raise KnowledgeBaseLoadError("COMPLIANCE_DB not found in knowledge_base_data.py")


def _extract_counties(tree: ast.AST) -> List[str]:
    # Preferred: COUNTIES = [...] constant
    for node in getattr(tree, "body", []):
        if isinstance(node, ast.Assign) and len(node.targets) == 1:
            target = node.targets[0]
            if isinstance(target, ast.Name) and target.id == "COUNTIES":
                counties = _literal(node.value)
                if not isinstance(counties, list):
                    raise KnowledgeBaseLoadError("COUNTIES must be a list")
                return sorted({c for c in counties if isinstance(c, str)})

    # Pull the counties list literal from get_counties() if present.
    for node in getattr(tree, "body", []):
        if isinstance(node, ast.FunctionDef) and node.name == "get_counties":
            for stmt in node.body:
                if isinstance(stmt, ast.Assign) and len(stmt.targets) == 1:
                    target = stmt.targets[0]
                    if isinstance(target, ast.Name) and target.id == "counties":
                        counties = _literal(stmt.value)
                        if not isinstance(counties, list):
                            raise KnowledgeBaseLoadError("counties must be a list")
                        # De-dup + sort for stable output
                        return sorted({c for c in counties if isinstance(c, str)})
    # Fallback: empty list is acceptable
    return []


@lru_cache(maxsize=1)
def load_knowledge_base() -> Tuple[Dict[str, List[str]], Dict[str, Dict[str, Any]], List[str]]:
    """
    Safely loads the knowledge base content from `knowledge_base_data.py` without executing it.
    Parses only literal values and ComplianceItem(...) calls via AST.
    """

    if not KB_SOURCE_FILE.exists():
        raise KnowledgeBaseLoadError(f"knowledge base file not found at {KB_SOURCE_FILE}")

    source = KB_SOURCE_FILE.read_text(encoding="utf-8")
    tree = ast.parse(source, filename=str(KB_SOURCE_FILE))

    industry_map = _extract_industry_map(tree)
    compliance_db = _extract_compliance_db(tree)
    counties = _extract_counties(tree)

    return industry_map, compliance_db, counties


def get_industries() -> List[str]:
    industry_map, _, _ = load_knowledge_base()
    return sorted(industry_map.keys())


def get_counties() -> List[str]:
    _, _, counties = load_knowledge_base()
    return counties


def list_compliance_items() -> List[Dict[str, Any]]:
    _, compliance_db, _ = load_knowledge_base()
    return list(compliance_db.values())


def get_compliance_item_by_id(item_id: str) -> Dict[str, Any] | None:
    _, compliance_db, _ = load_knowledge_base()
    for item in compliance_db.values():
        if item.get("id") == item_id:
            return item
    return None


def search_items(q: str) -> List[Dict[str, Any]]:
    q_lower = q.lower().strip()
    if not q_lower:
        return []

    _, compliance_db, _ = load_knowledge_base()
    results: List[Dict[str, Any]] = []
    for item in compliance_db.values():
        haystacks = [
            str(item.get("title", "")),
            str(item.get("description", "")),
            str(item.get("authority", "")),
        ]
        if any(q_lower in h.lower() for h in haystacks):
            results.append(item)
    return results


def requirements_for_industry(industry: str, annual_turnover_kes: float | None = None) -> List[str]:
    industry_map, _, _ = load_knowledge_base()
    industry_key = industry.lower().replace(" ", "_")
    reqs = list(industry_map.get(industry_key, ["KRA PIN", "Business Permit", "NSSF", "NHIF"]))

    if annual_turnover_kes is not None and annual_turnover_kes >= 5_000_000 and "VAT Registration" not in reqs:
        reqs.append("VAT Registration")

    return reqs

