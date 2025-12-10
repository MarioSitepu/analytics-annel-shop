# Analisis Logika Perubahan

## Ringkasan
Perubahan yang dilakukan **BELUM SELURUHNYA SESUAI** dengan logika bisnis yang benar. Ada beberapa masalah penting yang perlu diperbaiki.

---

## ✅ **Yang Sudah Benar:**

### 1. **Reset Stok Menjadi 0**
✅ **Benar**: Sesuai permintaan user untuk memulai dari awal

### 2. **Validasi Tanggal Tidak Boleh Lebih dari Hari Ini**
✅ **Benar**: 
- Mencegah user menambahkan stok untuk masa depan
- Validasi di frontend dan backend
- Logika: "Tidak bisa menambahkan stok untuk hari yang belum dimulai"

### 3. **Stok Berkurang Saat Upload CSV**
✅ **Benar**: 
- Stok sekarang dikurangi saat penjualan
- Ada validasi stok sebelum membuat sale

---

## ❌ **Masalah Logika yang Ditemukan:**

### 1. **Validasi Stok Tidak Mempertimbangkan Timeline** ⚠️ **KRITIS**

**Masalah**:nakan **stok saat ini**, bukan stok pada tanggal penjualan
- Jika CSV berisi penju
- Validasi stok menggualan dari beberapa hari berbeda, logika menjadi salah

**Contoh Masalah**:
```
Situasi:
- Stok awal: 100
- CSV berisi:
  * 1 Januari: Jual 50
  * 5 Januari: Jual 30
  * 10 Januari: Jual 20

Logika Saat Ini (SALAH):
1. Cek stok saat ini = 100
2. Validasi: 50 + 30 + 20 = 100 ✅ (cukup)
3. Kurangi semua sekaligus: 100 - 100 = 0

Logika yang Benar:
1. 1 Jan: Stok 100, Jual 50 → Stok jadi 50
2. 5 Jan: Stok 50, Jual 30 → Stok jadi 20
3. 10 Jan: Stok 20, Jual 20 → Stok jadi 0
```

**Kode Saat Ini**:
```typescript
// Validasi stok sebelum membuat sale
const locations = getProductLocations();  // ❌ Ambil stok saat ini
const currentLocation = locations.find(...);

if (currentLocation.quantity < quantity) {  // ❌ Cek berdasarkan stok saat ini
  errors.push(...);
  return;
}
```

**Seharusnya**:
```typescript
// Urutkan sales berdasarkan tanggal
sales.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

// Simulasi timeline untuk validasi
let simulatedStock = currentLocation.quantity;
for (const sale of sales) {
  // Cek apakah ada penambahan stok sebelum tanggal penjualan ini
  const additionsBeforeSale = getAdditionsBeforeDate(sale.date, sale.productId, sale.storeId);
  simulatedStock += additionsBeforeSale;
  
  if (simulatedStock < sale.quantity) {
    errors.push(`Stok tidak cukup pada tanggal ${sale.date}`);
    return;
  }
  
  simulatedStock -= sale.quantity;
}
```

### 2. **Pengurangan Stok Tidak Mempertimbangkan Urutan Tanggal** ⚠️ **PENTING**

**Masalah**:
- Semua penjualan dikurangi sekaligus tanpa mempertimbangkan urutan tanggal
- Seharusnya diurutkan berdasarkan tanggal dulu, baru dikurangi secara berurutan

**Kode Saat Ini**:
```typescript
sales.forEach(sale => {
  const newQuantity = Math.max(0, currentLocation.quantity - sale.quantity);
  updateProductLocation(...);  // ❌ Semua dikurangi sekaligus
});
```

**Seharusnya**:
```typescript
// Urutkan berdasarkan tanggal
sales.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

// Kurangi secara berurutan
let currentStock = currentLocation.quantity;
sales.forEach(sale => {
  // Tambahkan stok yang ditambahkan sebelum tanggal penjualan ini
  const additions = getAdditionsBetweenDates(lastProcessedDate, sale.date, sale.productId, sale.storeId);
  currentStock += additions;
  
  currentStock = Math.max(0, currentStock - sale.quantity);
  updateProductLocation(sale.productId, 'toko', sale.storeId, currentStock);
  lastProcessedDate = sale.date;
});
```

### 3. **Tidak Mempertimbangkan Penambahan Stok di Antara Penjualan** ⚠️ **PENTING**

**Masalah**:
- Jika ada penambahan stok di antara penjualan, tidak dipertimbangkan
- Contoh: 
  - 1 Jan: Jual 50 (stok 100 → 50)
  - 3 Jan: Tambah stok 30 (stok 50 → 80)
  - 5 Jan: Jual 30 (stok seharusnya 80 → 50, bukan 50 → 20)

**Solusi**:
- Perlu query penambahan stok berdasarkan tanggal
- Perlu query transfer stok berdasarkan tanggal
- Simulasi timeline lengkap sebelum validasi

---

## 📊 **Flow yang Benar:**

### **Upload CSV Penjualan:**
```
1. Parse CSV → Dapat array sales
2. ✅ Urutkan sales berdasarkan tanggal (ascending)
3. ✅ Untuk setiap sale:
   a. Hitung stok pada tanggal penjualan:
      - Stok awal
      + Penambahan stok sebelum tanggal ini
      + Transfer masuk sebelum tanggal ini
      - Penjualan sebelum tanggal ini
      - Transfer keluar sebelum tanggal ini
   b. Validasi: stok pada tanggal ≥ quantity penjualan
   c. Jika valid, tambahkan ke array sales valid
4. ✅ Jika semua valid, proses pengurangan stok secara berurutan:
   - Untuk setiap sale (urut tanggal):
     a. Update stok dengan mempertimbangkan penambahan/transfer
     b. Kurangi stok sesuai penjualan
5. ✅ Simpan semua sales
```

---

## 🔧 **Rekomendasi Perbaikan:**

### **Priority 1 (Kritis):**
1. ✅ **Urutkan sales berdasarkan tanggal sebelum validasi**
2. ✅ **Simulasi timeline untuk validasi stok**
3. ✅ **Kurangi stok secara berurutan berdasarkan tanggal**

### **Priority 2 (Penting):**
4. ✅ **Pertimbangkan penambahan stok di antara penjualan**
5. ✅ **Pertimbangkan transfer stok di antara penjualan**
6. ✅ **Buat fungsi helper untuk menghitung stok pada tanggal tertentu**

### **Priority 3 (Nice to have):**
7. ✅ **Tambahkan rollback jika ada error di tengah proses**
8. ✅ **Tambahkan logging untuk tracking perubahan stok**

---

## 📝 **Kesimpulan:**

**Status**: Logika perubahan **60% benar**

**Yang Sudah Benar**:
- ✅ Reset stok
- ✅ Validasi tanggal
- ✅ Stok berkurang (tapi tidak mempertimbangkan timeline)

**Masalah Utama**:
- ❌ **Tidak mempertimbangkan timeline penjualan** - Validasi dan pengurangan stok harus berdasarkan urutan tanggal
- ❌ **Tidak mempertimbangkan penambahan/transfer stok di antara penjualan**
- ⚠️ **Semua penjualan dikurangi sekaligus** - Seharusnya berurutan berdasarkan tanggal

**Action Required**:
1. Urutkan sales berdasarkan tanggal
2. Simulasi timeline untuk validasi
3. Kurangi stok secara berurutan dengan mempertimbangkan penambahan/transfer

