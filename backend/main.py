from fastapi import FastAPI
from api.v1 import users, dealers

app = FastAPI(title="ASK Intl Dealer Management Platform", version="1.0")

app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(dealers.router, prefix="/api/v1/dealers", tags=["Dealers"])
