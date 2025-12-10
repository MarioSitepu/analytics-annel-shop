'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Upload, ArrowLeft, CheckCircle, AlertCircle, Trash2, History } from 'lucide-react';
import { Store, SalesUploadHistory } from '@/types';

export default function UploadSalesTypePage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; errors?: string[] } | null>(null);
  const [uploadHistory, setUploadHistory] = useState<SalesUploadHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchStores();
    fetchUploadHistory();
  }, [type, selectedStoreId]);

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores');
      const result = await response.json();
      if (result.success) {
        const filteredStores = result.data.filter((store: Store) => store.type === type);
        setStores(filteredStores);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const fetchUploadHistory = async () => {
    if (!selectedStoreId) {
      setUploadHistory([]);
      return;
    }
    
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/sales/upload/history?storeId=${selectedStoreId}`);
      const result = await response.json();
      if (result.success) {
        setUploadHistory(result.data);
      }
    } catch (error) {
      console.error('Error fetching upload history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus history upload ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/sales/upload/history?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        fetchUploadHistory();
      } else {
        alert('Gagal menghapus history');
      }
    } catch (error) {
      console.error('Error deleting history:', error);
      alert('Terjadi kesalahan saat menghapus history');
    }
  };

  const formatDateTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedStoreId) {
      alert('Pilih toko dan file CSV terlebih dahulu');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('storeId', selectedStoreId);

      const response = await fetch('/api/sales/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setUploadResult({
          success: true,
          message: `Berhasil mengupload ${result.data.imported} data penjualan`,
          errors: result.data.errors,
        });
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        // Refresh history
        fetchUploadHistory();
      } else {
        setUploadResult({
          success: false,
          message: result.error || 'Gagal mengupload file',
        });
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Terjadi kesalahan saat mengupload file',
      });
    } finally {
      setUploading(false);
    }
  };

  const typeLabel = type === 'offline' ? 'Offline' : 'Online';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/upload-sales')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Penjualan Toko {typeLabel}</h1>
          <p className="mt-2 text-gray-600">Pilih toko dan upload file Excel atau CSV penjualan</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Toko *
            </label>
            {stores.length === 0 ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-800">
                  Belum ada toko {typeLabel.toLowerCase()}.{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/add-store')}
                    className="font-medium underline hover:text-yellow-900"
                  >
                    Tambah toko sekarang
                  </button>
                </p>
              </div>
            ) : (
              <select
                required
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
              >
                <option value="">Pilih Toko</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File CSV *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-input"
                    className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
                  >
                    <span>Pilih file</span>
                    <input
                      id="file-input"
                      name="file-input"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">atau drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV atau Excel (.xlsx) hingga 10MB</p>
                {file && (
                  <p className="text-sm text-gray-900 mt-2">{file.name}</p>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Format file harus memiliki worksheet "orders" dengan kolom:
              <br />
              <span className="font-mono text-xs">
                No. Pesanan, Waktu Pembayaran Dilakukan, Nama Variasi, Harga Setelah Diskon, Jumlah
              </span>
            </p>
          </div>

          {uploadResult && (
            <div
              className={`rounded-lg p-4 ${
                uploadResult.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start">
                {uploadResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      uploadResult.success ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {uploadResult.message}
                  </p>
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-yellow-800 mb-1">Peringatan:</p>
                      <ul className="list-disc list-inside text-xs text-yellow-700 space-y-1">
                        {uploadResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {uploadResult.errors.length > 5 && (
                          <li>... dan {uploadResult.errors.length - 5} peringatan lainnya</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/upload-sales')}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={!file || !selectedStoreId || uploading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Mengupload...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>

      {/* Upload History */}
      {selectedStoreId && (
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <History className="h-5 w-5" />
              History Upload CSV
            </h2>
          </div>

          {loadingHistory ? (
            <div className="text-center py-8 text-gray-500">Memuat history...</div>
          ) : uploadHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada history upload untuk toko ini
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu Upload
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama File
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipe File
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Baris
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Berhasil
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dilewati
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Error
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uploadHistory.map((history) => (
                    <tr key={history.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(history.timestamp)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {history.fileName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {history.fileType}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {history.totalRows}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                        {history.imported}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-yellow-600 font-medium">
                        {history.skipped}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-medium">
                        {history.errors?.length || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteHistory(history.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Hapus History"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

