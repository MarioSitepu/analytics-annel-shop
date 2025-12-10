'use client';

import { useState, useEffect } from 'react';
import { Plus, DollarSign, History, AlertCircle, CheckCircle, X, TrendingUp, BarChart3 } from 'lucide-react';
import { Product, PriceHistory, ProductAddition, UndetectedProduct } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface EnrichedAddition extends ProductAddition {
  productName: string;
  storeName: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', sku: '', initialPrice: '' });
  const [priceData, setPriceData] = useState({ price: '', timestamp: '', updateMode: 'date' as 'date' | 'purchase' });
  const [additions, setAdditions] = useState<EnrichedAddition[]>([]);
  const [undetected, setUndetected] = useState<UndetectedProduct[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showAddFromUndetectedModal, setShowAddFromUndetectedModal] = useState(false);
  const [selectedUndetected, setSelectedUndetected] = useState<UndetectedProduct | null>(null);
  const [priceUpdateMode, setPriceUpdateMode] = useState<'date' | 'purchase'>('date');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [updatingPrice, setUpdatingPrice] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchHistory();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, initialPrice: formData.initialPrice }),
      });
      const result = await response.json();
      if (result.success) {
        setShowAddModal(false);
        setFormData({ name: '', sku: '', initialPrice: '' });
        fetchProducts();
        fetchHistory();
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    // Validasi harga
    const price = parseFloat(priceData.price);
    if (isNaN(price) || price <= 0) {
      setNotification({ type: 'error', message: 'Harga harus lebih dari 0' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Validasi timestamp jika mode adalah 'date'
    if (priceData.updateMode === 'date' && !priceData.timestamp) {
      setNotification({ type: 'error', message: 'Waktu berlaku harus diisi' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setUpdatingPrice(true);
    try {
      const response = await fetch(`/api/products/${selectedProduct.id}/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: price,
          timestamp: priceData.updateMode === 'date' ? priceData.timestamp : undefined,
          updateMode: priceData.updateMode,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setNotification({ type: 'success', message: 'Harga berhasil diubah' });
        setTimeout(() => {
          setNotification(null);
          setShowPriceModal(false);
          setSelectedProduct(null);
          setPriceData({ price: '', timestamp: '', updateMode: 'date' });
          fetchProducts();
        }, 1500);
      } else {
        setNotification({ type: 'error', message: result.error || 'Gagal mengubah harga' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error updating price:', error);
      setNotification({ type: 'error', message: 'Terjadi kesalahan saat mengubah harga' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setUpdatingPrice(false);
    }
  };

  const openPriceModal = (product: Product) => {
    setSelectedProduct(product);
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16).replace('T', ' ');
    setPriceData({ 
      price: '', 
      timestamp,
      updateMode: product.priceUpdateMode || 'date'
    });
    setShowPriceModal(true);
  };

  const handleAddFromUndetected = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUndetected) return;
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: selectedUndetected.productName, 
          initialPrice: '0' // Harga 0 sebagai set awal
        }),
      });
      const result = await response.json();
      if (result.success) {
        setShowAddFromUndetectedModal(false);
        setSelectedUndetected(null);
        fetchProducts();
        fetchHistory();
      }
    } catch (error) {
      console.error('Error adding product from undetected:', error);
    }
  };

  const openAddFromUndetectedModal = (item: UndetectedProduct) => {
    setSelectedUndetected(item);
    setShowAddFromUndetectedModal(true);
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/products/history');
      const result = await response.json();
      if (result.success) {
        setAdditions(result.data.additions);
        setUndetected(result.data.undetected);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getCurrentCostPrice = (product: Product): number => {
    return product.costPrice || 0;
  };

  const formatDateTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchProductAnalytics = async (productId: string) => {
    setLoadingAnalytics(true);
    try {
      const response = await fetch(`/api/products/${productId}/analytics`);
      const result = await response.json();
      if (result.success) {
        setAnalyticsData(result.data);
        setShowAnalyticsModal(true);
      } else {
        alert(result.error || 'Gagal memuat analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      alert('Terjadi kesalahan saat memuat analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const openAnalyticsModal = (product: Product) => {
    setSelectedProduct(product);
    fetchProductAnalytics(product.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Kelola Produk</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Tambah Produk
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Memuat data...</div>
        </div>
      ) : (
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga Modal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Riwayat Harga Modal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mode Update
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Belum ada produk. Tambahkan produk pertama Anda.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rp {getCurrentCostPrice(product).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.costHistory?.length || 0} perubahan
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.priceUpdateMode === 'purchase' 
                          ? 'bg-blue-100 text-blue-800' 
                          : product.priceUpdateMode === 'date'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {product.priceUpdateMode === 'purchase' 
                          ? 'Setiap Pembelian' 
                          : product.priceUpdateMode === 'date'
                          ? 'Pada Tanggal'
                          : 'Belum Diatur'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openAnalyticsModal(product)}
                          className="text-green-600 hover:text-green-900"
                          title="Lihat Analytics"
                        >
                          <BarChart3 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openPriceModal(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ubah Harga"
                        >
                          <DollarSign className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tambah Produk</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Modal *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.initialPrice}
                  onChange={(e) => setFormData({ ...formData, initialPrice: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
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
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Price Modal */}
      {showPriceModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Ubah Harga Modal - {selectedProduct.name}
            </h2>
            <form onSubmit={handleUpdatePrice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga Modal Baru *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={priceData.price}
                  onChange={(e) => setPriceData({ ...priceData, price: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="0"
                />
              </div>
              {priceData.updateMode === 'date' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu Berlaku *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={priceData.timestamp.replace(' ', 'T')}
                    onChange={(e) => setPriceData({ ...priceData, timestamp: e.target.value.replace('T', ' ') })}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Harga modal akan berlaku mulai waktu ini dan seterusnya
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode Perubahan Harga Modal *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="updateMode"
                      value="date"
                      checked={priceData.updateMode === 'date'}
                      onChange={(e) => setPriceData({ ...priceData, updateMode: e.target.value as 'date' | 'purchase' })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Diubah pada tanggal tertentu</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="updateMode"
                      value="purchase"
                      checked={priceData.updateMode === 'purchase'}
                      onChange={(e) => setPriceData({ ...priceData, updateMode: e.target.value as 'date' | 'purchase' })}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Diubah setiap penambahan stok</span>
                  </label>
                  {priceData.updateMode === 'purchase' && (
                    <p className="mt-1 text-xs text-gray-500 ml-6">
                      Harga modal akan diupdate otomatis setiap kali ada penambahan stok baru (saat menambah stok, masukkan harga modal baru)
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPriceModal(false);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updatingPrice}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingPrice ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Section */}
      <div className="space-y-6">
        {/* History Penambahan Barang */}
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <History className="h-5 w-5" />
              History Penambahan Barang
            </h2>
          </div>
          {loadingHistory ? (
            <div className="px-6 py-12 text-center text-gray-500">Memuat data...</div>
          ) : additions.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Belum ada history penambahan barang
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {additions.slice(0, 10).map((addition) => (
                    <tr key={addition.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(addition.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {addition.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{addition.location}</span>
                          {addition.location === 'toko' && addition.storeName && (
                            <span className="text-gray-400">({addition.storeName})</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {addition.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* History Barang Tidak Terdeteksi dari CSV */}
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              History Barang Tidak Terdeteksi dari CSV
            </h2>
          </div>
          {loadingHistory ? (
            <div className="px-6 py-12 text-center text-gray-500">Memuat data...</div>
          ) : undetected.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Belum ada barang yang tidak terdeteksi dari CSV
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Toko
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Baris CSV
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {undetected.slice(0, 10).map((item) => {
                    // Check if product already exists
                    const productExists = products.some(p => 
                      p.name.toLowerCase() === item.productName.toLowerCase()
                    );
                    
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(item.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.productName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.storeName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Baris {item.rowNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {productExists ? (
                            <span className="text-green-600 text-xs">Sudah ada</span>
                          ) : (
                            <button
                              onClick={() => openAddFromUndetectedModal(item)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Tambah Produk
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Product from Undetected Modal */}
      {showAddFromUndetectedModal && selectedUndetected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tambah Produk</h2>
            <p className="text-sm text-gray-600 mb-4">
              Produk <strong>{selectedUndetected.productName}</strong> akan ditambahkan dengan harga modal 0 sebagai set awal.
            </p>
            <form onSubmit={handleAddFromUndetected} className="space-y-4">
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddFromUndetectedModal(false);
                    setSelectedUndetected(null);
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Tambah Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl shadow-xl border border-gray-200 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Analytics Produk - {selectedProduct.name}
              </h2>
              <button
                onClick={() => {
                  setShowAnalyticsModal(false);
                  setAnalyticsData(null);
                  setSelectedProduct(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {loadingAnalytics ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Memuat data analytics...</div>
              </div>
            ) : analyticsData ? (
              analyticsData.hasStock ? (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                      <p className="text-sm font-medium text-gray-600">Total Stok</p>
                      <p className="mt-2 text-2xl font-bold text-gray-900">{analyticsData.totalStock}</p>
                    </div>
                    <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                      <p className="text-sm font-medium text-gray-600">Total Penjualan</p>
                      <p className="mt-2 text-2xl font-bold text-gray-900">
                        Rp {analyticsData.totalSales.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                      <p className="text-sm font-medium text-gray-600">Total Keuntungan</p>
                      <p className="mt-2 text-2xl font-bold text-green-600">
                        Rp {analyticsData.totalProfit.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
                      <p className="text-sm font-medium text-gray-600">Jumlah Terjual</p>
                      <p className="mt-2 text-2xl font-bold text-gray-900">{analyticsData.totalQuantitySold}</p>
                    </div>
                  </div>

                  {/* Stock Info */}
                  <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Stok</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lokasi</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toko</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analyticsData.stockInfo.map((stock: any, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900 capitalize">{stock.location}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{stock.storeName || '-'}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-blue-600">{stock.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Charts */}
                  {analyticsData.salesByDate.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Sales by Date */}
                      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Penjualan per Tanggal</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={analyticsData.salesByDate}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#0088FE" name="Pendapatan" />
                            <Line type="monotone" dataKey="profit" stroke="#00C49F" name="Keuntungan" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Sales by Store */}
                      {analyticsData.salesByStore.length > 0 && (
                        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Penjualan per Toko</h3>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analyticsData.salesByStore}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="storeName" />
                              <YAxis />
                              <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                              <Legend />
                              <Bar dataKey="revenue" fill="#0088FE" name="Pendapatan" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  )}

                  {analyticsData.salesByDate.length === 0 && (
                    <div className="rounded-lg bg-gray-50 p-12 text-center border border-gray-200">
                      <p className="text-gray-500">Belum ada data penjualan untuk produk ini</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg bg-yellow-50 p-8 text-center border border-yellow-200">
                  <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium">{analyticsData.message || 'Produk belum memiliki stok'}</p>
                  <p className="text-sm text-gray-500 mt-2">Tambahkan stok terlebih dahulu untuk melihat analytics</p>
                </div>
              )
            ) : (
              <div className="rounded-lg bg-gray-50 p-12 text-center border border-gray-200">
                <p className="text-gray-500">Tidak ada data</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

