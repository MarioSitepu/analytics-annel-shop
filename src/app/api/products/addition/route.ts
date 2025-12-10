import { NextRequest, NextResponse } from 'next/server';
import { addProductAddition, updateProductLocation, getProductLocations, getProduct, addCostPriceHistory } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, location, storeId, quantity, costPrice } = body;

    if (!productId || !location || quantity === undefined || quantity === null) {
      return NextResponse.json({ success: false, error: 'Product ID, location, and quantity are required' }, { status: 400 });
    }

    // Parse quantity to number
    const quantityNum = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json({ success: false, error: 'Quantity must be a positive number' }, { status: 400 });
    }

    if (location !== 'gudang' && location !== 'toko') {
      return NextResponse.json({ success: false, error: 'Location must be gudang or toko' }, { status: 400 });
    }

    // Convert undefined to null for database consistency
    const finalStoreId = storeId || null;

    // Update location quantity - get current stock first
    const locations = await getProductLocations();
    // Handle both null and undefined for storeId matching
    const existingLocation = locations.find(
      l => l.productId === productId && 
           l.location === location && 
           ((l.storeId === finalStoreId) || 
            (l.storeId === null && finalStoreId === null) ||
            (l.storeId === undefined && finalStoreId === null))
    );
    
    const currentQuantity = existingLocation?.quantity || 0;
    const newQuantity = currentQuantity + quantityNum;
    
    console.log('Updating product location:', {
      productId,
      location,
      storeId: finalStoreId,
      currentQuantity,
      quantityToAdd: quantityNum,
      newQuantity,
      existingLocation: existingLocation ? { id: existingLocation.productId, quantity: existingLocation.quantity, storeId: existingLocation.storeId } : null,
      allMatchingLocations: locations.filter(l => l.productId === productId && l.location === location)
    });
    
    await updateProductLocation(productId, location, finalStoreId === null ? undefined : finalStoreId, newQuantity);
    
    console.log('Product location updated successfully');

    // Record addition - always use current time
    const finalTimestamp = new Date().toISOString();
    
    const addition = {
      id: `addition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      location,
      storeId: finalStoreId === null ? undefined : finalStoreId, // Convert null back to undefined for type consistency
      quantity: quantityNum,
      timestamp: finalTimestamp,
    };

    await addProductAddition(addition);

    // If product has priceUpdateMode = 'purchase', update cost price when adding stock
    // If costPrice is provided in request, update it
    if (costPrice && costPrice > 0) {
      try {
        const product = await getProduct(productId);
        if (product && product.priceUpdateMode === 'purchase') {
          // Use ISO timestamp format for database
          await addCostPriceHistory(productId, costPrice, finalTimestamp);
        }
      } catch (err) {
        console.error('Error updating cost price (non-critical):', err);
        // Continue - addition already successful
      }
    }

    return NextResponse.json({ success: true, data: addition });
  } catch (error) {
    console.error('Error adding product quantity:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to add product';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}

