from sqlalchemy import Boolean, Column, Integer, String, Date, Text
from sqlalchemy.ext.declarative import declarative_base
from database import Base
import json

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    dob = Column(Date)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50))
    designation = Column(String(255))
    _experience = Column("experience", Text)

    _skills = Column("skills", Text)  # store as JSON string
    _degree = Column("degree", Text)  # store as JSON string


    _skills = Column("skills", Text)  # store as JSON string
    _degree = Column("degree", Text)  # store as JSON string

    _skills = Column("skills", Text)  
    _degree = Column("degree", Text)  


    def get_skills(self):
        return json.loads(self._skills) if self._skills else []

    def set_skills(self, skills):
        self._skills = json.dumps(skills)

    def get_degree(self):
        return json.loads(self._degree) if self._degree else []

    def set_degree(self, degree):
        self._degree = json.dumps(degree)

    def get_experience(self):
        return json.loads(self._experience) if self._experience else []

    def set_experience(self, experience):
        self._experience = json.dumps(experience)