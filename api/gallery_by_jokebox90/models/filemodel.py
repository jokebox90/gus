from sqlalchemy import (
    Column,
    Index,
    Integer,
    Text,
)

from .meta import Base


class FileModel(Base):
    __tablename__ = 'files'
    id = Column(Integer, primary_key=True)
    unique_id = Column(Text)
    created_at = Column(Text)
    modified_at = Column(Text)
    file_type = Column(Text)
    url = Column(Text)
    owner = Column(Text)
    name = Column(Text)
    title = Column(Text)
    description = Column(Text)


Index('file_index', FileModel.unique_id, unique=True, mysql_length=255)
