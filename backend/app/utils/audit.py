import logging

from sqlalchemy.orm import Session

from app.models.models import AuditLog

logger = logging.getLogger(__name__)


def create_audit_log(
    db: Session,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    details: str | None = None,
    user_id: int | None = None,
    username: str | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    audit_log = AuditLog(
        user_id=user_id,
        username=username,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
    )
    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)
    logger.info("Audit log created: %s %s %s", action, resource_type, resource_id)
    return audit_log
