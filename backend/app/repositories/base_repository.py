from sqlalchemy.orm import Session
from typing import Any, Dict, List, Optional, Type, TypeVar

ModelType = TypeVar("ModelType")


class BaseRepository:
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get(self, id: int) -> Optional[ModelType]:
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_all(self) -> List[ModelType]:
        return self.db.query(self.model).all()

    def create(self, data: Dict[str, Any]) -> ModelType:
        db_obj = self.model(**data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def update(self, id: int, data: Dict[str, Any]) -> Optional[ModelType]:
        db_obj = self.get(id)
        if not db_obj:
            return None
        for key, value in data.items():
            setattr(db_obj, key, value)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def delete(self, id: int) -> bool:
        db_obj = self.get(id)
        if not db_obj:
            return False
        self.db.delete(db_obj)
        self.db.commit()
        return True