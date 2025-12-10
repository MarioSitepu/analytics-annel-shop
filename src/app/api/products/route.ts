import { NextRequest, NextResponse } from 'next/server';
import { getProducts, addProduct, updateProduct, getProduct, addCostPriceHistory } from '@/lib/storage';
import { Product, PriceHistory } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const products = await getProducts();
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
    const now = new Date();
    const timestamp = now.toISOString();
    
    const product: Product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      sku: sku || '',
      costPrice: initialCostPrice,
      costHistory: [],
      createdAt: now.toISOString(),
    };

    // Create product first
    try {
      await addProduct(product);
    } catch (err) {
      console.error('Error creating product:', err);
      throw err; // Re-throw to be caught by outer catch
    }
    
    // Add cost price history if initial price provided (non-blocking)
    if (initialCostPrice > 0) {
      try {
        await addCostPriceHistory(product.id, initialCostPrice, timestamp);
      } catch (err) {
        console.error('Error adding cost price history (non-critical):', err);
        // Continue - product already created successfully
      }
    }
    
    // Fetch the created product with relations
    try {
      const createdProduct = await getProduct(product.id);
      return NextResponse.json({ success: true, data: createdProduct || product });
    } catch (err) {
      // If fetch fails, return the product data we have
      console.error('Error fetching created product:', err);
      return NextResponse.json({ success: true, data: product });
    }
  } catch (error) {
    console.error('Error creating product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
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

    await updateProduct(id, updates);
    const updatedProduct = await getProduct(id);
    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update product' }, { status: 500 });
  }
}

