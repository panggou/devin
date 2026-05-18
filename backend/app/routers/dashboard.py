import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import AuditLog, Server, User
from app.schemas.schemas import DashboardStats

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get dashboard statistics overview."""
    total_servers = db.query(Server).count()
    active_servers = db.query(Server).filter(Server.status == "active").count()
    inactive_servers = total_servers - active_servers
    total_users = db.query(User).count()

    env_counts: dict[str, int] = {}
    servers = db.query(Server).all()
    for server in servers:
        env = server.environment or "unassigned"
        env_counts[env] = env_counts.get(env, 0) + 1

    recent_logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(10).all()

    return DashboardStats(
        total_servers=total_servers,
        active_servers=active_servers,
        inactive_servers=inactive_servers,
        total_users=total_users,
        environments=env_counts,
        recent_audit_logs=recent_logs,
    )
