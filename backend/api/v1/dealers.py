"""
Dealers API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status

from api.v1.deps import require_roles
from models.user import UserRole
from schemas.dealer import DealerCreate, DealerUpdate, DealerBase
from services.dealer_service_supabase import DealerServiceSB as DealerService  # <- use Supabase service

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_dealer_profile(
    dealer_data: DealerCreate,
    current_user = Depends(require_roles(UserRole.buyer)),
):
    DealerService.create_dealer_profile(dealer_data, current_user)
    return {"message": "Dealer profile created successfully"}


@router.get("/my-profile", response_model=DealerBase)
def get_my_profile(
    current_user = Depends(require_roles(UserRole.buyer)),
):
    dealer = DealerService.get_dealer_profile(current_user)
    if not dealer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dealer profile not found",
        )
    return dealer


@router.put("/my-profile")
def update_my_profile(
    dealer_data: DealerUpdate,
    current_user = Depends(require_roles(UserRole.buyer)),
):
    DealerService.update_dealer_profile(dealer_data, current_user)
    return {"message": "Dealer profile updated successfully"}
