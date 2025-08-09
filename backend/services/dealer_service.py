from models.dealer import Dealer
from models.user import User
from schemas.dealer import DealerCreate, DealerUpdate
from sqlalchemy.orm import Session
from fastapi import HTTPException
from core.logging import get_logger

logger = get_logger(__name__)

class DealerService():
    def __init__(self, db: Session):
        self.db = db

    def create_dealer_profile(self, dealer_data: DealerCreate, current_user: User):
        logger.info(f"Creating dealer profile for user_id={current_user.user_id}")
        try:
            dealer = Dealer(
                customer_code=dealer_data.customer_code,
                company_name=dealer_data.company_name,
                contact_person=dealer_data.contact_person,
                contact_number=dealer_data.contact_number,
                billing_address=dealer_data.billing_address,
                shipping_address=dealer_data.shipping_address,
                user_id=current_user.user_id,
            )
            self.db.add(dealer)
            self.db.commit()
            logger.info(f"Dealer profile created with id={dealer.dealer_id} for user_id={current_user.user_id}")
            return dealer
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create dealer profile for user_id={current_user.user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def get_dealer_profile(self, current_user: User):
        logger.debug(f"Fetching dealer profile for user_id={current_user.user_id}")
        try:
            dealer = self.db.query(Dealer).filter(Dealer.user_id == current_user.user_id).first()
            if dealer:
                logger.debug(f"Dealer profile found: dealer_id={dealer.dealer_id} for user_id={current_user.user_id}")
            else:
                logger.warning(f"No dealer profile found for user_id={current_user.user_id}")
            return dealer
        except Exception as e:
            logger.error(f"Error fetching dealer profile for user_id={current_user.user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    def update_dealer_profile(self, dealer_data: DealerUpdate, current_user: User):
        logger.info(f"Updating dealer profile for user_id={current_user.user_id}")
        try:
            dealer = self.db.query(Dealer).filter(Dealer.user_id == current_user.user_id).first()
            if not dealer:
                logger.warning(f"Dealer profile not found for user_id={current_user.user_id}")
                raise HTTPException(status_code=404, detail="Dealer not found")
            dealer.customer_code = dealer_data.customer_code
            dealer.company_name = dealer_data.company_name
            dealer.contact_person = dealer_data.contact_person
            dealer.contact_number = dealer_data.contact_number
            dealer.billing_address = dealer_data.billing_address
            dealer.shipping_address = dealer_data.shipping_address
            self.db.commit()
            logger.info(f"Dealer profile updated: dealer_id={dealer.dealer_id} for user_id={current_user.user_id}")
            return dealer
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to update dealer profile for user_id={current_user.user_id}: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))