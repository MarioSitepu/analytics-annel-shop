import { NextRequest, NextResponse } from 'next/server';
import { getProductAdditions, getUndetectedProducts, getProducts, getStores } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const additions = getProductAdditions();
    const undetected = getUndetectedProducts();
    const products = getProducts();
    const stores = getStores();

    // Sort by timestamp descending (newest first)
    const sortedAdditions = [...additions].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const sortedUndetected = [...undetected].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Enrich additions with product names
    const enrichedAdditions = sortedAdditions.map(addition => {
      const product = products.find(p => p.id === addition.productId);
      const store = addition.storeId ? stores.find(s => s.id === addition.storeId) : null;
      return {
        ...addition,
        productName: product?.name || 'Produk tidak ditemukan',
        storeName: store?.name || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        additions: enrichedAdditions,
        undetected: sortedUndetected,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 });
  }
}

