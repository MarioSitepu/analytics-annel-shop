'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Upload } from 'lucide-react';

export default function UploadSalesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Penjualan</h1>
        <p className="mt-2 text-gray-600">Pilih jenis toko untuk mengupload data penjualan</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <button
          onClick={() => router.push('/upload-sales/offline')}
          className="group relative rounded-lg border-2 border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
        >
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-blue-100 p-4 mb-4 group-hover:bg-blue-200 transition-colors">
              <Store className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Toko Offline</h2>
            <p className="text-sm text-gray-600">
              Upload data penjualan dari toko fisik
            </p>
          </div>
        </button>

        <button
          onClick={() => router.push('/upload-sales/online')}
          className="group relative rounded-lg border-2 border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-green-500 hover:shadow-md"
        >
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-green-100 p-4 mb-4 group-hover:bg-green-200 transition-colors">
              <Upload className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Toko Online</h2>
            <p className="text-sm text-gray-600">
              Upload data penjualan dari toko online
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

