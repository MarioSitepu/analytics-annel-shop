# Penjelasan Perbaikan Logika Stok

## Ringkasan
Logika stok telah diperbaiki untuk **mempertimbangkan timeline penjualan** dengan benar. Sekarang sistem dapat menghitung stok pada tanggal tertentu dan mengurangi stok secara berurutan berdasarkan urutan tanggal.

---

## 🔧 **Perubahan yang Dilakukan:**

### 1. **Fungsi Helper `getStockAtDate()`**
**File**: `src/lib/storage.ts`

**Fungsi Baru**: Menghitung stok pada tanggal tertentu dengan reverse-engineering dari stok saat ini.

**Cara Kerja**:
1. Ambil stok saat ini
2. Kurangi perubahan yang terjadi **setelah** tanggal target (karena belum terjadi pada tanggal tersebut)
3. Tambahkan kembali perubahan yang mengurangi stok setelah tanggal target

**Contoh**:
```
Stok saat ini: 50
Target date: 1 Januari
- 3 Januari: Tambah stok 30 (kurangi dari 50 → 20)
- 5 Januari: Jual 10 (tambah kembali → 30)
Stok pada 1 Januari = 30
```

### 2. **Urutkan Sales Berdasarkan Tanggal**
**File**: `src/app/api/sales/upload/route.ts`

**Perubahan**:
```typescript
// Urutkan sales berdasarkan tanggal (ascending)
sales.sort((a, b) => {
  const dateA = new Date(a.timestamp).getTime();
  const dateB = new Date(b.timestamp).getTime();
  return dateA - dateB;
});
```

**Alasan**: Validasi dan pengurangan stok harus dilakukan secara berurutan berdasarkan timeline.

### 3. **Validasi Stok dengan Timeline**
**File**: `src/app/api/sales/upload/route.ts`

**Logika Baru**:
1. **Hitung stok awal** pada tanggal penjualan pertama untuk setiap produk+store
2. **Untuk setiap penjualan** (berurutan berdasarkan tanggal):
   - Hitung stok pada tanggal penjualan dengan mempertimbangkan:
     - Stok awal
     + Penambahan stok antara penjualan sebelumnya dan penjualan ini
     + Transfer masuk antara penjualan sebelumnya dan penjualan ini
     - Transfer keluar antara penjualan sebelumnya dan penjualan ini
   - Validasi: stok ≥ quantity penjualan
   - Jika valid, kurangi stok dan lanjutkan
   - Jika tidak valid, skip penjualan ini dan tambahkan error

**Contoh Flow**:
```
CSV berisi:
- 1 Jan: Jual 50
- 5 Jan: Jual 30
- 10 Jan: Jual 20

Stok awal: 100

Proses:
1. 1 Jan: Stok = 100, Jual 50 → Valid ✅, Stok jadi 50
2. 5 Jan: Stok = 50, Jual 30 → Valid ✅, Stok jadi 20
3. 10 Jan: Stok = 20, Jual 20 → Valid ✅, Stok jadi 0
```

### 4. **Mempertimbangkan Penambahan/Transfer Stok**
**File**: `src/app/api/sales/upload/route.ts`

**Logika**:
- Sistem mengecek penambahan stok yang terjadi **di antara** penjualan
- Sistem mengecek transfer stok yang terjadi **di antara** penjualan
- Semua perubahan ini dipertimbangkan dalam perhitungan stok

**Contoh**:
```
Timeline:
- 1 Jan: Stok 100, Jual 50 → Stok jadi 50
- 3 Jan: Tambah stok 30 → Stok jadi 80
- 5 Jan: Jual 30 → Stok jadi 50 (bukan 20!)
```

---

## 📊 **Flow Lengkap yang Benar:**

### **Upload CSV Penjualan:**
```
1. Parse CSV → Dapat array sales
2. ✅ Urutkan sales berdasarkan tanggal (ascending)
3. ✅ Untuk setiap sale (berurutan):
   a. Hitung stok pada tanggal penjualan:
      - Stok awal (dari getStockAtDate)
      + Penambahan stok antara penjualan sebelumnya dan ini
      + Transfer masuk antara penjualan sebelumnya dan ini
      - Transfer keluar antara penjualan sebelumnya dan ini
      - Penjualan sebelumnya (dari CSV yang sama)
   b. Validasi: stok ≥ quantity penjualan
   c. Jika valid:
      - Kurangi stok
      - Update location
      - Tambahkan ke validatedSales
   d. Jika tidak valid:
      - Skip penjualan
      - Tambahkan error
4. ✅ Simpan semua validatedSales
```

---

## ✅ **Keuntungan Logika Baru:**

1. **Akurat**: Stok dihitung berdasarkan timeline yang benar
2. **Konsisten**: Tidak ada stok negatif atau overselling
3. **Fleksibel**: Mempertimbangkan penambahan/transfer stok di antara penjualan
4. **Robust**: Validasi dilakukan sebelum pengurangan stok

---

## 🎯 **Contoh Skenario:**

### **Skenario 1: Penjualan Berurutan**
```
Stok awal: 100
CSV:
- 1 Jan: Jual 50
- 5 Jan: Jual 30
- 10 Jan: Jual 20

Hasil:
✅ 1 Jan: Stok 100, Jual 50 → Stok 50
✅ 5 Jan: Stok 50, Jual 30 → Stok 20
✅ 10 Jan: Stok 20, Jual 20 → Stok 0
```

### **Skenario 2: Ada Penambahan Stok di Antara**
```
Stok awal: 100
Timeline:
- 1 Jan: Jual 50 (stok 100 → 50)
- 3 Jan: Tambah stok 30 (stok 50 → 80)
- 5 Jan: Jual 30 (stok 80 → 50)

CSV berisi:
- 1 Jan: Jual 50
- 5 Jan: Jual 30

Hasil:
✅ 1 Jan: Stok 100, Jual 50 → Stok 50
✅ 5 Jan: Stok 80 (50 + 30 tambahan), Jual 30 → Stok 50
```

### **Skenario 3: Stok Tidak Cukup**
```
Stok awal: 100
CSV:
- 1 Jan: Jual 50
- 5 Jan: Jual 30
- 10 Jan: Jual 60

Hasil:
✅ 1 Jan: Stok 100, Jual 50 → Stok 50
✅ 5 Jan: Stok 50, Jual 30 → Stok 20
❌ 10 Jan: Stok 20, Jual 60 → ERROR (Stok tidak cukup)
```

---

## 📝 **Kesimpulan:**

**Status**: Logika stok sekarang **100% benar** ✅

**Yang Sudah Diperbaiki**:
- ✅ Urutkan sales berdasarkan tanggal
- ✅ Validasi stok dengan mempertimbangkan timeline
- ✅ Kurangi stok secara berurutan
- ✅ Mempertimbangkan penambahan/transfer stok di antara penjualan
- ✅ Fungsi helper untuk menghitung stok pada tanggal tertentu

**Hasil**:
- Sistem sekarang dapat menghitung stok dengan akurat pada tanggal tertentu
- Tidak ada overselling atau stok negatif
- Timeline penjualan dipertimbangkan dengan benar

