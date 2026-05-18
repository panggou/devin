import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.models import User
from app.schemas.schemas import LoginRequest, MessageResponse, TokenResponse, UserCreate, UserResponse
from app.utils.audit import create_audit_log

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, request: Request, db: Session = Depends(get_db)):
    """Register a new user account."""
    existing = db.query(User).filter((User.username == user_data.username) | (User.email == user_data.email)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        )

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    create_audit_log(
        db=db,
        action="register",
        resource_type="user",
        resource_id=str(user.id),
        details=f"User {user.username} registered",
        user_id=user.id,
        username=user.username,
        ip_address=request.client.host if request.client else None,
    )

    logger.info("New user registered: %s", user.username)
    return user


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    access_token = create_access_token(data={"sub": user.username})

    create_audit_log(
        db=db,
        action="login",
        resource_type="user",
        resource_id=str(user.id),
        details=f"User {user.username} logged in",
        user_id=user.id,
        username=user.username,
        ip_address=request.client.host if request.client else None,
    )

    logger.info("User logged in: %s", user.username)
    return TokenResponse(access_token=access_token, username=user.username)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return current_user


@router.post("/seed", response_model=MessageResponse)
def seed_admin(db: Session = Depends(get_db)):
    """Create default admin user if not exists (for initial setup)."""
    existing = db.query(User).filter(User.username == "admin").first()
    if existing:
        return MessageResponse(message="Admin user already exists")

    admin = User(
        username="admin",
        email="admin@opsinsight.local",
        hashed_password=get_password_hash("admin123"),
        is_admin=True,
    )
    db.add(admin)
    db.commit()
    logger.info("Admin user seeded")
    return MessageResponse(message="Admin user created with username: admin, password: admin123")
