import { NextRequest, NextResponse } from 'next/server';
import { getProducts, addProduct, updateProduct, getProduct } from '@/lib/storage';
import { Product, PriceHistory } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const products = getProducts();
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, sku, initialPrice } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 });
    }

    const initialCostPrice = initialPrice ? parseFloat(initialPrice) : 0;
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    
    const product: Product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      sku: sku || '',
      costPrice: initialCostPrice,
      costHistory: initialCostPrice > 0 ? [{ price: initialCostPrice, timestamp }] : [],
      createdAt: new Date().toISOString(),
    };

    addProduct(product);
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, sku } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    const updates: Partial<Product> = {};
    if (name) updates.name = name;
    if (sku !== undefined) updates.sku = sku;

    updateProduct(id, updates);
    const updatedProduct = getProduct(id);
    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

