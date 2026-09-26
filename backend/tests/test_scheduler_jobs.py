"""Unit tests for background pipeline scheduler."""
from app.pipeline.scheduler import get_scheduler_status

def test_get_scheduler_status():
    status = get_scheduler_status()
    assert isinstance(status, dict)
    assert "active" in status or "running" in status or "interval_seconds" in status
