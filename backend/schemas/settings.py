from pydantic import BaseModel
from typing import Optional


class AppSettingsUpdate(BaseModel):
    vat: float
    commission: float


class AppSettingsRead(BaseModel):
    vat: float
    commission: float
