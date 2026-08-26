from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

from .employee import EmployeeRead
from .file import FileRead
from .occurrence_category import OccurrenceCategoryRead


class StatusEnum(str, Enum):
    CREATED = "Created"
    SENT = "Sent"
    RESPONSE_RECEIVED = "Response received"
    RESPONSE_REJECTED = "Response rejected"
    RESOLVED = "Resolved"


class OccurrenceBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: StatusEnum = StatusEnum.CREATED
    date: datetime
    employee_id: int
    file_id: Optional[int] = None
    category_id: Optional[int] = None


class OccurrenceCreate(OccurrenceBase):
    category_id: int


class OccurrenceRead(OccurrenceBase):
    id: int
    employee: EmployeeRead
    file: Optional[FileRead] = None
    category: Optional[OccurrenceCategoryRead] = None

    class Config:
        from_attributes = True