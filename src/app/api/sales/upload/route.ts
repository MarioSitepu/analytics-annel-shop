import { NextRequest, NextResponse } from 'next/server';
import { addSales, getProducts, getStores, addUndetectedProduct, getProductLocations, updateProductLocation, addSalesUploadHistory } from '@/lib/storage';
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

    const products = await getProducts();
    const stores = await getStores();
    const store = stores.find(s => s.id === storeId);

    if (!store) {
      return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
    }

    // Tentukan lokasi stok berdasarkan tipe toko
    // Online → gudang, Offline → toko
    const stockLocation: 'gudang' | 'toko' = store.type === 'online' ? 'gudang' : 'toko';
    // Untuk gudang dan toko offline, tidak ada storeId spesifik (semua share stok yang sama)
    const stockStoreId: string | undefined = undefined;

    // Log semua produk yang ada di database untuk debugging
    console.log(`📦 Total products in database: ${products.length}`);
    console.log('📦 Product names in database:', products.slice(0, 20).map(p => `"${p.name}"`).join(', '));
    if (products.length > 20) {
      console.log(`   ... and ${products.length - 20} more products`);
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
      // Use raw: false to get formatted values, and ensure proper header handling
      rows = XLSX.utils.sheet_to_json(worksheet, { 
        defval: '', 
        raw: false, // Get formatted values (important for dates and numbers)
      });
      
      // Log first row to see available columns (for debugging)
      if (rows.length > 0) {
        console.log('Excel columns found:', Object.keys(rows[0]));
        console.log('First row sample:', rows[0]);
      }
    } else {
      // Parse CSV file
      const text = await file.text();
      const parseResult = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      });
      rows = parseResult.data as any[];
      
      // Log first row to see available columns (for debugging)
      if (rows.length > 0) {
        console.log('CSV columns found:', Object.keys(rows[0]));
        console.log('First row sample:', rows[0]);
      }
    }

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      try {
        // Map columns according to requirements:
        // No. Pesanan = Id Produk (order ID, for reference)
        // Waktu Pembayaran Dilakukan = Waktu pembelian
        // Nama Variasi = Nama produk
        // Harga Setelah Diskon = Harga produk
        // Jumlah = jumlah produk dibeli

        // Helper function to normalize string (trim, remove extra spaces, lowercase)
        const normalizeString = (str: string): string => {
          if (!str) return '';
          return str.toString().trim().replace(/\s+/g, ' ').toLowerCase();
        };

        // Helper to find column value by trying multiple variations
        const getColumnValue = (variations: string[]): string => {
          for (const variation of variations) {
            if (row[variation] !== undefined && row[variation] !== null && row[variation] !== '') {
              return String(row[variation]);
            }
          }
          return '';
        };

        // Try multiple column name variations (prioritize exact match first)
        const orderId = getColumnValue(['No. Pesanan', 'No Pesanan', 'Order ID', 'order_id', 'OrderID', 'No Pesanan']);
        const waktuPembayaran = getColumnValue(['Waktu Pembayaran Dilakukan', 'Waktu Pembayaran', 'Waktu', 'Time', 'time', 'Timestamp', 'timestamp']);
        
        // Try all possible column names for product name (prioritize exact match)
        const namaVariasi = getColumnValue([
          'Nama Variasi', 
          'Nama Produk', 
          'Product Name', 
          'productName', 
          'ProductName',
          'Nama', 
          'nama', 
          'Name', 
          'name', 
          'Produk', 
          'produk'
        ]);
        
        const hargaSetelahDiskon = getColumnValue([
          'Harga Setelah Diskon', 
          'Harga Setelah Diskon', 
          'Harga', 
          'Price', 
          'price',
          'Harga Jual', 
          'harga_jual', 
          'Selling Price', 
          'selling_price'
        ]) || '0';
        
        const jumlah = getColumnValue([
          'Jumlah', 
          'Quantity', 
          'quantity', 
          'qty', 
          'Qty', 
          'QTY'
        ]) || '0';

        // Log untuk debugging (hanya baris pertama)
        if (index === 0) {
          console.log('Row data extracted:', {
            orderId,
            waktuPembayaran,
            namaVariasi,
            hargaSetelahDiskon,
            jumlah,
            allKeys: Object.keys(row)
          });
        }

        // Normalize nama produk
        const normalizedNamaVariasi = normalizeString(namaVariasi);

        if (!normalizedNamaVariasi || !jumlah) {
          errors.push(`Baris ${index + 2}: Nama produk atau jumlah tidak boleh kosong (Nama: "${namaVariasi}", Jumlah: "${jumlah}")`);
          continue;
        }

        // Find product by name with improved matching
        // 1. Exact match (case-insensitive, normalized)
        // 2. Partial match (one contains the other)
        // 3. Fuzzy match (similarity check)
        // 4. Word-by-word match (match jika sebagian besar kata sama)
        let product = products.find(p => {
          const normalizedProductName = normalizeString(p.name);
          
          // Exact match
          if (normalizedProductName === normalizedNamaVariasi) {
            return true;
          }
          
          // Partial match - one contains the other (lebih fleksibel)
          if (normalizedProductName.includes(normalizedNamaVariasi) || 
              normalizedNamaVariasi.includes(normalizedProductName)) {
            return true;
          }
          
          // Word-by-word match: split into words and check if most words match
          const productWords = normalizedProductName.split(/\s+/).filter(w => w.length > 1);
          const variasiWords = normalizedNamaVariasi.split(/\s+/).filter(w => w.length > 1);
          
          if (productWords.length > 0 && variasiWords.length > 0) {
            // Count matching words (lebih fleksibel: jika kata mengandung atau dikandung)
            const matchingWords = variasiWords.filter(vw => 
              productWords.some(pw => {
                // Exact word match
                if (pw === vw) return true;
                // One contains the other (untuk menangani variasi seperti "bioaqu" vs "bio aqua")
                if (pw.includes(vw) || vw.includes(pw)) return true;
                // Similarity check: jika >70% karakter sama
                const minLen = Math.min(pw.length, vw.length);
                const maxLen = Math.max(pw.length, vw.length);
                if (minLen >= 3) {
                  let sameChars = 0;
                  for (let i = 0; i < minLen; i++) {
                    if (pw[i] === vw[i]) sameChars++;
                  }
                  if (sameChars / maxLen >= 0.7) return true;
                }
                return false;
              })
            );
            
            // If more than 40% of words match (lebih fleksibel), consider it a match
            if (matchingWords.length >= Math.ceil(variasiWords.length * 0.4)) {
              return true;
            }
            
            // Also check reverse: product words matching variasi words
            const reverseMatching = productWords.filter(pw => 
              variasiWords.some(vw => {
                if (pw === vw) return true;
                if (pw.includes(vw) || vw.includes(pw)) return true;
                const minLen = Math.min(pw.length, vw.length);
                const maxLen = Math.max(pw.length, vw.length);
                if (minLen >= 3) {
                  let sameChars = 0;
                  for (let i = 0; i < minLen; i++) {
                    if (pw[i] === vw[i]) sameChars++;
                  }
                  if (sameChars / maxLen >= 0.7) return true;
                }
                return false;
              })
            );
            if (reverseMatching.length >= Math.ceil(productWords.length * 0.4)) {
              return true;
            }
          }
          
          // Remove common prefixes/suffixes and try again
          const removeCommonWords = (str: string) => {
            return str
              .replace(/\b(produk|product|item|barang|the|a|an)\b/gi, '')
              .replace(/\s+/g, ' ')
              .trim();
          };
          
          const cleanProductName = removeCommonWords(normalizedProductName);
          const cleanVariasiName = removeCommonWords(normalizedNamaVariasi);
          
          if (cleanProductName && cleanVariasiName) {
            if (cleanProductName === cleanVariasiName ||
                cleanProductName.includes(cleanVariasiName) ||
                cleanVariasiName.includes(cleanProductName)) {
              return true;
            }
          }
          
          return false;
        });

        if (!product) {
          // Log untuk debugging (hanya beberapa baris pertama yang tidak match)
          if (index < 10) {
            console.log(`❌ Product not found for: "${namaVariasi}" (normalized: "${normalizedNamaVariasi}")`);
            
            // Cari produk yang paling mirip untuk debugging
            const similarProducts = products
              .map(p => {
                const normalizedP = normalizeString(p.name);
                // Hitung similarity sederhana (jumlah karakter yang sama)
                let similarity = 0;
                const minLen = Math.min(normalizedNamaVariasi.length, normalizedP.length);
                for (let i = 0; i < minLen; i++) {
                  if (normalizedNamaVariasi[i] === normalizedP[i]) similarity++;
                }
                return { name: p.name, normalized: normalizedP, similarity: similarity / Math.max(normalizedNamaVariasi.length, normalizedP.length) };
              })
              .sort((a, b) => b.similarity - a.similarity)
              .slice(0, 5);
            
            console.log(`   Top 5 similar products:`, similarProducts.map(p => `"${p.name}" (${(p.similarity * 100).toFixed(1)}% similar)`));
          }
          
          // Log available products for debugging (first 5 only to avoid spam)
          const availableProducts = products.slice(0, 5).map(p => p.name).join(', ');
          errors.push(`Baris ${index + 2}: Produk "${namaVariasi}" tidak ditemukan. Produk tersedia: ${availableProducts}${products.length > 5 ? '...' : ''}`);
          
          // Save undetected product
          const undetected = {
            id: `undetected_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            productName: namaVariasi,
            storeId,
            storeName: store.name,
            rowNumber: index + 2,
            timestamp: new Date().toISOString(),
          };
          await addUndetectedProduct(undetected);
          
          continue;
        }

        // Log ketika produk match (hanya beberapa baris pertama)
        if (index < 3) {
          console.log(`✅ Product matched: "${product.name}" for CSV row: "${namaVariasi}"`);
          console.log(`   Data yang akan diambil:`, {
            jumlah: jumlah,
            harga: hargaSetelahDiskon,
            waktu: waktuPembayaran,
            orderId: orderId
          });
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

        // Helper function to parse number from Indonesian format
        // Handles: 27.000 -> 27000, 27.000,5 -> 27000.5, 27,5 -> 27.5
        const parseIndonesianNumber = (value: string | number): number => {
          if (!value) return 0;
          let str = value.toString().trim();
          
          // If contains comma, assume comma is decimal separator (Indonesian format)
          if (str.includes(',')) {
            // Remove all dots (thousand separators) and replace comma with dot
            str = str.replace(/\./g, '').replace(',', '.');
          } else {
            // No comma, remove all dots (all dots are thousand separators)
            str = str.replace(/\./g, '');
          }
          
          // Remove any remaining non-digit characters except minus and dot
          str = str.replace(/[^\d.-]/g, '');
          
          const parsed = parseFloat(str);
          return isNaN(parsed) ? 0 : parsed;
        };

        // Parse harga dan jumlah (handle Indonesian number format)
        const quantity = parseIndonesianNumber(jumlah);
        const price = parseIndonesianNumber(hargaSetelahDiskon);

        if (quantity <= 0) {
          errors.push(`Baris ${index + 2}: Jumlah harus lebih dari 0`);
          continue;
        }

        // CSV contains selling price (harga penjualan)
        // We need to determine the selling price for this sale
        let salePrice = price > 0 ? price : 0;
        
        // If CSV doesn't have price, we can't create a sale
        if (salePrice <= 0) {
          errors.push(`Baris ${index + 2}: Harga penjualan tidak valid atau tidak ada`);
          continue;
        }

        // Note: CSV contains SELLING PRICE (harga penjualan), not cost price (harga modal)
        // Cost price is updated separately through "Ubah Harga Modal" form
        // Mode 'purchase' for cost price means: update cost price when adding new stock,
        // not from sales CSV (which only contains selling price)

        // Ketika produk match, langsung ambil data dari CSV dan buat sale object
        const sale: Sale = {
          id: `sale_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
          storeId,
          productId: product.id,
          productName: product.name, // Gunakan nama produk dari database, bukan dari CSV
          quantity, // Jumlah dari CSV
          price: salePrice, // Harga dari CSV
          total: quantity * salePrice, // Total = jumlah × harga
          date, // Tanggal dari CSV (atau tanggal sekarang jika tidak ada)
          timestamp, // Timestamp dari CSV (atau sekarang jika tidak ada)
        };

        // Log untuk debugging (hanya beberapa baris pertama)
        if (index < 3) {
          console.log(`📦 Sale object created:`, {
            product: sale.productName,
            quantity: sale.quantity,
            price: sale.price,
            total: sale.total,
            date: sale.date,
            timestamp: sale.timestamp
          });
        }

        sales.push(sale);
      } catch (error) {
        errors.push(`Baris ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Log total sales yang berhasil dibuat
    console.log(`📊 Total sales created: ${sales.length} dari ${rows.length} baris`);

    // Helper function untuk normalize string (dipindahkan ke scope yang lebih tinggi)
    const normalizeString = (str: string): string => {
      if (!str) return '';
      return str.toString().trim().replace(/\s+/g, ' ').toLowerCase();
    };

    // Helper untuk get column value
    const getColumnValueFromRow = (row: any, variations: string[]): string => {
      for (const variation of variations) {
        if (row[variation] !== undefined && row[variation] !== null && row[variation] !== '') {
          return String(row[variation]);
        }
      }
      return '';
    };

    // Validasi stok - SEDERHANA: hanya cek stok saat ini, tidak perlu perhitungan tanggal
    const validatedSales: Sale[] = [];
    const productLocations = await getProductLocations();
    
    // Track total quantity yang dibutuhkan per produk untuk validasi
    const productQuantityNeeded = new Map<string, number>();
    const productQuantityByRow = new Map<string, Array<{ rowNumber: number; quantity: number; productName: string }>>();
    
    // Hitung total quantity yang dibutuhkan untuk setiap produk
    // Untuk gudang/toko, semua sales dari store yang sama menggunakan lokasi yang sama (storeId selalu null/undefined)
    // Jadi kita bisa langsung group by productId saja
    for (let idx = 0; idx < sales.length; idx++) {
      const sale = sales[idx];
      // Gunakan productId saja sebagai key karena untuk gudang/toko, storeId selalu null/undefined
      const key = sale.productId;
      const currentNeeded = productQuantityNeeded.get(key) || 0;
      productQuantityNeeded.set(key, currentNeeded + sale.quantity);
      
      // Track per baris untuk error message - cari row yang sesuai
      if (!productQuantityByRow.has(key)) {
        productQuantityByRow.set(key, []);
      }
      
      // Cari row number dengan mencocokkan nama produk
      let rowNumber = idx + 2; // Default ke index + 2 (karena header + 1-based)
      for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
        const row = rows[rowIdx];
        const namaVariasi = getColumnValueFromRow(row, ['Nama Variasi', 'Nama Produk', 'Product Name', 'productName', 'ProductName', 'Nama', 'nama', 'Name', 'name', 'Produk', 'produk']);
        if (normalizeString(namaVariasi) === normalizeString(sale.productName)) {
          rowNumber = rowIdx + 2;
          break;
        }
      }
      
      productQuantityByRow.get(key)!.push({ rowNumber, quantity: sale.quantity, productName: sale.productName });
    }

    // Validasi stok untuk setiap produk
    const productsWithoutStock = new Map<string, { productName: string; requiredQuantity: number; currentStock: number }>();
    
    console.log('🔍 Validating stock for products:', {
      stockLocation,
      stockStoreId,
      totalProductsToCheck: productQuantityNeeded.size,
      allProductLocations: productLocations.map(l => ({
        productId: l.productId,
        location: l.location,
        storeId: l.storeId,
        quantity: l.quantity
      }))
    });
    
    for (const [productId, totalNeeded] of productQuantityNeeded.entries()) {
      // Key sekarang langsung productId (tidak perlu parsing)
      
      // Cari stok saat ini di lokasi yang sesuai
      // Handle both null and undefined for storeId (null in DB becomes undefined after mapping)
      const currentLocation = productLocations.find(
        l => l.productId === productId && 
             l.location === stockLocation && 
             (l.storeId === stockStoreId || 
              (l.storeId === null && stockStoreId === undefined) ||
              (l.storeId === undefined && stockStoreId === undefined))
      );
      
      const currentStock = currentLocation?.quantity || 0;
      
      console.log(`📊 Stock check for product ${productId}:`, {
        productId,
        location: stockLocation,
        storeId: stockStoreId,
        currentStock,
        totalNeeded,
        found: currentLocation ? 'yes' : 'no',
        matchingLocations: productLocations.filter(l => l.productId === productId && l.location === stockLocation)
      });
      
      // Validasi: jika stok tidak cukup
      if (currentStock < totalNeeded) {
        const product = products.find(p => p.id === productId);
        const productName = product?.name || 'Unknown';
        const rows = productQuantityByRow.get(productId) || [];
        
        // Tambahkan error untuk setiap baris yang membutuhkan produk ini
        for (const row of rows) {
          errors.push(
            `Baris ${row.rowNumber}: Stok tidak cukup untuk produk "${productName}". ` +
            `Stok tersedia: ${currentStock}, Total yang dibutuhkan dari CSV: ${totalNeeded}. ` +
            `Baris ini membutuhkan: ${row.quantity}. ` +
            `⚠️ Silakan tambahkan minimal ${totalNeeded - currentStock} stok produk ini di ${stockLocation === 'gudang' ? 'gudang' : 'toko'} terlebih dahulu melalui menu "Tambah Stok Produk".`
          );
        }
        
        // Track untuk rekomendasi
        productsWithoutStock.set(productId, {
          productName,
          requiredQuantity: totalNeeded,
          currentStock
        });
      }
    }

    // Jika ada produk yang stoknya tidak cukup, jangan proses sales
    if (productsWithoutStock.size > 0) {
      console.log(`❌ Stock validation failed. Products without sufficient stock:`, Array.from(productsWithoutStock.values()));
      
      const stockRecommendations = Array.from(productsWithoutStock.values()).map(p => ({
        productName: p.productName,
        recommendedStock: p.requiredQuantity - p.currentStock,
        currentStock: p.currentStock,
        requiredStock: p.requiredQuantity,
        message: `Produk "${p.productName}": Stok saat ini ${p.currentStock}, dibutuhkan ${p.requiredQuantity}. Tambahkan minimal ${p.requiredQuantity - p.currentStock} stok di ${stockLocation === 'gudang' ? 'gudang' : 'toko'}.`
      }));

      const uploadHistory = {
        id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        storeId,
        storeName: store.name,
        fileName: file.name,
        fileType: isExcel ? 'Excel' : 'CSV',
        imported: 0,
        skipped: sales.length,
        totalRows: rows.length,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
      };
      await addSalesUploadHistory(uploadHistory);

      return NextResponse.json({
        success: false,
        error: `Stok tidak cukup untuk ${productsWithoutStock.size} produk. Silakan tambahkan stok terlebih dahulu.`,
        data: {
          imported: 0,
          errors: errors.length > 0 ? errors : undefined,
          totalRows: rows.length,
          skipped: sales.length,
          stockRecommendations: stockRecommendations.length > 0 ? stockRecommendations : undefined,
          message: `❌ Upload gagal! Stok tidak cukup untuk beberapa produk. ` +
                   `Total produk yang bermasalah: ${productsWithoutStock.size}. ` +
                   `Silakan tambahkan stok produk terlebih dahulu melalui menu "Tambah Stok Produk" di ${stockLocation === 'gudang' ? 'gudang' : 'toko'}.`
        },
      });
    }

    // Jika semua stok cukup, proses semua sales dan kurangi stok
    for (const sale of sales) {
      // Ambil stok saat ini
      // Handle both null and undefined for storeId (null in DB becomes undefined after mapping)
      const currentLocation = productLocations.find(
        l => l.productId === sale.productId && 
             l.location === stockLocation && 
             (l.storeId === stockStoreId || 
              (l.storeId === null && stockStoreId === undefined) ||
              (l.storeId === undefined && stockStoreId === undefined))
      );
      
      let currentStock = currentLocation?.quantity || 0;
      
      // Kurangi stok sesuai penjualan
      currentStock = Math.max(0, currentStock - sale.quantity);
      
      // Update location dengan stok terakhir
      await updateProductLocation(sale.productId, stockLocation, stockStoreId, currentStock);
      
      validatedSales.push(sale);
    }
    
    // Simpan sales setelah stok diupdate
    console.log(`💾 Saving ${validatedSales.length} validated sales to database...`);
    if (validatedSales.length > 0) {
      await addSales(validatedSales);
      console.log(`✅ Successfully saved ${validatedSales.length} sales`);
    } else {
      console.warn(`⚠️ No validated sales to save (all were skipped due to stock validation)`);
    }

    // Simpan history upload
    const uploadHistory = {
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      storeId,
      storeName: store.name,
      fileName: file.name,
      fileType: isExcel ? 'Excel' : 'CSV',
      imported: validatedSales.length,
      skipped: sales.length - validatedSales.length,
      totalRows: rows.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    };
    await addSalesUploadHistory(uploadHistory);

    return NextResponse.json({
      success: true,
      data: {
        imported: validatedSales.length,
        errors: errors.length > 0 ? errors : undefined,
        totalRows: rows.length,
        skipped: sales.length - validatedSales.length,
        message: validatedSales.length > 0
          ? `✅ Berhasil mengimport ${validatedSales.length} sales dari ${rows.length} baris.`
          : undefined
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
