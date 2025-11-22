import json
from fastapi import HTTPException, status
from core.database import supabase


class SettingsServiceSB:
    @staticmethod
    def get_app_settings():
        """Get current app settings from database"""
        try:
            res = supabase.table("app_settings").select("value").limit(1).execute()
            if res.data and len(res.data) > 0:
                settings_data = res.data[0].get("value")
                if isinstance(settings_data, str):
                    return json.loads(settings_data)
                return settings_data
            # Return default settings if none exist
            return {"vat": 0.15, "commission": 0.15}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch settings: {str(e)}"
            )

    @staticmethod
    def update_app_settings(vat: float, commission: float):
        """Update app settings in database"""
        try:
            settings_value = {
                "vat": vat,
                "commission": commission
            }
            
            # Update the single settings row (key='invoice')
            update_res = supabase.table("app_settings").update({
                "value": json.dumps(settings_value)
            }).eq("key", "invoice").execute()
            
            if not update_res.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update settings"
                )
            
            return settings_value
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update settings: {str(e)}"
            )
