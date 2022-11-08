import bcrypt
from sqlalchemy import (
    Column,
    Index,
    Integer,
    Text,
)

from .meta import Base


class UserModel(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    unique_id = Column(Text)
    created_at = Column(Text)
    modified_at = Column(Text)
    username = Column(Text)
    password = Column(Text)
    email = Column(Text)

    def validate_password(self, plaintext):
        return bcrypt.checkpw(
            plaintext.encode('ASCII'),
            self.password.encode('ASCII')
        )


Index('user_index', UserModel.unique_id, unique=True, mysql_length=255)
