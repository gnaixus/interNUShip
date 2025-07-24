import pytest
import os
import sys
import json
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date
import io

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import main
    from main import app, get_db, UserCreate
    from database import Base
    from models import User, Candidate
    from auth import create_access_token, get_password_hash
except ImportError as e:
    print(f"Import error: {e}")
    raise

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_simple.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Override the dependency
app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def sample_user_data():
    """Sample valid user data for testing"""
    return {
        "full_name": "John Doe",
        "username": "johndoe",
        "email": "john@example.com",
        "confirm_email": "john@example.com",
        "dob": "1990-01-01",
        "password": "Password123",
        "confirm_password": "Password123"
    }

@pytest.fixture
def existing_user(db_session):
    """Create an existing user in the database"""
    user = User(
        full_name="Existing User",
        username="existinguser", 
        email="existing@example.com",
        dob=date(1990, 1, 1),
        hashed_password=get_password_hash("password123")
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers(existing_user):
    """Create authorization headers for authenticated requests"""
    token = create_access_token(data={"sub": existing_user.email})
    return {"Authorization": f"Bearer {token}"}

class TestBasicEndpoints:
    """Test basic application endpoints"""
    
    def test_root_endpoint(self):
        """Test the root endpoint returns correct message"""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "FastAPI User Authentication API"}
    
    def test_health_check_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}

class TestUserValidationEndpoints:
    """Test user validation endpoints"""
    
    def test_check_username_available(self, db_session):
        """Test username availability - available username"""
        response = client.get("/check-username?username=newuser")
        assert response.status_code == 200
        data = response.json()
        assert data["available"] is True
        assert data["message"] == "Username available"
    
    def test_check_username_taken(self, existing_user):
        """Test username availability - taken username"""
        response = client.get(f"/check-username?username={existing_user.username}")
        assert response.status_code == 200
        data = response.json()
        assert data["available"] is False
        assert data["message"] == "Username taken"
    
    def test_check_username_too_short(self, db_session):
        """Test username validation - too short"""
        response = client.get("/check-username?username=ab")
        assert response.status_code == 200
        data = response.json()
        assert data["available"] is False
        assert data["message"] == "Username too short"
    
    def test_check_email_available(self, db_session):
        """Test email availability - available email"""
        response = client.get("/check-email?email=new@example.com")
        assert response.status_code == 200
        data = response.json()
        assert data["available"] is True
        assert data["message"] == "Email available"
    
    def test_check_email_taken(self, existing_user):
        """Test email availability - taken email"""
        response = client.get(f"/check-email?email={existing_user.email}")
        assert response.status_code == 200
        data = response.json()
        assert data["available"] is False
        assert data["message"] == "Email already registered"

class TestUserRegistration:
    """Test user registration functionality"""
    
    def test_successful_signup(self, sample_user_data, db_session):
        """Test successful user registration"""
        response = client.post("/signup", json=sample_user_data)
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "User created successfully"
        assert "user_id" in data
        
        # Verify user was created in database
        user = db_session.query(User).filter(User.email == sample_user_data["email"].lower()).first()
        assert user is not None
        assert user.full_name == sample_user_data["full_name"]
        assert user.username == sample_user_data["username"].lower()
    
    def test_signup_duplicate_username(self, sample_user_data, existing_user):
        """Test signup with existing username"""
        sample_user_data["username"] = existing_user.username
        sample_user_data["email"] = "different@example.com"
        sample_user_data["confirm_email"] = "different@example.com"
        
        response = client.post("/signup", json=sample_user_data)
        assert response.status_code == 400
        assert "Username already exists" in response.json()["detail"]
    
    def test_signup_duplicate_email(self, sample_user_data, existing_user):
        """Test signup with existing email"""
        sample_user_data["email"] = existing_user.email
        sample_user_data["confirm_email"] = existing_user.email
        sample_user_data["username"] = "differentuser"
        
        response = client.post("/signup", json=sample_user_data)
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

