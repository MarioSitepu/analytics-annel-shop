# Analisis Logika Stok

## Ringkasan
Logika stok **BELUM SELURUHNYA BENAR**. Ada beberapa masalah kritis yang perlu diperbaiki.

---

## ✅ **Logika yang SUDAH BENAR:**

### 1. **Penambahan Stok (Addition)**
**File**: `src/app/api/products/addition/route.ts`

✅ **Benar**:
- Stok ditambahkan ke location yang dipilih (gudang/toko)
- Jika location sudah ada, stok ditambahkan ke stok existing
- Jika location belum ada, stok baru dibuat
- Timestamp bisa custom untuk gudang

```typescript
const existingLocation = locations.find(...);
const newQuantity = existingLocation ? existingLocation.quantity + quantity : quantity;
updateProductLocation(productId, location, storeId, newQuantity);
```

### 2. **Transfer Stok**
**File**: `src/app/api/products/transfer/route.ts`

✅ **Benar**:
- Mengecek apakah source location punya cukup stok
- Mengurangi stok dari source location
- Menambah stok ke destination location
- Validasi stok sebelum transfer

```typescript
if (!sourceLocation || sourceLocation.quantity < quantity) {
  return NextResponse.json({ success: false, error: 'Insufficient quantity in source location' }, { status: 400 });
}
updateProductLocation(productId, fromLocation, fromStoreId, sourceLocation.quantity - quantity);
updateProductLocation(productId, toLocation, toStoreId, destQuantity);
```

---

## ❌ **Logika yang SALAH / MISSING:**

### 1. **PENJUALAN TIDAK MENGURANGI STOK** ⚠️ **KRITIS**
**File**: `src/app/api/sales/upload/route.ts`

❌ **Masalah**:
- Setelah sales dibuat dan disimpan, **STOK TIDAK DIKURANGI**
- Baris 189-191 hanya memanggil `addSales(sales)`, tidak ada update stok
- Dampak: Stok di toko tidak berkurang meskipun sudah terjual

**Kode saat ini**:
```typescript
if (sales.length > 0) {
  addSales(sales);  // ❌ Hanya menyimpan sales, tidak mengurangi stok
}
```

**Seharusnya**:
```typescript
if (sales.length > 0) {
  // Update stock untuk setiap sale
  const locations = getProductLocations();
  sales.forEach(sale => {
    const currentLocation = locations.find(
      l => l.productId === sale.productId && 
           l.location === 'toko' && 
           l.storeId === sale.storeId
    );
    
    if (currentLocation) {
      if (currentLocation.quantity < sale.quantity) {
        errors.push(`Stok tidak cukup untuk produk ${sale.productName} di toko`);
        return; // Skip sale ini
      }
      const newQuantity = currentLocation.quantity - sale.quantity;
      updateProductLocation(sale.productId, 'toko', sale.storeId, newQuantity);
    } else {
      errors.push(`Stok tidak ditemukan untuk produk ${sale.productName} di toko`);
    }
  });
  
  addSales(sales);
}
```

### 2. **TIDAK ADA VALIDASI STOK SEBELUM PENJUALAN** ⚠️ **PENTING**
**File**: `src/app/api/sales/upload/route.ts`

❌ **Masalah**:
- Tidak ada pengecekan apakah stok cukup sebelum membuat sale
- Bisa terjadi penjualan melebihi stok yang ada
- Tidak ada error handling untuk stok tidak cukup

**Seharusnya**:
```typescript
// Sebelum membuat sale, cek stok
const locations = getProductLocations();
const currentLocation = locations.find(
  l => l.productId === product.id && 
       l.location === 'toko' && 
       l.storeId === storeId
);

if (!currentLocation || currentLocation.quantity < quantity) {
  errors.push(`Baris ${index + 2}: Stok tidak cukup untuk produk "${namaVariasi}" (Stok tersedia: ${currentLocation?.quantity || 0})`);
  return;
}
```

### 3. **TIDAK ADA HANDLING UNTUK STOK NEGATIF**
❌ **Masalah**:
- Tidak ada proteksi untuk mencegah stok menjadi negatif
- Jika ada bug atau race condition, stok bisa menjadi negatif

**Seharusnya**:
```typescript
const newQuantity = Math.max(0, currentLocation.quantity - sale.quantity);
updateProductLocation(sale.productId, 'toko', sale.storeId, newQuantity);
```

---

## 📊 **Flow Stok yang Benar:**

### **Penambahan Stok:**
```
User Input → Validasi → Tambah Stok → Update Location → Simpan History
✅ Sudah benar
```

### **Transfer Stok:**
```
User Input → Validasi Stok Cukup → Kurangi Source → Tambah Destination → Simpan History
✅ Sudah benar
```

### **Penjualan:**
```
User Upload CSV → Validasi Data → ❌ CEK STOK CUKUP → ❌ KURANGI STOK → Simpan Sales
❌ Masih salah - tidak ada cek stok dan tidak mengurangi stok
```

---

## 🔧 **Rekomendasi Perbaikan:**

### **Priority 1 (Kritis):**
1. ✅ **Tambahkan pengurangan stok saat penjualan**
   - Update `src/app/api/sales/upload/route.ts`
   - Kurangi stok dari toko setelah validasi data

2. ✅ **Tambahkan validasi stok sebelum penjualan**
   - Cek stok cukup sebelum membuat sale
   - Return error jika stok tidak cukup

### **Priority 2 (Penting):**
3. ✅ **Tambahkan proteksi stok negatif**
   - Gunakan `Math.max(0, quantity)` untuk mencegah stok negatif
   - Tambahkan logging untuk tracking

4. ✅ **Tambahkan rollback mechanism**
   - Jika ada error saat batch upload, rollback semua perubahan stok
   - Atau gunakan transaction-like pattern

### **Priority 3 (Nice to have):**
5. ✅ **Tambahkan warning untuk stok rendah**
   - Alert jika stok di bawah threshold tertentu
   - Notifikasi untuk restock

---

## 📝 **Kesimpulan:**

**Status**: Logika stok **70% benar**

**Masalah Utama**:
1. ❌ **Penjualan tidak mengurangi stok** - Bug kritis
2. ❌ **Tidak ada validasi stok sebelum penjualan** - Bisa terjadi overselling
3. ⚠️ **Tidak ada proteksi stok negatif** - Potensi bug

**Yang Sudah Benar**:
- ✅ Penambahan stok
- ✅ Transfer stok dengan validasi
- ✅ Update location quantity

**Action Required**:
1. Fix penjualan untuk mengurangi stok
2. Tambahkan validasi stok sebelum penjualan
3. Tambahkan proteksi stok negatif

