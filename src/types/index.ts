export interface Product {
  id: string;
  name: string;
  sku?: string;
  costPrice: number; // Harga modal (cost price)
  costHistory: PriceHistory[]; // History perubahan harga modal
  sellingPrice?: number; // Harga jual (opsional, bisa dari CSV)
  sellingPriceHistory?: PriceHistory[]; // History harga jual
  createdAt: string;
  priceUpdateMode?: 'date' | 'purchase'; // 'date' = diubah pada tanggal, 'purchase' = diubah setiap pembelian
}

export interface PriceHistory {
  price: number;
  timestamp: string; // Format: "2025-12-05 14:20"
}

export interface Store {
  id: string;
  name: string;
  type: 'offline' | 'online';
  address?: string;
  createdAt: string;
}

export interface ProductLocation {
  productId: string;
  location: 'gudang' | 'toko';
  quantity: number;
  storeId?: string; // For 'toko' location, specify which store
}

export interface ProductTransfer {
  id: string;
  productId: string;
  fromLocation: 'gudang' | 'toko';
  toLocation: 'gudang' | 'toko';
  fromStoreId?: string;
  toStoreId?: string;
  quantity: number;
  timestamp: string;
}

export interface ProductAddition {
  id: string;
  productId: string;
  location: 'gudang' | 'toko';
  storeId?: string;
  quantity: number;
  timestamp: string;
}

export interface Sale {
  id: string;
  storeId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  date: string; // Format: "2025-12-05"
  timestamp: string;
}

export interface DashboardData {
  totalSales: number;
  totalProfit: number;
  salesCount: number;
  salesByProduct: { productName: string; quantity: number; revenue: number }[];
  salesByStore: { storeName: string; revenue: number }[];
}

export interface UndetectedProduct {
  id: string;
  productName: string;
  storeId: string;
  storeName: string;
  rowNumber: number;
  timestamp: string;
}