class TestAuthentication:
    """Test user authentication functionality"""
    
    def test_successful_login_with_email(self, existing_user):
        """Test successful login using email"""
        response = client.post(
            "/token",
            data={"username": existing_user.email, "password": "password123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["token_type"] == "bearer"
        assert "access_token" in data
    
    def test_successful_login_with_username(self, existing_user):
        """Test successful login using username"""
        response = client.post(
            "/token",
            data={"username": existing_user.username, "password": "password123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["token_type"] == "bearer"
        assert "access_token" in data
    
    def test_login_wrong_password(self, existing_user):
        """Test login with incorrect password"""
        response = client.post(
            "/token",
            data={"username": existing_user.email, "password": "wrongpassword"}
        )
        assert response.status_code == 401
        assert "Incorrect username/email or password" in response.json()["detail"]
    
    def test_login_nonexistent_user(self, db_session):
        """Test login with non-existent user"""
        response = client.post(
            "/token",
            data={"username": "nonexistent@example.com", "password": "password123"}
        )
        assert response.status_code == 401
        assert "Incorrect username/email or password" in response.json()["detail"]
    
    def test_get_current_user_info(self, existing_user, auth_headers):
        """Test getting current user information"""
        response = client.get("/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == existing_user.full_name
        assert data["username"] == existing_user.username
        assert data["email"] == existing_user.email
        assert data["id"] == existing_user.id
    
    def test_get_current_user_info_unauthorized(self):
        """Test getting user info without authentication"""
        response = client.get("/me")
        assert response.status_code == 401

class TestResumeUploadBasic:
    """Test basic resume upload functionality"""
    
    def test_resume_upload_invalid_file_type(self, db_session):
        """Test resume upload with invalid file type"""
        file_content = b"Invalid file content"
        files = {"resume": ("resume.xyz", io.BytesIO(file_content), "application/unknown")}
        
        response = client.post("/upload-resume", files=files)
        
        assert response.status_code == 400
        assert "Invalid file type" in response.json()["detail"]
    
    def test_resume_upload_file_too_large(self, db_session):
        """Test resume upload with file too large"""
        # Create a file larger than 10MB
        large_content = b"x" * (11 * 1024 * 1024)  # 11MB
        files = {"resume": ("large_resume.pdf", io.BytesIO(large_content), "application/pdf")}
        
        response = client.post("/upload-resume", files=files)
        
        assert response.status_code == 400
        assert "File too large" in response.json()["detail"]

class TestPydanticModels:
    """Test Pydantic model validations"""
    
    def test_user_create_valid(self):
        """Test UserCreate model with valid data"""
        user_data = {
            "full_name": "John Doe",
            "username": "johndoe",
            "email": "john@example.com",
            "confirm_email": "john@example.com",
            "dob": date(1990, 1, 1),
            "password": "Password123",
            "confirm_password": "Password123"
        }
        user = UserCreate(**user_data)
        assert user.full_name == "John Doe"
        assert user.username == "johndoe"
        assert user.email == "john@example.com"
    
    def test_user_create_password_mismatch(self):
        """Test UserCreate validation with password mismatch"""
        user_data = {
            "full_name": "John Doe",
            "username": "johndoe",
            "email": "john@example.com",
            "confirm_email": "john@example.com",
            "dob": date(1990, 1, 1),
            "password": "Password123",
            "confirm_password": "DifferentPassword"
        }
        with pytest.raises(ValueError, match="Passwords do not match"):
            UserCreate(**user_data)
    
    def test_user_create_email_mismatch(self):
        """Test UserCreate validation with email mismatch"""
        user_data = {
            "full_name": "John Doe",
            "username": "johndoe",
            "email": "john@example.com",
            "confirm_email": "different@example.com",
            "dob": date(1990, 1, 1),
            "password": "Password123",
            "confirm_password": "Password123"
        }
        with pytest.raises(ValueError, match="Emails do not match"):
            UserCreate(**user_data)
    
    def test_user_create_weak_password(self):
        """Test UserCreate validation with weak password"""
        user_data = {
            "full_name": "John Doe",
            "username": "johndoe",
            "email": "john@example.com",
            "confirm_email": "john@example.com",
            "dob": date(1990, 1, 1),
            "password": "weak",
            "confirm_password": "weak"
        }
        with pytest.raises(ValueError, match="Password must be at least 8 characters long"):
            UserCreate(**user_data)
    
    def test_user_create_short_username(self):
        """Test UserCreate validation with short username"""
        user_data = {
            "full_name": "John Doe",
            "username": "jo",
            "email": "john@example.com",
            "confirm_email": "john@example.com",
            "dob": date(1990, 1, 1),
            "password": "Password123",
            "confirm_password": "Password123"
        }
        with pytest.raises(ValueError, match="Username must be at least 3 characters long"):
            UserCreate(**user_data)

class TestAdvancedResumeUpload:
    """Test advanced resume upload functionality with mocking"""
    
    @patch('main.parse_resume')
    @patch('main.os.makedirs')
    @patch('main.os.path.exists')
    @patch('main.os.remove')
    def test_successful_resume_upload_new_candidate(
        self, mock_remove, mock_exists, mock_makedirs, mock_parse_resume, db_session
    ):
        """Test successful resume upload for new candidate"""
        # Mock the parse_resume function
        mock_parse_resume.return_value = {
            'name': 'John Smith',
            'email': 'johnsmith@example.com',
            'phone': '555-0123',
            'skills': ['Python', 'JavaScript'],
            'degree': ['Bachelor of Science'],
            'designation': 'Software Developer',
            'experience': [3]
        }
        
        mock_exists.return_value = True
        
        # Create a mock file
        file_content = b"Mock resume content"
        files = {"resume": ("resume.pdf", io.BytesIO(file_content), "application/pdf")}
        
        response = client.post("/upload-resume", files=files)
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["message"] == "Resume processed successfully"
        assert "candidate_id" in data
        assert "data" in data
        
        # Verify candidate was created
        candidate = db_session.query(Candidate).filter(
            Candidate.email == "johnsmith@example.com"
        ).first()
        assert candidate is not None
        assert candidate.name == "John Smith"
    
    @patch('main.parse_resume')
    def test_resume_upload_parse_failure(self, mock_parse_resume, db_session):
        """Test resume upload when parsing fails"""
        mock_parse_resume.return_value = None
        
        file_content = b"Unparseable resume content"
        files = {"resume": ("resume.pdf", io.BytesIO(file_content), "application/pdf")}
        
        with patch('main.os.makedirs'), patch('main.os.path.exists', return_value=True), \
             patch('main.os.remove'):
            response = client.post("/upload-resume", files=files)
        
        assert response.status_code == 400
        assert "Failed to parse resume" in response.json()["detail"]

def teardown_module():
    """Clean up after all tests are done"""
    if os.path.exists("test_simple.db"):
        try:
            os.remove("test_simple.db")
        except Exception:
            pass

if __name__ == "__main__":
    pytest.main([__file__, "-v"])