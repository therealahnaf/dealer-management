"""
Dealers API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status

from api.v1.deps import require_roles
from models.user import UserRole
from schemas.dealer import DealerCreate, DealerUpdate, DealerBase, DealerWithUserCreate, DealerWithUserRead
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


@router.post("/admin/create", response_model=DealerWithUserRead, status_code=status.HTTP_201_CREATED)
def admin_create_dealer(
    dealer_data: DealerWithUserCreate,
    current_user = Depends(require_roles(UserRole.admin)),
):
    """Admin endpoint: Create a dealer with a new user account"""
    user_info = {
        "email": dealer_data.email,
        "password": dealer_data.password,
        "full_name": dealer_data.full_name,
        "contact_number": dealer_data.contact_number,
    }
    
    dealer_info = DealerCreate(
        customer_code="",  # Will be auto-generated in service
        company_name=dealer_data.company_name,
        contact_person=dealer_data.contact_person,
        contact_number=dealer_data.contact_number,
        billing_address=dealer_data.billing_address,
        shipping_address=dealer_data.shipping_address,
    )
    
    user, dealer = DealerService.create_dealer_with_user(dealer_info, user_info)
    
    return {
        **dealer,
        "user": user,
    }


@router.get("/admin/all", status_code=status.HTTP_200_OK)
def admin_get_all_dealers(
    current_user = Depends(require_roles(UserRole.admin)),
):
    """Admin endpoint: Get all dealers with user information"""
    return DealerService.get_all_dealers()
