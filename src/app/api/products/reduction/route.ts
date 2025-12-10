import { NextRequest, NextResponse } from 'next/server';
import { updateProductLocation, getProductLocations, getProduct } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, location, storeId, quantity } = body;

    if (!productId || !location || !quantity) {
      return NextResponse.json({ success: false, error: 'Product ID, location, and quantity are required' }, { status: 400 });
    }

    if (location !== 'gudang' && location !== 'toko') {
      return NextResponse.json({ success: false, error: 'Location must be gudang or toko' }, { status: 400 });
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json({ success: false, error: 'Quantity must be greater than 0' }, { status: 400 });
    }

    // Get current location quantity
    const locations = await getProductLocations();
    const existingLocation = locations.find(
      l => l.productId === productId && l.location === location && l.storeId === storeId
    );

    if (!existingLocation) {
      return NextResponse.json({ success: false, error: 'Produk tidak ditemukan di lokasi ini' }, { status: 400 });
    }

    const currentQuantity = existingLocation.quantity;
    const newQuantity = currentQuantity - quantityNum;

    if (newQuantity < 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Stok tidak cukup. Stok saat ini: ${currentQuantity}` 
      }, { status: 400 });
    }

    // Update location quantity
    await updateProductLocation(productId, location, storeId, newQuantity);

    return NextResponse.json({ 
      success: true, 
      data: { 
        productId, 
        location, 
        storeId, 
        quantity: quantityNum,
        previousQuantity: currentQuantity,
        newQuantity 
      } 
    });
  } catch (error) {
    console.error('Error reducing product quantity:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to reduce product quantity';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}

