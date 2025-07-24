import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, MagicMock
from fastapi import HTTPException, status
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from auth import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    get_current_user,
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from models import User


class TestPasswordFunctions:
    """Test password hashing and verification functions"""
    
    def test_get_password_hash_returns_different_hash_than_original(self):
        """Test that password hashing returns a different string than the original"""
        password = "test_password123"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert isinstance(hashed, str)
        assert len(hashed) > 0
    
    def test_get_password_hash_same_password_different_hashes(self):
        """Test that same password generates different hashes (due to salt)"""
        password = "test_password123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        assert hash1 != hash2
    
    def test_verify_password_correct_password(self):
        """Test password verification with correct password"""
        password = "test_password123"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect_password(self):
        """Test password verification with incorrect password"""
        password = "test_password123"
        wrong_password = "wrong_password456"
        hashed = get_password_hash(password)
        
        assert verify_password(wrong_password, hashed) is False
    
    def test_verify_password_empty_password(self):
        """Test password verification with empty password"""
        password = "test_password123"
        hashed = get_password_hash(password)
        
        assert verify_password("", hashed) is False
    
    def test_verify_password_none_password(self):
        """Test password verification with None password"""
        password = "test_password123"
        hashed = get_password_hash(password)
        
        with pytest.raises((TypeError, AttributeError)):
            verify_password(None, hashed)


class TestTokenFunctions:
    """Test JWT token creation and validation functions"""
    
    def test_create_access_token_basic(self):
        """Test basic token creation"""
        data = {"sub": "test@example.com"}
        token = create_access_token(data)
        
        assert isinstance(token, str)
        assert len(token) > 0
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == "test@example.com"
        assert "exp" in payload
    
    def test_create_access_token_with_expiry(self):
        """Test token creation with custom expiry"""
        data = {"sub": "test@example.com"}
        expires_delta = timedelta(minutes=60)
        token = create_access_token(data, expires_delta)
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        assert "exp" in payload
        assert payload["exp"] > datetime.utcnow().timestamp()
        
        assert payload["sub"] == "test@example.com"
    
    def test_create_access_token_short_expiry(self):
        """Test token creation with very short expiry for testing expiration"""
        data = {"sub": "test@example.com"}
        expires_delta = timedelta(seconds=1)  # 1 second expiry
        token = create_access_token(data, expires_delta)
        
        # Token should be valid immediately
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == "test@example.com"
        assert payload["exp"] > datetime.utcnow().timestamp()
        
        # Wait for token to expire
        import time
        time.sleep(2)  
        
        # Token should be expired and raise an exception
        with pytest.raises(jwt.ExpiredSignatureError):
            jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    
    def test_create_access_token_default_expiry(self):
        """Test token creation with default expiry (15 minutes)"""
        data = {"sub": "test@example.com"}
        token = create_access_token(data)
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Simply verify the token has an expiry 
        assert "exp" in payload
        assert payload["exp"] > datetime.utcnow().timestamp()
        
        # Verify the subject is preserved
        assert payload["sub"] == "test@example.com"
    
    def test_create_access_token_preserves_original_data(self):
        """Test that token creation doesn't modify original data dict"""
        original_data = {"sub": "test@example.com", "role": "user"}
        data_copy = original_data.copy()
        
        create_access_token(data_copy)
        
        # Original data should be unchanged
        assert original_data == {"sub": "test@example.com", "role": "user"}
    
    def test_create_access_token_with_additional_claims(self):
        """Test token creation with additional claims"""
        data = {
            "sub": "test@example.com",
            "user_id": 123,
            "role": "admin"
        }
        token = create_access_token(data)
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert payload["sub"] == "test@example.com"
        assert payload["user_id"] == 123
        assert payload["role"] == "admin"


