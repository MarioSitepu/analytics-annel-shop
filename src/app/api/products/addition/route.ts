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
    const locations = getProductLocations();
    const existingLocation = locations.find(
      l => l.productId === productId && l.location === location && l.storeId === storeId
    );
    const newQuantity = existingLocation ? existingLocation.quantity + quantity : quantity;
    updateProductLocation(productId, location, storeId, newQuantity);

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

    addProductAddition(addition);

    // If product has priceUpdateMode = 'purchase', update cost price when adding stock
    // If costPrice is provided in request, update it
    const product = getProduct(productId);
    if (product && product.priceUpdateMode === 'purchase' && costPrice && costPrice > 0) {
      // Format timestamp untuk price history: yyyy-mm-dd HH:mm
      const dateForPrice = new Date(finalTimestamp);
      const year = dateForPrice.getFullYear();
      const month = (dateForPrice.getMonth() + 1).toString().padStart(2, '0');
      const day = dateForPrice.getDate().toString().padStart(2, '0');
      const hours = dateForPrice.getHours().toString().padStart(2, '0');
      const minutes = dateForPrice.getMinutes().toString().padStart(2, '0');
      const priceTimestamp = `${year}-${month}-${day} ${hours}:${minutes}`;
      addCostPriceHistory(productId, costPrice, priceTimestamp);
    }

    return NextResponse.json({ success: true, data: addition });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to add product' }, { status: 500 });
  }
}

