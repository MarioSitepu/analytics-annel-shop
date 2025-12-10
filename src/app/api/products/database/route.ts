import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getProductLocations, getSales, getStores, getCostPriceAtTime } from '@/lib/storage';

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

export async function GET(request: NextRequest) {
  try {
    const products = await getProducts();
    const locations = await getProductLocations();
    const sales = await getSales();
    const stores = await getStores();

    // Create a map of store IDs to store names
    const storeMap = new Map<string, string>();
    stores.forEach(store => {
      storeMap.set(store.id, store.name);
    });

    // Process each product
    const processedData: ProcessedProductData[] = await Promise.all(
      products.map(async (product) => {
        // Get all locations for this product
        const productLocations = locations.filter(loc => loc.productId === product.id);
        
        // Calculate total stock
        const totalStock = productLocations.reduce((sum, loc) => sum + loc.quantity, 0);

        // Map locations with store names
        const stockLocations = productLocations.map(loc => ({
          location: loc.location,
          storeId: loc.storeId,
          storeName: loc.storeId ? storeMap.get(loc.storeId) : undefined,
          quantity: loc.quantity,
        }));

        // Calculate sales statistics
        const productSales = sales.filter(sale => sale.productId === product.id);
        const totalQuantitySold = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
        
        // Get selling price from sales data (Harga Setelah Diskon from CSV)
        // Use the latest selling price from sales
        let sellingPrice: number | undefined = undefined;
        if (productSales.length > 0) {
          // Sort sales by timestamp (newest first)
          const sortedSales = [...productSales].sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          // Use the latest selling price (from most recent sale)
          sellingPrice = sortedSales[0].price;
        }
        
        // Calculate Total Pendapatan: Harga Jual Terbaru × Jumlah Terjual
        // Rumus: Total Pendapatan = sellingPrice × totalQuantitySold
        const totalRevenue = sellingPrice && totalQuantitySold > 0 
          ? Math.round((sellingPrice * totalQuantitySold) * 100) / 100
          : 0;
        
        // Calculate Total Keuntungan: Total Pendapatan - (Harga Modal × Jumlah Terjual)
        // Rumus: Total Keuntungan = totalRevenue - (costPrice × totalQuantitySold)
        // Menggunakan harga modal saat ini untuk perhitungan
        const totalCost = product.costPrice * totalQuantitySold;
        const totalProfit = Math.round((totalRevenue - totalCost) * 100) / 100;

        return {
          id: product.id,
          name: product.name,
          sku: product.sku,
          costPrice: product.costPrice,
          sellingPrice: sellingPrice, // Harga jual dari CSV (Harga Setelah Diskon)
          totalStock,
          stockLocations,
          totalSales: productSales.length,
          totalRevenue,
          totalProfit,
          totalQuantitySold,
          createdAt: product.createdAt,
        };
      })
    );

    // Sort by name
    processedData.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ success: true, data: processedData });
  } catch (error) {
    console.error('Error fetching processed product data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch processed product data' },
      { status: 500 }
    );
  }
}

