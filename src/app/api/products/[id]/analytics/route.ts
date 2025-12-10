import { NextRequest, NextResponse } from 'next/server';
import { getSales, getProducts, getProductLocations, getCostPriceAtTime, getStores } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sales = getSales();
    const products = getProducts();
    const locations = getProductLocations();
    const stores = getStores();

    const product = products.find(p => p.id === id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // Check if product has stock
    const productLocations = locations.filter(l => l.productId === id);
    const totalStock = productLocations.reduce((sum, loc) => sum + loc.quantity, 0);

    if (totalStock === 0) {
      return NextResponse.json({ 
        success: true, 
        data: { 
          product,
          hasStock: false,
          message: 'Produk belum memiliki stok'
        } 
      });
    }

    // Get all sales for this product
    const productSales = sales.filter(sale => sale.productId === id);

    // Calculate analytics
    const totalSales = productSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalQuantitySold = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
    
    const totalProfit = productSales.reduce((sum, sale) => {
      const costPrice = getCostPriceAtTime(product, sale.timestamp);
      const totalCost = costPrice * sale.quantity;
      return sum + (sale.total - totalCost);
    }, 0);

    // Sales by date
    const salesByDateMap = new Map<string, { quantity: number; revenue: number; profit: number }>();
    productSales.forEach(sale => {
      const existing = salesByDateMap.get(sale.date) || { quantity: 0, revenue: 0, profit: 0 };
      const costPrice = getCostPriceAtTime(product, sale.timestamp);
      const totalCost = costPrice * sale.quantity;
      existing.quantity += sale.quantity;
      existing.revenue += sale.total;
      existing.profit += (sale.total - totalCost);
      salesByDateMap.set(sale.date, existing);
    });

    const salesByDate = Array.from(salesByDateMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Sales by store
    const salesByStoreMap = new Map<string, { quantity: number; revenue: number }>();
    productSales.forEach(sale => {
      const store = stores.find(s => s.id === sale.storeId);
      const storeName = store?.name || 'Unknown';
      const existing = salesByStoreMap.get(storeName) || { quantity: 0, revenue: 0 };
      existing.quantity += sale.quantity;
      existing.revenue += sale.total;
      salesByStoreMap.set(storeName, existing);
    });

    const salesByStore = Array.from(salesByStoreMap.entries()).map(([storeName, data]) => ({
      storeName,
      ...data,
    }));

    // Stock information
    const stockInfo = productLocations.map(loc => ({
      location: loc.location,
      storeId: loc.storeId,
      storeName: loc.storeId ? stores.find(s => s.id === loc.storeId)?.name : undefined,
      quantity: loc.quantity,
    }));

    return NextResponse.json({
      success: true,
      data: {
        product,
        hasStock: true,
        totalStock,
        stockInfo,
        totalSales,
        totalQuantitySold,
        totalProfit,
        salesCount: productSales.length,
        salesByDate,
        salesByStore,
      },
    });
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch product analytics' }, { status: 500 });
  }
}

