from pydantic import BaseModel


class FileBase(BaseModel):
    file_name: str


class FileCreate(FileBase):
    pass


class FileRead(FileBase):
    id: int

    class Config:
        from_attributes = True