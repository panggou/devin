from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class ServerCreate(BaseModel):
    hostname: str
    ip_address: str
    operating_system: str | None = None
    cpu_cores: int | None = None
    ram_gb: int | None = None
    environment: str | None = None
    status: str = "active"
    location: str | None = None
    owner: str | None = None
    notes: str | None = None


class ServerUpdate(BaseModel):
    hostname: str | None = None
    ip_address: str | None = None
    operating_system: str | None = None
    cpu_cores: int | None = None
    ram_gb: int | None = None
    environment: str | None = None
    status: str | None = None
    location: str | None = None
    owner: str | None = None
    notes: str | None = None


class ServerResponse(BaseModel):
    id: int
    hostname: str
    ip_address: str
    operating_system: str | None
    cpu_cores: int | None
    ram_gb: int | None
    environment: str | None
    status: str
    location: str | None
    owner: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AuditLogResponse(BaseModel):
    id: int
    user_id: int | None
    username: str | None
    action: str
    resource_type: str
    resource_id: str | None
    details: str | None
    ip_address: str | None
    timestamp: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_servers: int
    active_servers: int
    inactive_servers: int
    total_users: int
    environments: dict[str, int]
    recent_audit_logs: list[AuditLogResponse]


class KubernetesCluster(BaseModel):
    name: str
    status: str
    nodes: int
    pods_running: int
    pods_pending: int
    pods_failed: int
    cpu_usage_percent: float
    memory_usage_percent: float
    kubernetes_version: str
    region: str


class CSVUploadResponse(BaseModel):
    total_rows: int
    imported: int
    skipped: int
    errors: list[str]


class MessageResponse(BaseModel):
    message: str
