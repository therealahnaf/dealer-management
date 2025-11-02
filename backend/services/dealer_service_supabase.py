# services/dealer_service_supabase.py
from core.database import supabase
from core.logging import get_logger
from core.security import hash_password
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

    @staticmethod
    def create_dealer_with_user(dealer_data, user_data):
        """
        Admin endpoint: Create a dealer with a new user account.
        dealer_data: DealerCreate schema
        user_data: dict with email, password, full_name, contact_number
        Returns: (user, dealer) tuple
        """
        logger.info(f"Admin creating dealer with user email={user_data.get('email')}")
        
        # Check if email already exists
        existing = supabase.table("users").select("user_id").eq("email", user_data["email"].lower()).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Generate customer_code based on dealer count
        all_dealers = supabase.table("dealers").select("*", count="exact").execute()
        next_customer_code = str((all_dealers.count or 0) + 1)
        
        try:
            # Create user
            hashed_password = hash_password(user_data["password"])
            user_payload = {
                "email": user_data["email"].lower(),
                "password_hash": hashed_password,
                "full_name": user_data["full_name"],
                "role": "buyer",
                "contact_number": user_data.get("contact_number"),
            }
            user_res = supabase.table("users").insert(user_payload).execute()
            if not user_res.data:
                raise HTTPException(status_code=500, detail="Failed to create user")
            
            user = user_res.data[0]
            user_id = user["user_id"]
            
            # Create dealer linked to user
            dealer_payload = {
                "customer_code": next_customer_code,
                "company_name": dealer_data.company_name,
                "contact_person": dealer_data.contact_person,
                "contact_number": dealer_data.contact_number,
                "billing_address": dealer_data.billing_address,
                "shipping_address": dealer_data.shipping_address,
                "user_id": str(user_id),
            }
            dealer_res = supabase.table("dealers").insert(dealer_payload).execute()
            if not dealer_res.data:
                raise HTTPException(status_code=500, detail="Failed to create dealer")
            
            dealer = dealer_res.data[0]
            logger.info(f"Successfully created dealer with id={dealer.get('dealer_id')} and user with id={user_id}")
            return user, dealer
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to create dealer with user: {str(e)}")
            raise HTTPException(status_code=500, detail="Could not create dealer account")

    @staticmethod
    def get_all_dealers():
        """
        Admin endpoint: Get all dealers with their user information.
        """
        logger.debug("Fetching all dealers")
        try:
            res = supabase.table("dealers").select("*").execute()
            dealers = res.data or []
            
            # Enrich with user information
            for dealer in dealers:
                if dealer.get("user_id"):
                    user_res = supabase.table("users").select("user_id,email,full_name,contact_number").eq("user_id", str(dealer["user_id"])).execute()
                    dealer["user"] = user_res.data[0] if user_res.data else None
            
            return dealers
        except Exception as e:
            logger.error(f"Error fetching all dealers: {str(e)}")
            raise HTTPException(status_code=500, detail="Could not fetch dealers")
