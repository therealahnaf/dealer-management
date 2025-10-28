from core.database import supabase

class DocumentGenerationService:
    def generate_invoice(order):
        print(order)
        return order.data[0] if order.data else None

    def generate_po(self, order):
        pass
