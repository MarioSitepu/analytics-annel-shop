'use client';

import { useState, useEffect } from 'react';
import { Database, Package, DollarSign, TrendingUp, ShoppingCart, MapPin } from 'lucide-react';

interface ProcessedProductData {
  id: string;
  name: string;
  sku?: string;
  costPrice: number;
  sellingPrice?: number;
  totalStock: number;
  stockLocations: {
    location: 'gudang' | 'toko';
    storeId?: string;
    storeName?: string;
    quantity: number;
  }[];
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  totalQuantitySold: number;
  createdAt: string;
}

export default function DatabaseBarangPage() {
  const [products, setProducts] = useState<ProcessedProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products/database');
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

  const formatCurrency = (value: number) => {
    // Round to 2 decimal places to avoid floating point precision issues
    const rounded = Math.round(value * 100) / 100;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rounded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleExpand = (productId: string) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="h-8 w-8" />
            Database Barang
          </h1>
          <p className="text-gray-600 mt-1">Data produk yang sudah diolah dengan informasi lengkap</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Cari produk berdasarkan nama atau SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-gray-600">Total Produk</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-gray-600">Total Stok</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {products.reduce((sum, p) => sum + p.totalStock, 0)}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
          </div>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {formatCurrency(products.reduce((sum, p) => sum + p.totalRevenue, 0))}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-gray-600">Total Keuntungan</p>
          </div>
          <p className="mt-2 text-xl font-bold text-green-600">
            {formatCurrency(products.reduce((sum, p) => sum + p.totalProfit, 0))}
          </p>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Memuat data...</div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            {searchTerm ? 'Tidak ada produk yang sesuai dengan pencarian' : 'Belum ada produk'}
          </p>
        </div>
      ) : (
        <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga Modal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga Jual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Terjual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pendapatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keuntungan
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <>
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.sku && (
                            <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            Dibuat: {formatDate(product.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(product.costPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.sellingPrice ? formatCurrency(product.sellingPrice) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                        {product.totalStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.totalQuantitySold} unit
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(product.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatCurrency(product.totalProfit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => toggleExpand(product.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {expandedProduct === product.id ? 'Sembunyikan' : 'Lihat Detail'}
                        </button>
                      </td>
                    </tr>
                    {expandedProduct === product.id && (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Lokasi Stok
                              </h4>
                              {product.stockLocations.length === 0 ? (
                                <p className="text-sm text-gray-500">Tidak ada stok</p>
                              ) : (
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                  {product.stockLocations.map((loc, index) => (
                                    <div
                                      key={index}
                                      className="bg-white rounded-lg p-3 border border-gray-200"
                                    >
                                      <div className="text-sm font-medium text-gray-900 capitalize">
                                        {loc.location}
                                      </div>
                                      {loc.storeName && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          {loc.storeName}
                                        </div>
                                      )}
                                      <div className="text-sm font-semibold text-blue-600 mt-1">
                                        {loc.quantity} unit
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="text-xs text-gray-500">Total Transaksi</div>
                                <div className="text-sm font-semibold text-gray-900 mt-1">
                                  {product.totalSales}
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="text-xs text-gray-500">Jumlah Terjual</div>
                                <div className="text-sm font-semibold text-gray-900 mt-1">
                                  {product.totalQuantitySold} unit
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="text-xs text-gray-500">Total Pendapatan</div>
                                <div className="text-sm font-semibold text-gray-900 mt-1">
                                  {formatCurrency(product.totalRevenue)}
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="text-xs text-gray-500">Total Keuntungan</div>
                                <div className="text-sm font-semibold text-green-600 mt-1">
                                  {formatCurrency(product.totalProfit)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

