'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Plus, Package } from 'lucide-react';
import { Product, Store, ProductLocation } from '@/types';

export default function ProductTransferPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [locations, setLocations] = useState<ProductLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'transfer' | 'add'>('transfer');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [transferData, setTransferData] = useState({
    productId: '',
    fromLocation: 'gudang' as 'gudang' | 'toko',
    toLocation: 'toko' as 'gudang' | 'toko',
    fromStoreId: '',
    toStoreId: '',
    quantity: '',
  });
  const [addData, setAddData] = useState({
    productId: '',
    location: 'gudang' as 'gudang' | 'toko',
    storeId: '',
    quantity: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, storesRes, locationsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/stores'),
        fetch('/api/products/location'),
      ]);
      const productsResult = await productsRes.json();
      const storesResult = await storesRes.json();
      const locationsResult = await locationsRes.json();
      if (productsResult.success) setProducts(productsResult.data);
      if (storesResult.success) setStores(storesResult.data);
      if (locationsResult.success) setLocations(locationsResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductLocation = (productId: string, location: 'gudang' | 'toko', storeId?: string): number => {
    const loc = locations.find(
      l => l.productId === productId && l.location === location && l.storeId === storeId
    );
    return loc?.quantity || 0;
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/products/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transferData,
          quantity: parseFloat(transferData.quantity),
        }),
      });
      const result = await response.json();
      if (result.success) {
        setShowTransferModal(false);
        setTransferData({
          productId: '',
          fromLocation: 'gudang',
          toLocation: 'toko',
          fromStoreId: '',
          toStoreId: '',
          quantity: '',
        });
        fetchData();
      } else {
        alert(result.error || 'Gagal melakukan transfer');
      }
    } catch (error) {
      console.error('Error transferring product:', error);
      alert('Terjadi kesalahan saat melakukan transfer');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/products/addition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addData,
          quantity: parseFloat(addData.quantity),
        }),
      });
      const result = await response.json();
      if (result.success) {
        setShowAddModal(false);
        setAddData({
          productId: '',
          location: 'gudang',
          storeId: '',
          quantity: '',
        });
        fetchData();
      } else {
        alert(result.error || 'Gagal menambahkan produk');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Terjadi kesalahan saat menambahkan produk');
    }
  };

  const offlineStores = stores.filter(s => s.type === 'offline');
  const onlineStores = stores.filter(s => s.type === 'online');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Transfer & Tambah Produk</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('transfer')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transfer'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Transfer Produk
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'add'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tambah Stok
          </button>
        </nav>
      </div>

      {activeTab === 'transfer' ? (
        <div className="space-y-4">
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <ArrowRight className="h-5 w-5" />
            Transfer Produk
          </button>

          {/* Product Locations Table */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Lokasi Produk</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gudang
                    </th>
                    {offlineStores.map(store => (
                      <th key={store.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {store.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={2 + offlineStores.length} className="px-6 py-12 text-center text-gray-500">
                        Belum ada produk
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getProductLocation(product.id, 'gudang')}
                        </td>
                        {offlineStores.map(store => (
                          <td key={store.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getProductLocation(product.id, 'toko', store.id)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Plus className="h-5 w-5" />
            Tambah Stok Produk
          </button>

          {/* Product Locations Table (same as transfer) */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Lokasi Produk</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gudang
                    </th>
                    {offlineStores.map(store => (
                      <th key={store.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {store.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={2 + offlineStores.length} className="px-6 py-12 text-center text-gray-500">
                        Belum ada produk
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getProductLocation(product.id, 'gudang')}
                        </td>
                        {offlineStores.map(store => (
                          <td key={store.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getProductLocation(product.id, 'toko', store.id)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Transfer Produk</h2>
            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produk *
                </label>
                <select
                  required
                  value={transferData.productId}
                  onChange={(e) => setTransferData({ ...transferData, productId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Pilih Produk</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dari Lokasi *
                </label>
                <select
                  required
                  value={transferData.fromLocation}
                  onChange={(e) => {
                    const newFrom = e.target.value as 'gudang' | 'toko';
                    setTransferData({
                      ...transferData,
                      fromLocation: newFrom,
                      fromStoreId: newFrom === 'gudang' ? '' : transferData.fromStoreId,
                    });
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="gudang">Gudang</option>
                  <option value="toko">Toko</option>
                </select>
              </div>
              {transferData.fromLocation === 'toko' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dari Toko *
                  </label>
                  <select
                    required
                    value={transferData.fromStoreId}
                    onChange={(e) => setTransferData({ ...transferData, fromStoreId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Pilih Toko</option>
                    {offlineStores.map(store => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ke Lokasi *
                </label>
                <select
                  required
                  value={transferData.toLocation}
                  onChange={(e) => {
                    const newTo = e.target.value as 'gudang' | 'toko';
                    setTransferData({
                      ...transferData,
                      toLocation: newTo,
                      toStoreId: newTo === 'gudang' ? '' : transferData.toStoreId,
                    });
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="gudang">Gudang</option>
                  <option value="toko">Toko</option>
                </select>
              </div>
              {transferData.toLocation === 'toko' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ke Toko *
                  </label>
                  <select
                    required
                    value={transferData.toStoreId}
                    onChange={(e) => setTransferData({ ...transferData, toStoreId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Pilih Toko</option>
                    {offlineStores.map(store => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={transferData.quantity}
                  onChange={(e) => setTransferData({ ...transferData, quantity: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tambah Stok Produk</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produk *
                </label>
                <select
                  required
                  value={addData.productId}
                  onChange={(e) => setAddData({ ...addData, productId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Pilih Produk</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi *
                </label>
                <select
                  required
                  value={addData.location}
                  onChange={(e) => {
                    const newLoc = e.target.value as 'gudang' | 'toko';
                    setAddData({
                      ...addData,
                      location: newLoc,
                      storeId: newLoc === 'gudang' ? '' : addData.storeId,
                    });
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="gudang">Gudang</option>
                  <option value="toko">Toko</option>
                </select>
              </div>
              {addData.location === 'toko' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Toko *
                  </label>
                  <select
                    required
                    value={addData.storeId}
                    onChange={(e) => setAddData({ ...addData, storeId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Pilih Toko</option>
                    {offlineStores.map(store => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={addData.quantity}
                  onChange={(e) => setAddData({ ...addData, quantity: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

