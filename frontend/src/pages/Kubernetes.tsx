import { useEffect, useState } from 'react';
import { kubernetesApi, type KubernetesCluster } from '../api';
import { Container, Cpu, HardDrive, Globe } from 'lucide-react';

export default function Kubernetes() {
  const [clusters, setClusters] = useState<KubernetesCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    kubernetesApi
      .clusters()
      .then((res) => setClusters(res.data))
      .catch(() => setError('Failed to load clusters'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading clusters...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Kubernetes Clusters</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clusters.map((cluster) => (
          <div key={cluster.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Container size={24} className="text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{cluster.name}</h3>
                  <p className="text-sm text-gray-500">v{cluster.kubernetes_version}</p>
                </div>
              </div>
              <ClusterStatusBadge status={cluster.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">{cluster.region}</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">{cluster.nodes} nodes</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Cpu size={14} /> CPU Usage
                  </span>
                  <span className="font-medium">{cluster.cpu_usage_percent}%</span>
                </div>
                <ProgressBar value={cluster.cpu_usage_percent} />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Memory Usage</span>
                  <span className="font-medium">{cluster.memory_usage_percent}%</span>
                </div>
                <ProgressBar value={cluster.memory_usage_percent} />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold text-green-600">{cluster.pods_running}</p>
                <p className="text-xs text-gray-500">Running</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-yellow-600">{cluster.pods_pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-red-600">{cluster.pods_failed}</p>
                <p className="text-xs text-gray-500">Failed</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClusterStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    healthy: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${styles[status] || styles.healthy}`}>
      {status}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color = value > 80 ? 'bg-red-500' : value > 60 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}
