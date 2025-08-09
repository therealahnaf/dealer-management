"""
Centralized logging configuration
"""
import logging
import sys
from typing import Optional
from pathlib import Path


class LoggerSetup:
    """Centralized logger setup for consistent logging across the application."""
    
    _initialized = False
    
    @classmethod
    def setup_logging(
        cls,
        log_level: str = "INFO",
        log_file: Optional[str] = None,
        format_string: Optional[str] = None
    ) -> None:
        """
        Configure logging for the entire application.
        
        Args:
            log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            log_file: Optional log file path. If None, logs to console only.
            format_string: Custom format string for log messages
        """
        if cls._initialized:
            return
            
        # Default format string - more concise for better readability
        if format_string is None:
            format_string = (
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )
        
        # Create formatter
        formatter = logging.Formatter(format_string)
        
        # Get root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(getattr(logging, log_level.upper()))
        
        # Remove existing handlers
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)
        
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)
        
        # File handler (optional)
        if log_file:
            # Ensure log directory exists
            log_path = Path(log_file)
            log_path.parent.mkdir(parents=True, exist_ok=True)
            
            file_handler = logging.FileHandler(log_file)
            file_handler.setFormatter(formatter)
            root_logger.addHandler(file_handler)
        
        # Configure third-party library logging levels to reduce noise
        cls._configure_third_party_loggers(log_level)
        
        cls._initialized = True
        
        # Log initialization
        logger = logging.getLogger(__name__)
        logger.info(f"Logging initialized with level: {log_level}")
        if log_file:
            logger.info(f"Logging to file: {log_file}")
    
    @classmethod
    def _configure_third_party_loggers(cls, main_log_level: str) -> None:
        """Configure logging levels for third-party libraries to reduce noise."""
        # Configure SQLAlchemy logging - can be controlled via environment
        import os
        sql_log_level = os.getenv("SQLALCHEMY_LOG_LEVEL", "ERROR").upper()
        
        sqlalchemy_loggers = [
            "sqlalchemy",
            "sqlalchemy.engine", 
            "sqlalchemy.engine.Engine",
            "sqlalchemy.pool",
            "sqlalchemy.dialects",
            "sqlalchemy.orm"
        ]
        
        for logger_name in sqlalchemy_loggers:
            logger = logging.getLogger(logger_name)
            logger.setLevel(getattr(logging, sql_log_level))
            # Do not propagate noisy SQL logs if we're silencing them
            if sql_log_level in ["WARNING", "ERROR", "CRITICAL"]:
                logger.propagate = False
        
        # Explicitly quiet Alembic migration logs
        alembic_loggers = [
            "alembic",
            "alembic.runtime.migration",
            "alembic.ddl",
        ]
        for logger_name in alembic_loggers:
            logger = logging.getLogger(logger_name)
            logger.setLevel(logging.ERROR)
            logger.propagate = False
        
        # Set other potentially noisy loggers
        logging.getLogger("urllib3").setLevel(logging.WARNING)
        logging.getLogger("httpx").setLevel(logging.WARNING)
        logging.getLogger("httpcore").setLevel(logging.WARNING)
        
        # For uvicorn, keep INFO level but not DEBUG
        if main_log_level.upper() == "DEBUG":
            logging.getLogger("uvicorn").setLevel(logging.INFO)
            logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    
    @classmethod
    def configure_sqlalchemy_logging(cls) -> None:
        """Configure SQLAlchemy loggers based on environment variable - call this after DB initialization."""
        import os
        sql_log_level = os.getenv("SQLALCHEMY_LOG_LEVEL", "ERROR").upper()
        
        sqlalchemy_loggers = [
            "sqlalchemy",
            "sqlalchemy.engine", 
            "sqlalchemy.engine.Engine",
            "sqlalchemy.pool",
            "sqlalchemy.dialects",
            "sqlalchemy.orm"
        ]
        
        for logger_name in sqlalchemy_loggers:
            logger = logging.getLogger(logger_name)
            logger.setLevel(getattr(logging, sql_log_level))
            # Set propagate to False only if we're silencing (WARNING or higher)
            if sql_log_level in ["WARNING", "ERROR", "CRITICAL"]:
                logger.propagate = False
        
        logger = logging.getLogger(__name__)
        logger.info(f"SQLAlchemy logging configured to {sql_log_level} level")
    
    @staticmethod
    def get_logger(name: str) -> logging.Logger:
        """
        Get a logger instance for the given name.
        
        Args:
            name: Usually __name__ of the calling module
            
        Returns:
            Configured logger instance
        """
        return logging.getLogger(name)


# Convenience function for getting loggers
def get_logger(name: str) -> logging.Logger:
    """
    Convenience function to get a logger instance.
    
    Args:
        name: Usually __name__ of the calling module
        
    Returns:
        Configured logger instance
    """
    return LoggerSetup.get_logger(name)


# Initialize logging on import (can be customized later)
LoggerSetup.setup_logging()