import hashlib
import json

def payload_signature(payload: dict) -> str:
    """
    Stable signature of the scoring payload.
    Sort keys, stringify values consistently, then hash.
    """
    normalized = json.dumps(payload, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()