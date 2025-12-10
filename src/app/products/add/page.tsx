'use client';

import { useRouter } from 'next/navigation';
import { Warehouse, Store as StoreIcon, ArrowRight } from 'lucide-react';

export default function AddProductPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tambah Produk</h1>
        <p className="mt-2 text-gray-600">Pilih lokasi untuk mengelola produk</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <button
          onClick={() => router.push('/products/add/gudang')}
          className="group relative rounded-lg border-2 border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
        >
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-blue-100 p-4 mb-4 group-hover:bg-blue-200 transition-colors">
              <Warehouse className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Gudang</h2>
            <p className="text-sm text-gray-600">
              Kelola produk di gudang, tambah stok, dan transfer ke toko
            </p>
            <div className="mt-4 flex items-center text-blue-600 group-hover:text-blue-700">
              <span className="text-sm font-medium">Masuk ke Gudang</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push('/products/add/toko')}
          className="group relative rounded-lg border-2 border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-green-500 hover:shadow-md"
        >
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-green-100 p-4 mb-4 group-hover:bg-green-200 transition-colors">
              <StoreIcon className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Toko</h2>
            <p className="text-sm text-gray-600">
              Kelola produk di toko, tambah stok, dan transfer ke gudang
            </p>
            <div className="mt-4 flex items-center text-green-600 group-hover:text-green-700">
              <span className="text-sm font-medium">Masuk ke Toko</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