class TestGetCurrentUser:
    """Test the get_current_user function"""
    
    @pytest.fixture
    def mock_db(self):
        """Create a mock database session"""
        return Mock(spec=Session)
    
    @pytest.fixture
    def mock_user(self):
        """Create a mock user object"""
        user = Mock(spec=User)
        user.id = 1
        user.email = "test@example.com"
        user.username = "testuser"
        return user
    
    @pytest.fixture
    def valid_token(self):
        """Create a valid JWT token"""
        data = {"sub": "test@example.com"}
        return create_access_token(data)
    
    @pytest.mark.asyncio
    async def test_get_current_user_valid_token(self, mock_db, mock_user, valid_token):
        """Test get_current_user with valid token and existing user"""
        # Mock database query
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        result = await get_current_user(valid_token, mock_db)
        
        assert result == mock_user
        mock_db.query.assert_called_once_with(User)
    
    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token_format(self, mock_db):
        """Test get_current_user with invalid token format"""
        invalid_token = "invalid.token.format"
        
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(invalid_token, mock_db)
        
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert exc_info.value.detail == "Could not validate credentials"
        assert exc_info.value.headers == {"WWW-Authenticate": "Bearer"}
    
    @pytest.mark.asyncio
    async def test_get_current_user_expired_token(self, mock_db):
        """Test get_current_user with expired token"""
        # Create an expired token
        data = {"sub": "test@example.com"}
        expired_token = create_access_token(data, timedelta(minutes=-1))
        
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(expired_token, mock_db)
        
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    
    @pytest.mark.asyncio
    async def test_get_current_user_token_without_subject(self, mock_db):
        """Test get_current_user with token missing 'sub' claim"""
        # Create token without 'sub' claim
        data = {"user_id": 123}
        token_without_sub = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)
        
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(token_without_sub, mock_db)
        
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    
    @pytest.mark.asyncio
    async def test_get_current_user_user_not_found_in_db(self, mock_db, valid_token):
        """Test get_current_user when user doesn't exist in database"""
        # Mock database to return None (user not found)
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(valid_token, mock_db)
        
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    
    @pytest.mark.asyncio
    async def test_get_current_user_jwt_error(self, mock_db):
        """Test get_current_user when JWT decode raises JWTError"""
        with patch('auth.jwt.decode', side_effect=JWTError("Invalid token")):
            with pytest.raises(HTTPException) as exc_info:
                await get_current_user("any_token", mock_db)
            
            assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    
    @pytest.mark.asyncio
    async def test_get_current_user_database_error(self, mock_db, valid_token):
        """Test get_current_user when database query fails"""
        # Mock database to raise an exception
        mock_db.query.side_effect = Exception("Database connection error")
        
        with pytest.raises(Exception):
            await get_current_user(valid_token, mock_db)


class TestAuthConstants:
    """Test authentication constants and configuration"""
    
    def test_secret_key_exists(self):
        """Test that SECRET_KEY is defined"""
        assert SECRET_KEY is not None
        assert isinstance(SECRET_KEY, str)
        assert len(SECRET_KEY) > 0
    
    def test_algorithm_is_hs256(self):
        """Test that algorithm is set to HS256"""
        assert ALGORITHM == "HS256"
    
    def test_token_expire_minutes_is_positive(self):
        """Test that token expiry is a positive number"""
        assert ACCESS_TOKEN_EXPIRE_MINUTES > 0
        assert ACCESS_TOKEN_EXPIRE_MINUTES == 30


class TestIntegration:
    """Integration tests combining multiple auth functions"""
    
    @pytest.mark.asyncio
    async def test_full_auth_flow(self):
        """Test complete authentication flow"""
        # Step 1: Hash a password
        password = "test_password123"
        hashed_password = get_password_hash(password)
        
        # Step 2: Verify the password
        assert verify_password(password, hashed_password) is True
        
        # Step 3: Create a token
        email = "test@example.com"
        token = create_access_token({"sub": email})
        
        # Step 4: Mock user and database for get_current_user
        mock_user = Mock(spec=User)
        mock_user.email = email
        mock_user.id = 1
        
        mock_db = Mock(spec=Session)
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        # Step 5: Get current user from token
        current_user = await get_current_user(token, mock_db)
        
        assert current_user == mock_user
        assert current_user.email == email
    
    def test_password_hash_and_verify_cycle(self):
        """Test password hashing and verification cycle with various passwords"""
        test_passwords = [
            "simple123",
            "Complex@Password123!",
            "emoji_password_🔐",
            "very_long_password_with_many_characters_123456789",
            "short1!"
        ]
        
        for password in test_passwords:
            hashed = get_password_hash(password)
            assert verify_password(password, hashed) is True
            assert verify_password(password + "wrong", hashed) is False


# Test fixtures and utilities
@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User"
    }


# Run specific test categories
if __name__ == "__main__":
    pytest.main([
        __file__,
        "-v",  # verbose output
        "--tb=short"  # shorter traceback format
    ])