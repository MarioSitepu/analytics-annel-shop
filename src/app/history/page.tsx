'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Package, ArrowRight, Plus } from 'lucide-react';
import { ProductTransfer, ProductAddition } from '@/types';

interface HistoryData {
  transfers: ProductTransfer[];
  additions: ProductAddition[];
}

export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'transfers' | 'additions'>('transfers');

  useEffect(() => {
    fetchHistory();
    fetchProducts();
    fetchStores();
  }, [selectedDate]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/history?date=${selectedDate}`);
      const result = await response.json();
      if (result.success) {
        setHistoryData(result.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores');
      const result = await response.json();
      if (result.success) {
        setStores(result.data);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
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

  const formatDateTime = (timestamp: string): string => {
    try {
      return format(new Date(timestamp), 'dd/MM/yyyy HH:mm');
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">History</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="h-5 w-5" />
            Pilih Tanggal:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('transfers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transfers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Transfer Produk
          </button>
          <button
            onClick={() => setActiveTab('additions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'additions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Penambahan Stok
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Memuat data...</div>
        </div>
      ) : (
        <>
          {activeTab === 'transfers' ? (
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">History Transfer Produk</h2>
              </div>
              {historyData && historyData.transfers.length > 0 ? (
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
                          Dari
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ke
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jumlah
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {historyData.transfers.map((transfer) => (
                        <tr key={transfer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(transfer.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {getProductName(transfer.productId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <span className="capitalize">{transfer.fromLocation}</span>
                              {transfer.fromLocation === 'toko' && transfer.fromStoreId && (
                                <span className="text-gray-400">({getStoreName(transfer.fromStoreId)})</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                              <span className="capitalize">{transfer.toLocation}</span>
                              {transfer.toLocation === 'toko' && transfer.toStoreId && (
                                <span className="text-gray-400">({getStoreName(transfer.toStoreId)})</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transfer.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  Tidak ada data transfer untuk tanggal yang dipilih
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-white shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">History Penambahan Stok</h2>
              </div>
              {historyData && historyData.additions.length > 0 ? (
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
                      {historyData.additions.map((addition) => (
                        <tr key={addition.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(addition.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {getProductName(addition.productId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Plus className="h-4 w-4 text-green-600" />
                              <span className="capitalize">{addition.location}</span>
                              {addition.location === 'toko' && addition.storeId && (
                                <span className="text-gray-400">({getStoreName(addition.storeId)})</span>
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
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  Tidak ada data penambahan untuk tanggal yang dipilih
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

