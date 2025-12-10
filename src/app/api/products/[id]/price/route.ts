import { NextRequest, NextResponse } from 'next/server';
import { getProduct, addCostPriceHistory, updateProduct } from '@/lib/storage';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { price, timestamp, updateMode } = await request.json();
    const { id } = await params;

    if (!id || !price) {
      return NextResponse.json({ success: false, error: 'Product ID and price are required' }, { status: 400 });
    }

    const product = await getProduct(id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    // If updateMode is 'purchase', don't require timestamp
    // If updateMode is 'date', require timestamp
    if (updateMode === 'date' && !timestamp) {
      return NextResponse.json({ success: false, error: 'Timestamp is required for date-based price updates' }, { status: 400 });
    }

    // Add cost price history (harga modal)
    const priceTimestamp = timestamp || new Date().toISOString().slice(0, 16).replace('T', ' ');
    await addCostPriceHistory(id, price, priceTimestamp);

    // Update product's price update mode
    if (updateMode) {
      await updateProduct(id, { priceUpdateMode: updateMode });
    }

    return NextResponse.json({ success: true, message: 'Price updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update price' }, { status: 500 });
  }
}

