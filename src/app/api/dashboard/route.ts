import { NextRequest, NextResponse } from 'next/server';
import { getSales, getProducts, getStores, getCostPriceAtTime } from '@/lib/storage';
import { DashboardData } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ success: false, error: 'Date parameter is required' }, { status: 400 });
    }

    const sales = getSales();
    const products = getProducts();
    const stores = getStores();

    // Filter sales by date
    const filteredSales = sales.filter(sale => sale.date === date);

    // Calculate totals
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    
    // Calculate profit: Revenue (selling price) - Cost (cost price)
    const totalProfit = filteredSales.reduce((sum, sale) => {
      const product = products.find(p => p.id === sale.productId);
      if (!product) return sum;
      
      // Get cost price at the time of sale
      const costPrice = getCostPriceAtTime(product, sale.timestamp);
      const totalCost = costPrice * sale.quantity;
      
      // Profit = Revenue (sale.total) - Cost (costPrice * quantity)
      return sum + (sale.total - totalCost);
    }, 0);

    // Sales by product
    const salesByProductMap = new Map<string, { quantity: number; revenue: number }>();
    filteredSales.forEach(sale => {
      const existing = salesByProductMap.get(sale.productName) || { quantity: 0, revenue: 0 };
      existing.quantity += sale.quantity;
      existing.revenue += sale.total;
      salesByProductMap.set(sale.productName, existing);
    });

    const salesByProduct = Array.from(salesByProductMap.entries()).map(([productName, data]) => ({
      productName,
      ...data,
    }));

    // Sales by store
    const salesByStoreMap = new Map<string, number>();
    filteredSales.forEach(sale => {
      const store = stores.find(s => s.id === sale.storeId);
      const storeName = store?.name || 'Unknown';
      const existing = salesByStoreMap.get(storeName) || 0;
      salesByStoreMap.set(storeName, existing + sale.total);
    });

    const salesByStore = Array.from(salesByStoreMap.entries()).map(([storeName, revenue]) => ({
      storeName,
      revenue,
    }));

    const dashboardData: DashboardData = {
      totalSales,
      totalProfit,
      salesCount: filteredSales.length,
      salesByProduct,
      salesByStore,
    };

    return NextResponse.json({ success: true, data: dashboardData });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

