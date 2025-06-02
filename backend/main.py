from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, validator
from datetime import date
from typing import Optional

from database import engine, get_db
from models import User, Base
from auth import get_password_hash, create_access_token, verify_password, get_current_user

app = FastAPI(title="User Authentication API", version="1.0.0")

#Creating database tables
Base.metadata.create_all(bind=engine)

#CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCreate(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    confirm_email: EmailStr
    dob: date
    password: str
    confirm_password: str

    @validator('confirm_email')
    def emails_match(cls, v, values):
        if 'email' in values and v != values['email']:
            raise ValueError('Emails do not match')
        return v

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

    @validator('password')
    def password_complexity(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isalpha() for c in v):
            raise ValueError('Password must contain at least one letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v

    @validator('username')
    def username_validation(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v) > 30:
            raise ValueError('Username must be less than 30 characters')
        return v.lower()

    @validator('full_name')
    def name_validation(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Full name must be at least 2 characters long')
        return v.strip()

class UserResponse(BaseModel):
    id: int
    full_name: str
    username: str
    email: str
    dob: date
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

@app.get("/")
async def root():
    return {"message": "FastAPI User Authentication API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/check-username")
async def check_username(username: str, db: Session = Depends(get_db)):
    if len(username) < 3:
        return {"available": False, "message": "Username too short"}
    
    user = db.query(User).filter(User.username == username.lower()).first()
    return {
        "available": user is None,
        "message": "Username available" if user is None else "Username taken"
    }

@app.get("/check-email")
async def check_email(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email.lower()).first()
    return {
        "available": user is None,
        "message": "Email available" if user is None else "Email already registered"
    }

@app.post("/signup")
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    # Check if username or email exists
    existing_user = db.query(User).filter(
        (User.username == user.username.lower()) | 
        (User.email == user.email.lower())
    ).first()
    
    if existing_user:
        if existing_user.username == user.username.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

    try:
        hashed_password = get_password_hash(user.password)
        
        new_user = User(
            full_name=user.full_name,
            username=user.username.lower(),
            email=user.email.lower(),
            dob=user.dob,
            hashed_password=hashed_password
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {"message": "User created successfully", "user_id": new_user.id}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user"
        )

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == form_data.username.lower()) | 
        (User.username == form_data.username.lower())
    ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

#MS1