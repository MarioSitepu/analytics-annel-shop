'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, ArrowRight, Package, History, Minus } from 'lucide-react';
import { Product, Store, ProductLocation, ProductTransfer, ProductAddition } from '@/types';

export default function LocationProductPage() {
  const params = useParams();
  const router = useRouter();
  const location = params.location as string;
  const isGudang = location === 'gudang';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [locations, setLocations] = useState<ProductLocation[]>([]);
  const [transfers, setTransfers] = useState<ProductTransfer[]>([]);
  const [additions, setAdditions] = useState<ProductAddition[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingStock, setAddingStock] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReduceModal, setShowReduceModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [addData, setAddData] = useState({
    productId: '',
    quantity: '',
    storeId: '',
  });
  
  const [reduceData, setReduceData] = useState({
    productId: '',
    quantity: '',
    storeId: '',
  });
  
  const [transferData, setTransferData] = useState({
    productId: '',
    quantity: '',
    toStoreId: '',
    fromStoreId: '',
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds for real-time
    return () => clearInterval(interval);
  }, [location]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, storesRes, locationsRes, historyRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/stores'),
        fetch('/api/products/location'),
        fetch(`/api/history?date=${new Date().toISOString().split('T')[0]}`),
      ]);
      
      const productsResult = await productsRes.json();
      const storesResult = await storesRes.json();
      const locationsResult = await locationsRes.json();
      const historyResult = await historyRes.json();
      
      if (productsResult.success) setProducts(productsResult.data);
      if (storesResult.success) {
        const filteredStores = storesResult.data.filter((s: Store) => s.type === 'offline');
        setStores(filteredStores);
      }
      if (locationsResult.success) setLocations(locationsResult.data);
      if (historyResult.success) {
        setTransfers(historyResult.data.transfers || []);
        setAdditions(historyResult.data.additions || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductLocation = (productId: string): number => {
    // Untuk gudang dan toko offline, tidak ada storeId spesifik (storeId = null di database, undefined di frontend)
    const loc = locations.find(
      l => l.productId === productId && 
      l.location === (isGudang ? 'gudang' : 'toko') && 
      (l.storeId === null || l.storeId === undefined) // Handle both null and undefined
    );
    console.log('getProductLocation:', { productId, location: isGudang ? 'gudang' : 'toko', found: loc, allLocations: locations.filter(l => l.productId === productId) });
    return loc?.quantity || 0;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi quantity
    const quantityNum = parseFloat(addData.quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      alert('Jumlah stok harus lebih dari 0');
      return;
    }

    if (!addData.productId) {
      alert('Pilih produk terlebih dahulu');
      return;
    }
    
    setAddingStock(true);
    try {
      console.log('Adding stock:', {
        productId: addData.productId,
        location: isGudang ? 'gudang' : 'toko',
        quantity: quantityNum,
      });

      const response = await fetch('/api/products/addition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: addData.productId,
          location: isGudang ? 'gudang' : 'toko',
          storeId: undefined, // Tidak perlu storeId untuk gudang dan toko offline (semua share stok yang sama)
          quantity: quantityNum,
        }),
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        alert('✅ Stok berhasil ditambahkan!');
        setShowAddModal(false);
        setAddData({ productId: '', quantity: '', storeId: '' });
        // Force refresh locations immediately
        await fetchData();
        // Also manually refresh locations after a short delay to ensure database is updated
        setTimeout(async () => {
          await fetchData();
        }, 500);
      } else {
        console.error('Error response:', result);
        alert(`❌ Gagal menambahkan stok: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert(`❌ Terjadi kesalahan saat menambahkan produk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAddingStock(false);
    }
  };

  const handleReduceStock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reduceData.productId) {
      alert('Pilih produk terlebih dahulu');
      return;
    }
    
    const quantity = parseFloat(reduceData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Jumlah harus lebih dari 0');
      return;
    }
    
    if (!isGudang && !reduceData.storeId) {
      alert('Pilih toko terlebih dahulu');
      return;
    }
    
    try {
      const response = await fetch('/api/products/reduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: reduceData.productId,
          location: isGudang ? 'gudang' : 'toko',
          storeId: isGudang ? undefined : reduceData.storeId,
          quantity: quantity,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setShowReduceModal(false);
        setReduceData({ productId: '', quantity: '', storeId: '' });
        fetchData();
        alert('Stok berhasil dikurangi');
      } else {
        alert(result.error || 'Gagal mengurangi stok');
      }
    } catch (error) {
      console.error('Error reducing stock:', error);
      alert('Terjadi kesalahan saat mengurangi stok');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    try {
      const response = await fetch('/api/products/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: transferData.productId,
          fromLocation: isGudang ? 'gudang' : 'toko',
          toLocation: isGudang ? 'toko' : 'gudang',
          fromStoreId: undefined, // Tidak perlu storeId untuk gudang dan toko offline
          toStoreId: undefined, // Tidak perlu storeId untuk gudang dan toko offline
          quantity: parseFloat(transferData.quantity),
        }),
      });
      const result = await response.json();
      if (result.success) {
        setShowTransferModal(false);
        setSelectedProduct(null);
        setTransferData({ productId: '', quantity: '', toStoreId: '', fromStoreId: '' });
        fetchData();
      } else {
        alert(result.error || 'Gagal melakukan transfer');
      }
    } catch (error) {
      console.error('Error transferring product:', error);
      alert('Terjadi kesalahan saat melakukan transfer');
    }
  };

  const locationHistory = [
    ...transfers.filter(t => 
      (isGudang && (t.fromLocation === 'gudang' || t.toLocation === 'gudang')) ||
      (!isGudang && (t.fromLocation === 'toko' || t.toLocation === 'toko'))
    ),
    ...additions.filter(a => 
      a.location === (isGudang ? 'gudang' : 'toko')
    ),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const formatDateTime = (timestamp: string): string => {
    try {
      return new Date(timestamp).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  const getProductName = (productId: string): string => {
    const product = products.find(p => p.id === productId);
    return product?.name || productId;
  };

  const getStoreName = (storeId?: string): string => {
    if (!storeId) return '-';
    const store = stores.find(s => s.id === storeId);
    return store?.name || storeId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/products/add')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isGudang ? 'Gudang' : 'Toko'} - Manajemen Produk
          </h1>
          <p className="mt-2 text-gray-600">Kelola produk, tambah stok, dan transfer</p>
        </div>
      </div>


      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => {
            setAddData({ productId: '', quantity: '', storeId: '' });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
          Tambah Stok Produk
        </button>
        <button
          onClick={() => {
            setReduceData({ productId: '', quantity: '', storeId: '' });
            setShowReduceModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-medium text-white hover:bg-red-700"
        >
          <Minus className="h-5 w-5" />
          Kurangi Stok Produk
        </button>
        <button
          onClick={() => setShowTransferModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          <ArrowRight className="h-5 w-5" />
          Transfer Produk
        </button>
      </div>

      {/* Product Info Table - Real Time */}
      <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Info Produk Real-Time
            </h2>
            <span className="text-xs text-gray-500">Update otomatis setiap 5 detik</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok Saat Ini
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-gray-500">
                    Belum ada produk
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  // Untuk gudang dan toko offline, stok tidak per toko (storeId = null)
                  const totalStock = getProductLocation(product.id);
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="font-semibold text-blue-600">
                          {totalStock}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Section */}
      <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <History className="h-5 w-5" />
            Histori Penambahan & Pemindahan Produk
          </h2>
        </div>
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
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locationHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada history untuk hari ini
                  </td>
                </tr>
              ) : (
                locationHistory.map((item) => {
                  const isTransfer = 'fromLocation' in item;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(item.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getProductName(item.productId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {isTransfer ? (
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                            Transfer
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                            Tambah
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isTransfer ? (
                          <div className="flex items-center gap-2">
                            <span className="capitalize">{item.fromLocation}</span>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <span className="capitalize">{item.toLocation}</span>
                            {item.toLocation === 'toko' && (
                              <span className="text-gray-400">({getStoreName(item.toStoreId)})</span>
                            )}
                          </div>
                        ) : (
                          <span className="capitalize">{item.location}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
              setAddData({ productId: '', quantity: '', storeId: '' });
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-lg p-2">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Tambah Stok Produk</h2>
                    <p className="text-sm text-green-50 mt-0.5">
                      {isGudang ? 'Tambahkan stok ke gudang' : 'Tambahkan stok ke toko'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddData({ productId: '', quantity: '', storeId: '' });
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1.5 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAdd} className="p-6 space-y-5">
              {/* Product Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  Pilih Produk *
                </label>
                <select
                  required
                  value={addData.productId}
                  onChange={(e) => {
                    setAddData({ ...addData, productId: e.target.value });
                  }}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-200 transition-all shadow-sm hover:border-gray-300"
                >
                  <option value="">-- Pilih Produk --</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>

              {/* Quantity Input with Quick Buttons */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Jumlah Stok *
                </label>
                <div className="space-y-3">
                  <input
                    type="number"
                    required
                    min="1"
                    value={addData.quantity}
                    onChange={(e) => setAddData({ ...addData, quantity: e.target.value })}
                    placeholder="Masukkan jumlah stok"
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3.5 text-lg font-semibold text-gray-900 placeholder-gray-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-200 transition-all shadow-sm hover:border-gray-300"
                  />
                  {/* Quick Quantity Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {[10, 25, 50, 100, 250, 500].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setAddData({ ...addData, quantity: qty.toString() })}
                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-green-100 hover:text-green-700 hover:border-green-300 text-sm font-medium text-gray-700 border-2 border-transparent transition-all"
                      >
                        +{qty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddData({ productId: '', quantity: '', storeId: '' });
                  }}
                  className="flex-1 rounded-xl border-2 border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addingStock}
                  className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-5 py-3 text-sm font-semibold text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {addingStock ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menambahkan...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Tambah Stok
                    </>
                  )}
                </button>
              </div>
            </form>
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
                  onChange={(e) => {
                    const product = products.find(p => p.id === e.target.value);
                    setSelectedProduct(product || null);
                    setTransferData({ ...transferData, productId: e.target.value });
                  }}
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                >
                  <option value="">Pilih Produk</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              {/* Tidak perlu pilihan toko untuk transfer - gudang dan toko offline share stok yang sama */}
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
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTransferModal(false);
                    setSelectedProduct(null);
                  }}
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

      {/* Reduce Stock Modal */}
      {showReduceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Kurangi Stok Produk</h2>
            <form onSubmit={handleReduceStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produk *
                </label>
                <select
                  required
                  value={reduceData.productId}
                  onChange={(e) => setReduceData({ ...reduceData, productId: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                >
                  <option value="">Pilih Produk</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              {/* Tidak perlu pilihan toko untuk kurangi stok - gudang dan toko offline share stok yang sama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah yang Dikurangi *
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={reduceData.quantity}
                  onChange={(e) => setReduceData({ ...reduceData, quantity: e.target.value })}
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReduceModal(false);
                    setReduceData({ productId: '', quantity: '', storeId: '' });
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Kurangi Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

