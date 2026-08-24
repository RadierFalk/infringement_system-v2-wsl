from pydantic import BaseModel
from typing import List, Optional


class SendingRuleBase(BaseModel):
    role: str
    send_type: str


class SendingRuleCreate(SendingRuleBase):
    category_id: int


class SendingRuleRead(SendingRuleBase):
    id: int
    category_id: int

    class Config:
        from_attributes = True


class OccurrenceCategoryBase(BaseModel):
    name: str
    description: str


class OccurrenceCategoryCreate(OccurrenceCategoryBase):
    pass


class OccurrenceCategoryRead(OccurrenceCategoryBase):
    id: int
    sending_rules: List[SendingRuleRead] = []

    class Config:
        from_attributes = True