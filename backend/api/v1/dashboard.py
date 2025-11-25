# backend/api/v1/dashboard.py
from fastapi import APIRouter, Depends, HTTPException, status
from api.v1.deps import get_current_user, require_roles
from models.user import UserRole
from services.dashboard_service import DashboardService

router = APIRouter()

@router.get("/stats", tags=["Dashboard"])
def get_dashboard_stats(
    current_user = Depends(require_roles(UserRole.admin))
):
    """
    Get dashboard statistics (Admin only)
    """
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return DashboardService.get_stats(current_user["user_id"], current_user["role"])
