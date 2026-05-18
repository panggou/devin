import logging

from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.models.models import User
from app.schemas.schemas import KubernetesCluster

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/kubernetes", tags=["Kubernetes"])

MOCK_CLUSTERS = [
    KubernetesCluster(
        name="prod-us-east-1",
        status="healthy",
        nodes=12,
        pods_running=156,
        pods_pending=3,
        pods_failed=1,
        cpu_usage_percent=67.5,
        memory_usage_percent=72.3,
        kubernetes_version="1.29.2",
        region="us-east-1",
    ),
    KubernetesCluster(
        name="prod-eu-west-1",
        status="healthy",
        nodes=8,
        pods_running=98,
        pods_pending=0,
        pods_failed=0,
        cpu_usage_percent=45.2,
        memory_usage_percent=58.1,
        kubernetes_version="1.29.2",
        region="eu-west-1",
    ),
    KubernetesCluster(
        name="staging-us-west-2",
        status="warning",
        nodes=4,
        pods_running=42,
        pods_pending=5,
        pods_failed=2,
        cpu_usage_percent=82.1,
        memory_usage_percent=89.7,
        kubernetes_version="1.28.5",
        region="us-west-2",
    ),
    KubernetesCluster(
        name="dev-us-east-1",
        status="healthy",
        nodes=3,
        pods_running=28,
        pods_pending=1,
        pods_failed=0,
        cpu_usage_percent=32.4,
        memory_usage_percent=41.6,
        kubernetes_version="1.30.0",
        region="us-east-1",
    ),
]


@router.get("/clusters", response_model=list[KubernetesCluster])
def list_clusters(current_user: User = Depends(get_current_user)):
    """List all Kubernetes clusters with their status."""
    return MOCK_CLUSTERS


@router.get("/clusters/{cluster_name}", response_model=KubernetesCluster)
def get_cluster(cluster_name: str, current_user: User = Depends(get_current_user)):
    """Get details of a specific Kubernetes cluster."""
    for cluster in MOCK_CLUSTERS:
        if cluster.name == cluster_name:
            return cluster
    from fastapi import HTTPException, status

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cluster not found")
