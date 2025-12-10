'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, ArrowRight, Package, History } from 'lucide-react';
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [addData, setAddData] = useState({
    productId: '',
    quantity: '',
    date: '',
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

  const getProductLocation = (productId: string, storeId?: string): number => {
    const loc = locations.find(
      l => l.productId === productId && 
      l.location === (isGudang ? 'gudang' : 'toko') && 
      l.storeId === storeId
    );
    return loc?.quantity || 0;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi tanggal jika gudang
    if (isGudang && !addData.date) {
      alert('Tanggal penambahan stok harus diisi untuk gudang');
      return;
    }
    
    try {
      // Format tanggal dari dd/mm/yyyy atau yyyy-mm-dd ke yyyy-mm-dd
      let formattedDate = addData.date;
      if (isGudang && addData.date) {
        // Jika format dd/mm/yyyy, convert ke yyyy-mm-dd
        if (addData.date.includes('/')) {
          const [day, month, year] = addData.date.split('/');
          formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
      
      const response = await fetch('/api/products/addition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: addData.productId,
          location: isGudang ? 'gudang' : 'toko',
          storeId: isGudang ? undefined : addData.storeId,
          quantity: parseFloat(addData.quantity),
          date: isGudang && formattedDate ? formattedDate : undefined,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setShowAddModal(false);
        const today = new Date();
        const defaultDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
        setAddData({ productId: '', quantity: '', date: defaultDate, storeId: '' });
        fetchData();
      } else {
        alert(result.error || 'Gagal menambahkan produk');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Terjadi kesalahan saat menambahkan produk');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    // Validasi untuk transfer dari toko
    if (!isGudang && !transferData.fromStoreId) {
      alert('Pilih toko terlebih dahulu');
      return;
    }
    
    // Validasi untuk transfer ke toko
    if (isGudang && !transferData.toStoreId) {
      alert('Pilih toko tujuan terlebih dahulu');
      return;
    }
    
    try {
      const response = await fetch('/api/products/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: transferData.productId,
          fromLocation: isGudang ? 'gudang' : 'toko',
          toLocation: isGudang ? 'toko' : 'gudang',
          fromStoreId: isGudang ? undefined : transferData.fromStoreId,
          toStoreId: isGudang ? transferData.toStoreId : undefined,
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
            const today = new Date();
            const defaultDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
            setAddData({ productId: '', quantity: '', date: defaultDate, storeId: stores.length > 0 ? stores[0].id : '' });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700"
        >
          <Plus className="h-5 w-5" />
          Tambah Produk
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
                  // Untuk toko, hitung total stok dari semua toko
                  const totalStock = isGudang 
                    ? getProductLocation(product.id, undefined)
                    : stores.reduce((sum, store) => sum + getProductLocation(product.id, store.id), 0);
                  
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
                  onChange={(e) => {
                    setAddData({ ...addData, productId: e.target.value });
                  }}
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                >
                  <option value="">Pilih Produk</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              {isGudang && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Penambahan Stok * (dd/mm/yyyy)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="dd/mm/yyyy"
                    value={addData.date}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Hanya allow angka dan slash
                      value = value.replace(/[^\d/]/g, '');
                      
                      // Auto format: dd/mm/yyyy
                      if (value.length <= 2) {
                        // Only day
                        setAddData({ ...addData, date: value });
                      } else if (value.length <= 5) {
                        // Day and month
                        if (value.length === 3 && !value.includes('/')) {
                          value = value.slice(0, 2) + '/' + value.slice(2);
                        }
                        setAddData({ ...addData, date: value });
                      } else if (value.length <= 10) {
                        // Day, month, and year
                        if (value.length === 6 && value.split('/').length === 2) {
                          value = value.slice(0, 5) + '/' + value.slice(5);
                        }
                        setAddData({ ...addData, date: value });
                      }
                      
                      // Validasi tanggal setelah input lengkap
                      if (value.length === 10) {
                        const [day, month, year] = value.split('/');
                        const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        const today = new Date();
                        today.setHours(23, 59, 59, 999); // Set to end of today
                        
                        if (isNaN(selectedDate.getTime())) {
                          alert('Format tanggal tidak valid');
                          return;
                        }
                        
                        if (selectedDate > today) {
                          alert('Tidak bisa memilih tanggal yang belum dimulai (besok atau masa depan)');
                          const todayFormatted = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
                          setAddData({ ...addData, date: todayFormatted });
                          return;
                        }
                      }
                    }}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Format: dd/mm/yyyy (contoh: 05/12/2025). Tidak bisa memilih hari yang belum dimulai.
                  </p>
                </div>
              )}
              {!isGudang && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Toko *
                  </label>
                  <select
                    required
                    value={addData.storeId}
                    onChange={(e) => setAddData({ ...addData, storeId: e.target.value })}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                  >
                    <option value="">Pilih Toko</option>
                    {stores.map(store => (
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
                  className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    const today = new Date();
                    const defaultDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
                    setAddData({ productId: '', quantity: '', date: defaultDate, storeId: '' });
                  }}
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
              {isGudang && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transfer ke Toko *
                  </label>
                  <select
                    required
                    value={transferData.toStoreId}
                    onChange={(e) => setTransferData({ ...transferData, toStoreId: e.target.value })}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                  >
                    <option value="">Pilih Toko</option>
                    {stores.map(store => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {!isGudang && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dari Toko *
                  </label>
                  <select
                    required
                    value={transferData.fromStoreId}
                    onChange={(e) => setTransferData({ ...transferData, fromStoreId: e.target.value })}
                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                  >
                    <option value="">Pilih Toko</option>
                    {stores.map(store => (
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
    </div>
  );
}

