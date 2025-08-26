"""
Authentication service layer.
"""
from typing import Optional

from sqlalchemy.orm import Session
from uuid import UUID

from core.security import hash_password, verify_password
from models.user import User, UserRole
from core.logging import get_logger

from schemas.user import UserCreate, UserLogin, UserUpdate

logger = get_logger(__name__)


class UserService:
    """Service class for authentication operations."""

    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """
        Create a new user.
        
        Args:
            db: Database session
            user_data: User creation data
        
        Returns:
            Created user
        """
        logger.info(f"Creating new user with email: {user_data.email}")
        try:
            hashed_password = hash_password(user_data.password)
            db_user = User(
                email=user_data.email,
                password_hash=hashed_password,
                full_name=user_data.full_name,
                role=user_data.role,
                contact_number=user_data.contact_number,
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            logger.info(f"Successfully created user with ID: {db_user.user_id}")
            return db_user
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create user with email {user_data.email}: {str(e)}")
            raise

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """
        Get user by email.
        
        Args:
            db: Database session
            email: User email
        
        Returns:
            User if found, None otherwise
        """
        logger.debug(f"Searching for user with email: {email}")
        try:
            user = db.query(User).filter(User.email == email).first()
            if user:
                logger.debug(f"Found user with ID: {user.user_id}")
            else:
                logger.debug(f"No user found with email: {email}")
            return user
        except Exception as e:
            logger.error(f"Error searching for user with email {email}: {str(e)}")
            raise

    @staticmethod
    def get_user_by_id(db: Session, user_id: UUID) -> Optional[User]:
        """
        Get user by ID.
        
        Args:
            db: Database session
            user_id: User ID
        
        Returns:
            User if found, None otherwise
        """
        logger.debug(f"Searching for user with ID: {str(user_id)[:8]}...")
        try:
            user = db.query(User).filter(User.user_id == user_id).first()
            if user:
                logger.debug(f"Found user: {user.email}")
            else:
                logger.debug(f"No user found with ID: {str(user_id)[:8]}...")
            return user
        except Exception as e:
            logger.error(f"Error searching for user with ID {str(user_id)[:8]}...: {str(e)}")
            raise

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """
        Authenticate user with email and password.
        
        Args:
            db: Database session
            email: User email
            password: Plain text password
        
        Returns:
            User if authentication successful, None otherwise
        """
        logger.info(f"Authentication attempt for email: {email}")
        try:
            user = UserService.get_user_by_email(db, email)
            if not user:
                logger.warning(f"Authentication failed - user not found: {email}")
                return None
            
            if not verify_password(password, user.password_hash):
                logger.warning(f"Authentication failed - invalid password for user: {email}")
                return None
            
            logger.info(f"Authentication successful for user: {email}")
            return user
        except Exception as e:
            logger.error(f"Error during authentication for {email}: {str(e)}")
            raise

    @staticmethod
    def reset_password(db: Session, email: str, new_password: str) -> bool:
        """
        Reset user password.
        
        Args:
            db: Database session
            email: User email
            new_password: New plain text password
        
        Returns:
            True if password reset successful, False otherwise
        """
        logger.info(f"Password reset attempt for email: {email}")
        try:
            user = UserService.get_user_by_email(db, email)
            if not user:
                logger.warning(f"Password reset failed - user not found: {email}")
                return False
            
            user.password_hash = hash_password(new_password)
            db.commit()
            logger.info(f"Password reset successful for user: {email}")
            return True
        except Exception as e:
            db.rollback()
            logger.error(f"Error during password reset for {email}: {str(e)}")
            raise