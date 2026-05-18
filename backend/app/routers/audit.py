import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import AuditLog, User
from app.schemas.schemas import AuditLogResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/audit", tags=["Audit Logs"])


@router.get("/logs", response_model=list[AuditLogResponse])
def list_audit_logs(
    skip: int = 0,
    limit: int = 50,
    action: str | None = None,
    resource_type: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List audit logs with optional filtering."""
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)
    return query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()
