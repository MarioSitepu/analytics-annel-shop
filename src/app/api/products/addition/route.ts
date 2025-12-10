import { NextRequest, NextResponse } from 'next/server';
import { addProductAddition, updateProductLocation, getProductLocations, getProduct, addCostPriceHistory } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, location, storeId, quantity, costPrice, date } = body;

    if (!productId || !location || !quantity) {
      return NextResponse.json({ success: false, error: 'Product ID, location, and quantity are required' }, { status: 400 });
    }

    if (location !== 'gudang' && location !== 'toko') {
      return NextResponse.json({ success: false, error: 'Location must be gudang or toko' }, { status: 400 });
    }

    // Update location quantity
    const locations = await getProductLocations();
    const existingLocation = locations.find(
      l => l.productId === productId && l.location === location && l.storeId === storeId
    );
    const newQuantity = existingLocation ? existingLocation.quantity + quantity : quantity;
    await updateProductLocation(productId, location, storeId, newQuantity);

    // Record addition - use custom date if provided (for gudang), otherwise use current time
    let finalTimestamp: string;
    if (date) {
      // Parse date format: dd/mm/yyyy or yyyy-mm-dd
      let parsedDate: Date;
      
      if (date.includes('/')) {
        // Format: dd/mm/yyyy
        const [day, month, year] = date.split('/');
        parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Format: yyyy-mm-dd
        parsedDate = new Date(date);
      }
      
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ success: false, error: 'Format tanggal tidak valid' }, { status: 400 });
      }
      
      const now = new Date();
      now.setHours(23, 59, 59, 999); // Set to end of today for comparison
      
      // Validasi: tidak boleh lebih dari hari ini
      if (parsedDate > now) {
        return NextResponse.json({ success: false, error: 'Tidak bisa menambahkan stok untuk tanggal yang belum dimulai' }, { status: 400 });
      }
      
      // Set time to start of day (00:00:00)
      parsedDate.setHours(0, 0, 0, 0);
      finalTimestamp = parsedDate.toISOString();
    } else {
      finalTimestamp = new Date().toISOString();
    }
    
    const addition = {
      id: `addition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      location,
      storeId,
      quantity,
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

