DATA_GRADE = {"PUBLIC": 0, "INTERNAL": 1, "CONFIDENTIAL": 2, "RESTRICTED": 3}


def can_retry(attempt_count, first_byte_sent, retryable):
    """R007/R008: initial call included, total attempts <= 3, never switch after first byte."""
    return bool(retryable and not first_byte_sent and attempt_count < 3)


def select_candidates(endpoints, required_grade="INTERNAL", strategy="LATENCY_FIRST"):
    required_rank = DATA_GRADE.get(required_grade, DATA_GRADE["INTERNAL"])
    available = [
        item for item in endpoints
        if item.get("status") == "HEALTHY"
        and DATA_GRADE.get(item.get("data_grade", "PUBLIC"), 0) >= required_rank
    ]
    if strategy == "LATENCY_FIRST":
        return sorted(available, key=lambda item: (item.get("latency_ms", 999999), item.get("priority", 999)))
    return sorted(available, key=lambda item: (item.get("priority", 999), -item.get("weight", 0)))
