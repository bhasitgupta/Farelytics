from typing import Optional
from pydantic import BaseModel

class User(BaseModel):
    id: str
    email: Optional[str] = None
    role: str = "authenticated"
    provider: str = "google"
