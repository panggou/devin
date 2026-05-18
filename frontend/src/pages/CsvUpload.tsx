import { useState, useRef } from 'react';
import { serverApi, type CSVUploadResponse } from '../api';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function CsvUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<CSVUploadResponse | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);
    try {
      const res = await serverApi.uploadCsv(file);
      setResult(res.data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setError('Failed to upload CSV file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">CSV Upload</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl">
        <div className="text-center mb-6">
          <Upload size={48} className="mx-auto text-blue-500 mb-3" />
          <h3 className="text-lg font-semibold text-gray-800">Upload Server Inventory</h3>
          <p className="text-sm text-gray-500 mt-1">Upload a CSV file to bulk import servers</p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            {file ? (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <FileText size={20} />
                <span>{file.name}</span>
              </div>
            ) : (
              <div>
                <p className="text-gray-600">Click to select a CSV file</p>
                <p className="text-xs text-gray-400 mt-1">Required columns: hostname, ip_address</p>
              </div>
            )}
          </label>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload & Import'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
              <CheckCircle size={18} />
              <span className="font-medium">Upload Complete</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-800">{result.total_rows}</p>
                <p className="text-xs text-gray-500">Total Rows</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600">{result.imported}</p>
                <p className="text-xs text-gray-500">Imported</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-yellow-600">{result.skipped}</p>
                <p className="text-xs text-gray-500">Skipped</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-800 mb-2">Warnings:</p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">CSV Format Example:</h4>
          <pre className="text-xs text-gray-600 overflow-x-auto">
{`hostname,ip_address,operating_system,cpu_cores,ram_gb,environment,status
web-server-01,10.0.1.10,Ubuntu 22.04,4,16,production,active
db-server-01,10.0.2.10,CentOS 8,8,64,production,active`}
          </pre>
        </div>
      </div>
    </div>
  );
}
