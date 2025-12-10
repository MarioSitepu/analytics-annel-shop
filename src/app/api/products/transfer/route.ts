import { NextRequest, NextResponse } from 'next/server';
import { addProductTransfer, updateProductLocation, getProductLocations } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const { productId, fromLocation, toLocation, fromStoreId, toStoreId, quantity } = await request.json();

    if (!productId || !fromLocation || !toLocation || !quantity) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    // Check if source has enough quantity
    const locations = getProductLocations();
    const sourceLocation = locations.find(
      l => l.productId === productId && l.location === fromLocation && l.storeId === fromStoreId
    );

    if (!sourceLocation || sourceLocation.quantity < quantity) {
      return NextResponse.json({ success: false, error: 'Insufficient quantity in source location' }, { status: 400 });
    }

    // Update source location
    updateProductLocation(productId, fromLocation, fromStoreId, sourceLocation.quantity - quantity);

    // Update destination location
    const destLocation = locations.find(
      l => l.productId === productId && l.location === toLocation && l.storeId === toStoreId
    );
    const destQuantity = destLocation ? destLocation.quantity + quantity : quantity;
    updateProductLocation(productId, toLocation, toStoreId, destQuantity);

    // Record transfer
    const transfer = {
      id: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      fromLocation,
      toLocation,
      fromStoreId,
      toStoreId,
      quantity,
      timestamp: new Date().toISOString(),
    };

    addProductTransfer(transfer);

    return NextResponse.json({ success: true, data: transfer });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to transfer product' }, { status: 500 });
  }
}

