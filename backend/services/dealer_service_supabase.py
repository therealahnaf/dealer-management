# services/dealer_service_supabase.py
from core.database import supabase
from core.logging import get_logger
from fastapi import HTTPException

logger = get_logger(__name__)

class DealerServiceSB:
    """Dealer service using Supabase client."""

    @staticmethod
    def create_dealer_profile(dealer_data, current_user):
        """
        Create a dealer profile for the given user.
        dealer_data: DealerCreate Pydantic schema
        current_user: dict (from Supabase users table)
        """
        logger.info(f"Creating dealer profile for user_id={current_user['user_id']}")

        payload = {
            "customer_code": dealer_data.customer_code,
            "company_name": dealer_data.company_name,
            "contact_person": dealer_data.contact_person,
            "contact_number": dealer_data.contact_number,
            "billing_address": dealer_data.billing_address,
            "shipping_address": dealer_data.shipping_address,
            "user_id": str(current_user["user_id"]),
        }

        try:
            res = supabase.table("dealers").insert(payload).execute()
            dealer = res.data[0] if res.data else None
            logger.info(f"Dealer profile created with id={dealer.get('dealer_id') if dealer else 'N/A'}")
            return dealer
        except Exception as e:
            logger.error(f"Failed to create dealer profile: {str(e)}")
            raise HTTPException(status_code=500, detail="Could not create dealer profile")

    @staticmethod
    def get_dealer_profile(current_user):
        """
        Fetch dealer profile for the given user.
        """
        logger.debug(f"Fetching dealer profile for user_id={current_user['user_id']}")
        try:
            res = supabase.table("dealers").select("*").eq("user_id", str(current_user["user_id"])).execute()
            return res.data[0] if res.data else None
        except Exception as e:
            logger.error(f"Error fetching dealer profile: {str(e)}")
            raise HTTPException(status_code=500, detail="Could not fetch dealer profile")

    @staticmethod
    def update_dealer_profile(dealer_data, current_user):
        """
        Update dealer profile for the given user.
        """
        logger.info(f"Updating dealer profile for user_id={current_user['user_id']}")
        try:
            res = supabase.table("dealers").update({
                "customer_code": dealer_data.customer_code,
                "company_name": dealer_data.company_name,
                "contact_person": dealer_data.contact_person,
                "contact_number": dealer_data.contact_number,
                "billing_address": dealer_data.billing_address,
                "shipping_address": dealer_data.shipping_address,
            }).eq("user_id", str(current_user["user_id"])).execute()

            return res.data[0] if res.data else None
        except Exception as e:
            logger.error(f"Failed to update dealer profile: {str(e)}")
            raise HTTPException(status_code=500, detail="Could not update dealer profile")
