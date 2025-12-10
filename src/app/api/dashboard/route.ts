import { NextRequest, NextResponse } from 'next/server';
import { getSales, getProducts, getStores, getCostPriceAtTime } from '@/lib/storage';
import { DashboardData } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const sales = await getSales();
    const products = await getProducts();
    const stores = await getStores();

    // Tidak ada filter tanggal - ambil semua sales yang berhasil diimport
    const filteredSales = sales;

    // Group sales by product untuk menghitung dengan rumus yang sama dengan database produk
    const salesByProductMap = new Map<string, { 
      productId: string;
      quantity: number; 
      sales: typeof filteredSales;
    }>();
    
    filteredSales.forEach(sale => {
      const existing = salesByProductMap.get(sale.productName) || { 
        productId: sale.productId,
        quantity: 0, 
        sales: [] 
      };
      existing.quantity += sale.quantity;
      existing.sales.push(sale);
      salesByProductMap.set(sale.productName, existing);
    });

    // Calculate totals menggunakan rumus yang sama dengan database produk
    // Total Pendapatan = Σ(Harga Jual Terbaru per Product × Jumlah Terjual per Product)
    // Total Keuntungan = Σ(Total Pendapatan per Product - (Harga Modal × Jumlah Terjual per Product))
    let totalSales = 0;
    let totalProfit = 0;

    for (const [productName, productData] of salesByProductMap.entries()) {
      const product = products.find(p => p.id === productData.productId);
      if (!product) continue;

      // Get latest selling price for this product
      let sellingPrice: number | undefined = undefined;
      if (productData.sales.length > 0) {
        const sortedSales = [...productData.sales].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        sellingPrice = sortedSales[0].price;
      }

      // Calculate revenue: Harga Jual Terbaru × Jumlah Terjual
      const productRevenue = sellingPrice && productData.quantity > 0
        ? Math.round((sellingPrice * productData.quantity) * 100) / 100
        : 0;

      // Calculate profit: Total Pendapatan - (Harga Modal × Jumlah Terjual)
      const productCost = product.costPrice * productData.quantity;
      const productProfit = Math.round((productRevenue - productCost) * 100) / 100;

      totalSales += productRevenue;
      totalProfit += productProfit;
    }

    // Jumlah transaksi = jumlah sales records (setiap sale adalah 1 transaksi)
    const salesCount = filteredSales.length;

    // Jumlah total produk = sum dari semua quantity yang terjual dari CSV
    const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);

    // Sales by product (untuk display)
    const salesByProduct = Array.from(salesByProductMap.entries()).map(([productName, productData]) => {
      const product = products.find(p => p.id === productData.productId);
      if (!product) {
        return { productName, quantity: productData.quantity, revenue: 0 };
      }

      // Get latest selling price
      let sellingPrice: number | undefined = undefined;
      if (productData.sales.length > 0) {
        const sortedSales = [...productData.sales].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        sellingPrice = sortedSales[0].price;
      }

      // Calculate revenue using same formula
      const revenue = sellingPrice && productData.quantity > 0
        ? Math.round((sellingPrice * productData.quantity) * 100) / 100
        : 0;

      return {
        productName,
        quantity: productData.quantity,
        revenue,
      };
    });

    // Sales by store (untuk display)
    // Group by store, then calculate using same formula per product
    const salesByStoreMap = new Map<string, number>();
    
    for (const sale of filteredSales) {
      const store = stores.find(s => s.id === sale.storeId);
      const storeName = store?.name || 'Unknown';
      
      // Get product to find latest selling price
      const product = products.find(p => p.id === sale.productId);
      if (!product) continue;

      // Get all sales for this product to find latest selling price
      const productSales = filteredSales.filter(s => s.productId === sale.productId);
      let sellingPrice: number | undefined = undefined;
      if (productSales.length > 0) {
        const sortedSales = [...productSales].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        sellingPrice = sortedSales[0].price;
      }

      // Calculate revenue for this sale using latest selling price
      const saleRevenue = sellingPrice ? Math.round((sellingPrice * sale.quantity) * 100) / 100 : 0;
      
      const existing = salesByStoreMap.get(storeName) || 0;
      salesByStoreMap.set(storeName, existing + saleRevenue);
    }

    const salesByStore = Array.from(salesByStoreMap.entries()).map(([storeName, revenue]) => ({
      storeName,
      revenue,
    }));

    const dashboardData: DashboardData = {
      totalSales,
      totalProfit,
      salesCount,
      totalQuantity,
      salesByProduct,
      salesByStore,
    };

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

