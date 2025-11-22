from fastapi import APIRouter, Depends, HTTPException, status
from schemas.settings import AppSettingsRead, AppSettingsUpdate
from services.settings_service_supabase import SettingsServiceSB
from api.v1.deps import require_roles
from models.user import UserRole

router = APIRouter()


@router.get("/", response_model=AppSettingsRead, tags=["Settings"])
def get_app_settings(
    current_user = Depends(require_roles(UserRole.admin))
):
    """
    Get current app settings (admin only)
    """
    return SettingsServiceSB.get_app_settings()


@router.put("/", response_model=AppSettingsRead, tags=["Settings"])
def update_app_settings(
    settings_in: AppSettingsUpdate,
    current_user = Depends(require_roles(UserRole.admin))
):
    """
    Update app settings (admin only)
    """
    return SettingsServiceSB.update_app_settings(
        vat=settings_in.vat,
        commission=settings_in.commission
    )
