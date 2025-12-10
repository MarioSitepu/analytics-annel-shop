import { NextRequest, NextResponse } from 'next/server';
import { addProductAddition, updateProductLocation, getProductLocations, getProduct, addCostPriceHistory } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, location, storeId, quantity, costPrice } = body;

    if (!productId || !location || !quantity) {
      return NextResponse.json({ success: false, error: 'Product ID, location, and quantity are required' }, { status: 400 });
    }

    if (location !== 'gudang' && location !== 'toko') {
      return NextResponse.json({ success: false, error: 'Location must be gudang or toko' }, { status: 400 });
    }

    // Update location quantity
    const locations = getProductLocations();
    const existingLocation = locations.find(
      l => l.productId === productId && l.location === location && l.storeId === storeId
    );
    const newQuantity = existingLocation ? existingLocation.quantity + quantity : quantity;
    updateProductLocation(productId, location, storeId, newQuantity);

    // Record addition
    const timestamp = new Date().toISOString();
    const addition = {
      id: `addition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      location,
      storeId,
      quantity,
      timestamp,
    };

    addProductAddition(addition);

    // If product has priceUpdateMode = 'purchase', update cost price when adding stock
    // If costPrice is provided in request, update it
    const product = getProduct(productId);
    if (product && product.priceUpdateMode === 'purchase' && costPrice && costPrice > 0) {
      const priceTimestamp = timestamp.slice(0, 16).replace('T', ' ');
      addCostPriceHistory(productId, costPrice, priceTimestamp);
    }

    return NextResponse.json({ success: true, data: addition });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to add product' }, { status: 500 });
  }
}

