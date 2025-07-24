import pytest
import json
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from database import Base
from models import User, Candidate


# Simple test database setup
@pytest.fixture
def db_session():
    """Create a test database session"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


class TestUser:
    """Tests for User model"""
    
    def test_create_user(self, db_session):
        """Test creating a user"""
        user = User(
            full_name="John Doe",
            username="johndoe",
            email="john@example.com",
            dob=date(1995, 5, 15),
            hashed_password="hashed_password"
        )
        
        db_session.add(user)
        db_session.commit()
        
        saved_user = db_session.query(User).first()
        assert saved_user.full_name == "John Doe"
        assert saved_user.username == "johndoe"
        assert saved_user.email == "john@example.com"
        assert saved_user.is_active is True  # Default value
    
    def test_unique_email(self, db_session):
        """Test email uniqueness constraint"""
        user1 = User(
            full_name="User 1", username="user1", email="same@email.com",
            dob=date(1990, 1, 1), hashed_password="pass1"
        )
        user2 = User(
            full_name="User 2", username="user2", email="same@email.com",
            dob=date(1991, 1, 1), hashed_password="pass2"
        )
        
        db_session.add(user1)
        db_session.commit()
        
        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_unique_username(self, db_session):
        """Test username uniqueness constraint"""
        user1 = User(
            full_name="User 1", username="sameuser", email="user1@email.com",
            dob=date(1990, 1, 1), hashed_password="pass1"
        )
        user2 = User(
            full_name="User 2", username="sameuser", email="user2@email.com",
            dob=date(1991, 1, 1), hashed_password="pass2"
        )
        
        db_session.add(user1)
        db_session.commit()
        
        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()


class TestCandidate:
    """Tests for Candidate model"""
    
    def test_create_candidate(self, db_session):
        """Test creating a candidate"""
        candidate = Candidate(
            name="Alice Smith",
            email="alice@example.com",
            phone="123-456-7890",
            designation="Software Engineer"
        )
        
        db_session.add(candidate)
        db_session.commit()
        
        saved_candidate = db_session.query(Candidate).first()
        assert saved_candidate.name == "Alice Smith"
        assert saved_candidate.email == "alice@example.com"
        assert saved_candidate.phone == "123-456-7890"
        assert saved_candidate.designation == "Software Engineer"
    
    def test_skills_json_storage(self, db_session):
        """Test skills JSON storage and retrieval"""
        candidate = Candidate(name="Test", email="test@email.com")
        
        # Set skills
        skills = ["Python", "JavaScript", "SQL"]
        candidate.set_skills(skills)
        
        db_session.add(candidate)
        db_session.commit()
        
        # Get skills
        saved_candidate = db_session.query(Candidate).first()
        retrieved_skills = saved_candidate.get_skills()
        
        assert retrieved_skills == skills
    
    def test_degree_json_storage(self, db_session):
        """Test degree JSON storage and retrieval"""
        candidate = Candidate(name="Test", email="test@email.com")
        
        # Set degrees
        degrees = ["Bachelor CS", "Master SE"]
        candidate.set_degree(degrees)
        
        db_session.add(candidate)
        db_session.commit()
        
        # Get degrees
        saved_candidate = db_session.query(Candidate).first()
        retrieved_degrees = saved_candidate.get_degree()
        
        assert retrieved_degrees == degrees
    
    def test_experience_json_storage(self, db_session):
        """Test experience JSON storage and retrieval"""
        candidate = Candidate(name="Test", email="test@email.com")
        
        # Set experience
        experience = ["2 years at Company A", "3 years at Company B"]
        candidate.set_experience(experience)
        
        db_session.add(candidate)
        db_session.commit()
        
        # Get experience
        saved_candidate = db_session.query(Candidate).first()
        retrieved_experience = saved_candidate.get_experience()
        
        assert retrieved_experience == experience
    
    def test_empty_json_fields(self, db_session):
        """Test empty JSON fields return empty lists"""
        candidate = Candidate(name="Test", email="test@email.com")
        
        db_session.add(candidate)
        db_session.commit()
        
        saved_candidate = db_session.query(Candidate).first()
        assert saved_candidate.get_skills() == []
        assert saved_candidate.get_degree() == []
        assert saved_candidate.get_experience() == []
    
    def test_unique_email(self, db_session):
        """Test candidate email uniqueness"""
        candidate1 = Candidate(name="Candidate 1", email="same@email.com")
        candidate2 = Candidate(name="Candidate 2", email="same@email.com")
        
        db_session.add(candidate1)
        db_session.commit()
        
        db_session.add(candidate2)
        with pytest.raises(IntegrityError):
            db_session.commit()