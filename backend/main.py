from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File 
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, validator
from datetime import date
from typing import Optional, List, Dict, Any
import os
import uuid

from database import engine, get_db, SessionLocal, Base
from models import User, Candidate
from auth import get_password_hash, create_access_token, verify_password, get_current_user
from parser import parse_resume, logging

app = FastAPI(title="User Authentication API", version="1.0.0")
logger = logging.getLogger("uvicorn.error")

#Creating database tables
Base.metadata.create_all(bind=engine)

#CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://127.0.0.1:3000",
        "https://internuship.netlify.app/"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

class CandidateResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    skills: List[str]
    degree: List[str]
    experience: int
    designation: str

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

@app.post("/upload-resume", response_model=Dict[str, Any])  # More specific type hint
async def upload_resume(
    resume: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    """Upload and parse resume file"""
    filepath = None  # Initialize filepath early
    try:
        allowed_extensions = {'.pdf', '.doc', '.docx', '.txt'}
        file_extension = os.path.splitext(resume.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type '{file_extension}'. Allowed types: PDF, DOC, DOCX, TXT"
            )
        
        content = await resume.read()
        if len(content) > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(status_code=400, detail="File too large. Maximum size allowed: 10MB")

        os.makedirs("uploads", exist_ok=True)
        unique_filename = f"{uuid.uuid4()}_{resume.filename}"
        filepath = os.path.join("uploads", unique_filename)

        with open(filepath, "wb") as f:
            f.write(content)

        parsed = parse_resume(filepath)
        if not parsed or not parsed.get('email'):
            raise HTTPException(status_code=400, detail="Failed to parse resume - no valid email found")

        existing_candidate = db.query(Candidate).filter(
            Candidate.email == parsed.get('email').lower()
        ).first()

        if existing_candidate:
            existing_candidate.name = parsed.get('name') or existing_candidate.name
            existing_candidate.phone = parsed.get('phone') or existing_candidate.phone
            existing_candidate.designation = parsed.get('designation') or existing_candidate.designation
            
            if parsed.get('skills'):
                existing_candidate.set_skills(parsed.get('skills'))
            if parsed.get('degree'):
                existing_candidate.set_degree(parsed.get('degree'))
            if parsed.get("experience"):
                existing_candidate.set_experience(parsed.get("experience"))
            
            db.commit()
            db.refresh(existing_candidate)
            candidate_id = existing_candidate.id
            logger.info(f"Updated existing candidate: {existing_candidate.email}")
        else:
            cand = Candidate(
                name=parsed.get('name'),
                email=parsed.get('email').lower(),
                phone=parsed.get('phone'),
                designation=parsed.get('designation')
            )
            cand.set_skills(parsed.get('skills', []))
            cand.set_degree(parsed.get('degree', []))
            cand.set_experience(parsed.get("experience", []))
            
            db.add(cand)
            db.commit()
            db.refresh(cand)
            candidate_id = cand.id
            logger.info(f"Created new candidate: {cand.email}")

        final_candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()

        return {
            'status': 'success',
            'message': 'Resume processed successfully',
            'candidate_id': candidate_id,
            'data': {
                'name': final_candidate.name,
                'email': final_candidate.email,
                'phone': final_candidate.phone,
                'skills': final_candidate.get_skills(),
                'degree': final_candidate.get_degree(),
                'experience': final_candidate.get_experience(),
                'designation': final_candidate.designation
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing resume: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Error processing resume file")
    finally:
        if filepath and os.path.exists(filepath):
            try:
                os.remove(filepath)
            except Exception as e:
                logger.warning(f"Failed to clean up file {filepath}: {str(e)}")
        db.close()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    logger.info("Starting FastAPI application...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False, log_level="info")
