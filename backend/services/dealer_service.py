from models.dealer import Dealer
from models.user import User
from schemas.dealer import DealerCreate, DealerUpdate
from sqlalchemy.orm import Session
from fastapi import HTTPException


class DealerService():
    def __init__(self, db: Session):
        self.db = db

    def create_dealer_profile(self, dealer_data: DealerCreate, current_user: User):
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
            return dealer
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    def get_dealer_profile(self, current_user: User):
        try:
            dealer = self.db.query(Dealer).filter(Dealer.user_id == current_user.user_id).first()
            return dealer
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def update_dealer_profile(self, dealer_data: DealerUpdate, current_user: User):
        try:
            dealer = self.db.query(Dealer).filter(Dealer.user_id == current_user.user_id).first()
            if not dealer:
                raise HTTPException(status_code=404, detail="Dealer not found")
            dealer.customer_code = dealer_data.customer_code
            dealer.company_name = dealer_data.company_name
            dealer.contact_person = dealer_data.contact_person
            dealer.contact_number = dealer_data.contact_number
            dealer.billing_address = dealer_data.billing_address
            dealer.shipping_address = dealer_data.shipping_address
            self.db.commit()
            return dealer
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))