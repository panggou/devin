import { useEffect, useState } from 'react';
import { serverApi, type Server, type ServerCreate } from '../api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function Servers() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [error, setError] = useState('');

  const loadServers = () => {
    setLoading(true);
    serverApi
      .list()
      .then((res) => setServers(res.data))
      .catch(() => setError('Failed to load servers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadServers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this server?')) return;
    try {
      await serverApi.delete(id);
      loadServers();
    } catch {
      setError('Failed to delete server');
    }
  };

  const handleEdit = (server: Server) => {
    setEditingServer(server);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingServer(null);
  };

  const handleFormSubmit = () => {
    handleFormClose();
    loadServers();
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading servers...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Server Inventory</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Server
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <ServerForm
          server={editingServer}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Hostname</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">IP Address</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">OS</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Environment</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {servers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No servers found. Add one to get started.
                  </td>
                </tr>
              ) : (
                servers.map((server) => (
                  <tr key={server.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{server.hostname}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{server.ip_address}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{server.operating_system || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{server.environment || '-'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={server.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(server)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(server.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.active}`}>
      {status}
    </span>
  );
}

function ServerForm({
  server,
  onClose,
  onSubmit,
}: {
  server: Server | null;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [form, setForm] = useState<ServerCreate>({
    hostname: server?.hostname || '',
    ip_address: server?.ip_address || '',
    operating_system: server?.operating_system || '',
    cpu_cores: server?.cpu_cores || undefined,
    ram_gb: server?.ram_gb || undefined,
    environment: server?.environment || '',
    status: server?.status || 'active',
    location: server?.location || '',
    owner: server?.owner || '',
    notes: server?.notes || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (server) {
        await serverApi.update(server.id, form);
      } else {
        await serverApi.create(form);
      }
      onSubmit();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Failed to save server');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {server ? 'Edit Server' : 'Add Server'}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Hostname" value={form.hostname} onChange={(v) => setForm({ ...form, hostname: v })} required />
        <Input label="IP Address" value={form.ip_address} onChange={(v) => setForm({ ...form, ip_address: v })} required />
        <Input label="Operating System" value={form.operating_system || ''} onChange={(v) => setForm({ ...form, operating_system: v })} />
        <Input label="CPU Cores" type="number" value={form.cpu_cores?.toString() || ''} onChange={(v) => setForm({ ...form, cpu_cores: v ? parseInt(v) : undefined })} />
        <Input label="RAM (GB)" type="number" value={form.ram_gb?.toString() || ''} onChange={(v) => setForm({ ...form, ram_gb: v ? parseInt(v) : undefined })} />
        <Input label="Environment" value={form.environment || ''} onChange={(v) => setForm({ ...form, environment: v })} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <Input label="Location" value={form.location || ''} onChange={(v) => setForm({ ...form, location: v })} />
        <Input label="Owner" value={form.owner || ''} onChange={(v) => setForm({ ...form, owner: v })} />
        <Input label="Notes" value={form.notes || ''} onChange={(v) => setForm({ ...form, notes: v })} />
        <div className="md:col-span-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving...' : server ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      />
    </div>
  );
}
