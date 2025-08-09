"""
Dealers API endpoints.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from api.v1.deps import get_db, require_roles
from models.user import User, UserRole
from schemas.dealer import DealerCreate, DealerUpdate
from services.dealer_service import DealerService

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_dealer_profile(
    payload: DealerCreate,
    current_user: User = Depends(require_roles(UserRole.buyer)),
    db: Session = Depends(get_db),
):
    dealer_service = DealerService(db)
    dealer_service.create_dealer_profile(payload, current_user)


@router.get("/my-profile")
def get_my_profile(
    current_user: User = Depends(require_roles(UserRole.buyer)),
    db: Session = Depends(get_db),
):
    dealer_service = DealerService(db)
    return dealer_service.get_dealer_profile(current_user)


@router.put("/my-profile")
def update_my_profile(
    payload: DealerUpdate,
    current_user: User = Depends(require_roles(UserRole.buyer)),
    db: Session = Depends(get_db),
):
    dealer_service = DealerService(db)
    dealer_service.update_dealer_profile(payload, current_user)
    