import { NextRequest, NextResponse } from 'next/server';
import { getProductLocations, updateProductLocation, saveProductLocations } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const locations = await getProductLocations();
    return NextResponse.json({ success: true, data: locations });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch product locations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId, location, storeId, quantity } = await request.json();

    if (!productId || !location || quantity === undefined) {
      return NextResponse.json({ success: false, error: 'Product ID, location, and quantity are required' }, { status: 400 });
    }

    if (location !== 'gudang' && location !== 'toko') {
      return NextResponse.json({ success: false, error: 'Location must be gudang or toko' }, { status: 400 });
    }

    await updateProductLocation(productId, location, storeId, quantity);
    return NextResponse.json({ success: true, message: 'Product location updated' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update product location' }, { status: 500 });
  }
}

