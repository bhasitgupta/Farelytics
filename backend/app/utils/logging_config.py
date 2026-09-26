"""Structured logging setup for Farelytics pipeline and API audit trails."""
import logging
import sys

def setup_logger(name: str = "farelytics") -> logging.Logger:
    """Configure and return standardized logger."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            fmt="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger

audit_logger = setup_logger("farelytics.audit")
