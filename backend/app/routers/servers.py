import logging

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.models import Server, User
from app.schemas.schemas import CSVUploadResponse, ServerCreate, ServerResponse, ServerUpdate
from app.utils.audit import create_audit_log
from app.utils.csv_parser import parse_csv_content

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/servers", tags=["Servers"])


@router.get("", response_model=list[ServerResponse])
def list_servers(
    skip: int = 0,
    limit: int = 100,
    environment: str | None = None,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all servers with optional filtering."""
    query = db.query(Server)
    if environment:
        query = query.filter(Server.environment == environment)
    if status_filter:
        query = query.filter(Server.status == status_filter)
    return query.offset(skip).limit(limit).all()


@router.get("/{server_id}", response_model=ServerResponse)
def get_server(
    server_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific server by ID."""
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Server not found")
    return server


@router.post("", response_model=ServerResponse, status_code=status.HTTP_201_CREATED)
def create_server(
    server_data: ServerCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new server entry."""
    existing = db.query(Server).filter(Server.hostname == server_data.hostname).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Server with hostname '{server_data.hostname}' already exists",
        )

    server = Server(**server_data.model_dump())
    db.add(server)
    db.commit()
    db.refresh(server)

    create_audit_log(
        db=db,
        action="create",
        resource_type="server",
        resource_id=str(server.id),
        details=f"Server {server.hostname} created",
        user_id=current_user.id,
        username=current_user.username,
        ip_address=request.client.host if request.client else None,
    )

    logger.info("Server created: %s", server.hostname)
    return server


@router.put("/{server_id}", response_model=ServerResponse)
def update_server(
    server_id: int,
    server_data: ServerUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing server."""
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Server not found")

    update_data = server_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(server, field, value)

    db.commit()
    db.refresh(server)

    create_audit_log(
        db=db,
        action="update",
        resource_type="server",
        resource_id=str(server.id),
        details=f"Server {server.hostname} updated: {list(update_data.keys())}",
        user_id=current_user.id,
        username=current_user.username,
        ip_address=request.client.host if request.client else None,
    )

    logger.info("Server updated: %s", server.hostname)
    return server


@router.delete("/{server_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_server(
    server_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a server."""
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Server not found")

    hostname = server.hostname
    db.delete(server)
    db.commit()

    create_audit_log(
        db=db,
        action="delete",
        resource_type="server",
        resource_id=str(server_id),
        details=f"Server {hostname} deleted",
        user_id=current_user.id,
        username=current_user.username,
        ip_address=request.client.host if request.client else None,
    )

    logger.info("Server deleted: %s", hostname)


@router.post("/upload-csv", response_model=CSVUploadResponse)
async def upload_csv(
    file: UploadFile,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a CSV file to bulk import servers."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV file",
        )

    content = await file.read()
    csv_text = content.decode("utf-8")

    records, errors = parse_csv_content(csv_text)

    imported = 0
    skipped = 0

    for record in records:
        existing = db.query(Server).filter(Server.hostname == record["hostname"]).first()
        if existing:
            skipped += 1
            errors.append(f"Server '{record['hostname']}' already exists, skipped")
            continue

        server = Server(**record)
        db.add(server)
        imported += 1

    if imported > 0:
        db.commit()

    create_audit_log(
        db=db,
        action="csv_upload",
        resource_type="server",
        details=f"CSV upload: {imported} imported, {skipped} skipped, {len(errors)} errors",
        user_id=current_user.id,
        username=current_user.username,
        ip_address=request.client.host if request.client else None,
    )

    logger.info("CSV upload completed: %d imported, %d skipped", imported, skipped)
    return CSVUploadResponse(
        total_rows=len(records) + skipped,
        imported=imported,
        skipped=skipped,
        errors=errors,
    )
