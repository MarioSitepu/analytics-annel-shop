'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function AddStoreTypePage() {
  const params = useParams();
  const router = useRouter();
  const type = params.type as string;
  const [formData, setFormData] = useState({
    name: '',
    address: '',
  });
  
  const isOffline = type === 'offline';
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setResult({
        success: false,
        message: 'Nama toko tidak boleh kosong',
      });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          type: type,
          address: isOffline ? formData.address.trim() : '',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setResult({
          success: true,
          message: 'Toko berhasil ditambahkan',
        });
        setFormData({ name: '', address: '' });
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/add-store');
        }, 2000);
      } else {
        setResult({
          success: false,
          message: result.error || 'Gagal menambahkan toko',
        });
      }
    } catch (error) {
      console.error('Error adding store:', error);
      setResult({
        success: false,
        message: `Terjadi kesalahan saat menambahkan toko: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabel = type === 'offline' ? 'Offline' : 'Online';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/add-store')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Toko {typeLabel}</h1>
          <p className="mt-2 text-gray-600">Isi informasi toko baru</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Toko *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
              placeholder="Contoh: Toko Cabang Jakarta Pusat"
            />
          </div>

          {isOffline && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                placeholder="Alamat lengkap toko"
              />
            </div>
          )}

          {result && (
            <div
              className={`rounded-lg p-4 ${
                result.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                )}
                <p
                  className={`text-sm font-medium ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {result.message}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/add-store')}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

