import { NextRequest, NextResponse } from 'next/server';
import { getStores, addStore } from '@/lib/storage';
import { Store } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const stores = getStores();
    return NextResponse.json({ success: true, data: stores });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch stores' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, address } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Nama toko harus diisi' }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ success: false, error: 'Jenis toko harus dipilih' }, { status: 400 });
    }

    if (type !== 'offline' && type !== 'online') {
      return NextResponse.json({ success: false, error: 'Jenis toko harus offline atau online' }, { status: 400 });
    }

    // Check if store with same name already exists
    const stores = getStores();
    const existingStore = stores.find(s => s.name.toLowerCase().trim() === name.toLowerCase().trim());
    if (existingStore) {
      return NextResponse.json({ success: false, error: 'Toko dengan nama ini sudah ada' }, { status: 400 });
    }

    const store: Store = {
      id: `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      type,
      address: address ? address.trim() : '',
      createdAt: new Date().toISOString(),
    };

    addStore(store);
    return NextResponse.json({ success: true, data: store });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Gagal membuat toko: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

