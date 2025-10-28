from fastapi import FastAPI
from api.v1 import users, dealers, products, purchase_orders, settings
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ASK Intl Dealer Management Platform", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(dealers.router, prefix="/api/v1/dealers", tags=["Dealers"])
app.include_router(products.router, prefix="/api/v1/products", tags=["Products"])
app.include_router(purchase_orders.router, prefix="/api/v1/purchase-orders", tags=["Purchase Orders"])
app.include_router(settings.router, prefix="/api/v1/settings", tags=["Settings"])