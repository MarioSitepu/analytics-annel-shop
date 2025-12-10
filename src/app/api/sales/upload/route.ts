import { NextRequest, NextResponse } from 'next/server';
import { addSales, getProducts, getCostPriceAtTime, getStores, addUndetectedProduct, addCostPriceHistory } from '@/lib/storage';
import { Sale } from '@/types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const storeId = formData.get('storeId') as string;

    if (!file || !storeId) {
      return NextResponse.json({ success: false, error: 'File and store ID are required' }, { status: 400 });
    }

    const products = getProducts();
    const stores = getStores();
    const store = stores.find(s => s.id === storeId);

    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    const sales: Sale[] = [];
    const errors: string[] = [];
    let rows: any[] = [];
    const updatedProductIds = new Set<string>(); // Track products that had price updates

    // Check file type
    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (isExcel) {
      // Parse Excel file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Find worksheet named "orders"
      const sheetName = workbook.SheetNames.find(name => 
        name.toLowerCase().includes('order') || name.toLowerCase() === 'orders'
      ) || workbook.SheetNames[0]; // Fallback to first sheet if "orders" not found
      
      if (!sheetName) {
        return NextResponse.json({ success: false, error: 'No worksheet found in Excel file' }, { status: 400 });
      }

      const worksheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    } else {
      // Parse CSV file
      const text = await file.text();
      const parseResult = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      });
      rows = parseResult.data as any[];
    }

    rows.forEach((row: any, index: number) => {
      try {
        // Map columns according to requirements:
        // No. Pesanan = Id Produk (order ID, for reference)
        // Waktu Pembayaran Dilakukan = Waktu pembelian
        // Nama Variasi = Nama produk
        // Harga Setelah Diskon = Harga produk
        // Jumlah = jumlah produk dibeli

        const orderId = row['No. Pesanan'] || row['No Pesanan'] || row['No. Pesanan'] || row['Order ID'] || '';
        const waktuPembayaran = row['Waktu Pembayaran Dilakukan'] || row['Waktu Pembayaran'] || row['Waktu'] || row['Time'] || '';
        const namaVariasi = row['Nama Variasi'] || row['Nama Produk'] || row['Product Name'] || row['productName'] || '';
        const hargaSetelahDiskon = row['Harga Setelah Diskon'] || row['Harga Setelah Diskon'] || row['Harga'] || row['Price'] || row['price'] || '0';
        const jumlah = row['Jumlah'] || row['Quantity'] || row['quantity'] || row['qty'] || '0';

        if (!namaVariasi || !jumlah) {
          errors.push(`Baris ${index + 2}: Nama produk atau jumlah tidak boleh kosong`);
          return;
        }

        // Find product by name (Nama Variasi)
        const product = products.find(p => 
          p.name.toLowerCase() === namaVariasi.toLowerCase() ||
          p.name.toLowerCase().includes(namaVariasi.toLowerCase()) ||
          namaVariasi.toLowerCase().includes(p.name.toLowerCase())
        );

        if (!product) {
          errors.push(`Baris ${index + 2}: Produk "${namaVariasi}" tidak ditemukan`);
          
          // Save undetected product
          const undetected = {
            id: `undetected_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            productName: namaVariasi,
            storeId,
            storeName: store.name,
            rowNumber: index + 2,
            timestamp: new Date().toISOString(),
          };
          addUndetectedProduct(undetected);
          
          return;
        }

        // Parse waktu pembayaran
        let date = new Date().toISOString().split('T')[0];
        let time = new Date().toTimeString().slice(0, 5);
        let timestamp = new Date().toISOString();

        if (waktuPembayaran) {
          try {
            // Try to parse various date formats
            const dateStr = waktuPembayaran.toString().trim();
            
            // Format: "2025-12-05 14:20" or "05/12/2025 14:20" or "2025-12-05T14:20:00"
            let parsedDate: Date;
            
            if (dateStr.includes('T')) {
              // ISO format
              parsedDate = new Date(dateStr);
            } else if (dateStr.includes('/')) {
              // Format: "05/12/2025 14:20"
              const [datePart, timePart] = dateStr.split(' ');
              const [day, month, year] = datePart.split('/');
              if (timePart) {
                parsedDate = new Date(`${year}-${month}-${day}T${timePart}`);
              } else {
                parsedDate = new Date(`${year}-${month}-${day}`);
              }
            } else {
              // Format: "2025-12-05 14:20" or "2025-12-05"
              parsedDate = new Date(dateStr.replace(' ', 'T'));
            }

            if (!isNaN(parsedDate.getTime())) {
              date = parsedDate.toISOString().split('T')[0];
              const hours = parsedDate.getHours().toString().padStart(2, '0');
              const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
              time = `${hours}:${minutes}`;
              timestamp = parsedDate.toISOString();
            }
          } catch (e) {
            // Use current date/time if parsing fails
            console.warn(`Failed to parse date: ${waktuPembayaran}`);
          }
        }

        // Parse harga dan jumlah
        const quantity = parseFloat(jumlah.toString().replace(/[^\d.-]/g, '')) || 0;
        const price = parseFloat(hargaSetelahDiskon.toString().replace(/[^\d.-]/g, '')) || 0;

        if (quantity <= 0) {
          errors.push(`Baris ${index + 2}: Jumlah harus lebih dari 0`);
          return;
        }

        // CSV contains selling price (harga penjualan)
        // We need to determine the selling price for this sale
        let salePrice = price > 0 ? price : 0;
        
        // If CSV doesn't have price, we can't create a sale
        if (salePrice <= 0) {
          errors.push(`Baris ${index + 2}: Harga penjualan tidak valid atau tidak ada`);
          return;
        }

        // Note: CSV contains SELLING PRICE (harga penjualan), not cost price (harga modal)
        // Cost price is updated separately through "Ubah Harga Modal" form
        // Mode 'purchase' for cost price means: update cost price when adding new stock,
        // not from sales CSV (which only contains selling price)

        const sale: Sale = {
          id: `sale_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          storeId,
          productId: product.id,
          productName: product.name,
          quantity,
          price: salePrice,
          total: quantity * salePrice,
          date,
          timestamp,
        };

        sales.push(sale);
      } catch (error) {
        errors.push(`Baris ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    if (sales.length > 0) {
      addSales(sales);
    }

    return NextResponse.json({
      success: true,
      data: {
        imported: sales.length,
        errors: errors.length > 0 ? errors : undefined,
        totalRows: rows.length,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: `Failed to upload sales: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}
