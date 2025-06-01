from sqlalchemy import Boolean, Column, Integer, String, Date
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    dob = Column(Date)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)