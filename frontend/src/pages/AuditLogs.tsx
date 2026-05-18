import { useEffect, useState } from 'react';
import { auditApi, type AuditLog } from '../api';
import { FileText } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    auditApi
      .logs({ limit: 100 })
      .then((res) => setLogs(res.data))
      .catch(() => setError('Failed to load audit logs'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading audit logs...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileText size={24} className="text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Audit Logs</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Resource</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.username || '-'}</td>
                    <td className="px-6 py-4">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.resource_type}
                      {log.resource_id ? ` #${log.resource_id}` : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{log.details || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
    login: 'bg-purple-100 text-purple-800',
    register: 'bg-indigo-100 text-indigo-800',
    csv_upload: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[action] || 'bg-gray-100 text-gray-800'}`}>
      {action}
    </span>
  );
}
