# Analisis Perbandingan Diagram Mermaid dengan Implementasi Web

## Ringkasan
Diagram Mermaid yang diberikan **BELUM SELURUHNYA SESUAI** dengan implementasi web. Ada beberapa perbedaan penting yang perlu diperhatikan.

---

## Perbandingan Detail

### ✅ **State yang Sesuai:**

1. **Idle → InputPenjualan**
   - ✅ **Sesuai**: Halaman `/upload-sales/[type]/page.tsx` memungkinkan owner input data penjualan (offline/online)
   - Implementasi: User memilih jenis toko (offline/online), memilih toko spesifik, dan upload file CSV/Excel

2. **InputPenjualan → ValidasiData**
   - ✅ **Sesuai**: Setelah submit, data divalidasi di `/api/sales/upload/route.ts`
   - Validasi mencakup:
     - Cek file dan storeId
     - Validasi nama produk
     - Validasi quantity dan price
     - Parsing tanggal dan waktu

3. **ValidasiData → ErrorData**
   - ✅ **Sesuai**: Jika data tidak valid, error dikembalikan dan ditampilkan
   - Error ditampilkan di halaman upload dengan daftar error per baris

4. **ErrorData → InputPenjualan**
   - ✅ **Sesuai**: User dapat memperbaiki data dan submit ulang
   - File input dapat diubah dan di-upload kembali

5. **ValidasiData → SimpanHistori**
   - ✅ **Sesuai**: Jika data valid, sales disimpan via `addSales(sales)`
   - Data disimpan ke `sales.json`

6. **MenungguPermintaanLaporan → GenLapPenjualan**
   - ✅ **Sesuai**: Dashboard (`/dashboard/page.tsx`) menampilkan laporan penjualan harian
   - User memilih tanggal dan sistem menampilkan:
     - Total penjualan
     - Total keuntungan
     - Penjualan per produk
     - Penjualan per toko

7. **GenLapPenjualan → TampilLaporan**
   - ✅ **Sesuai**: Laporan ditampilkan di dashboard dengan grafik dan tabel

8. **TampilLaporan → Idle**
   - ✅ **Sesuai**: Setelah laporan ditampilkan, user kembali ke state idle

---

### ❌ **State yang TIDAK Sesuai / Missing:**

1. **ValidasiData → UpdateStok**
   - ❌ **TIDAK ADA**: Setelah data valid, **STOK TIDAK OTOMATIS DIUPDATE**
   - **Masalah**: Di `src/app/api/sales/upload/route.ts` baris 189-191, hanya `addSales(sales)` yang dipanggil
   - **Tidak ada** pemanggilan `updateProductLocation()` untuk mengurangi stok
   - **Dampak**: Stok tidak berkurang otomatis saat penjualan terjadi

2. **UpdateStok → SimpanHistori**
   - ❌ **TIDAK RELEVAN**: Karena UpdateStok tidak ada, transisi ini juga tidak ada

3. **SimpanHistori → MenungguPermintaanLaporan**
   - ⚠️ **TIDAK EKSPLISIT**: Tidak ada state khusus "MenungguPermintaanLaporan"
   - Setelah transaksi tersimpan, user langsung bisa akses dashboard kapan saja
   - Tidak ada mekanisme "menunggu" - user langsung bisa request laporan

4. **MenungguPermintaanLaporan → GenLapStok**
   - ⚠️ **PARTIAL**: Ada informasi stok di `/products/add/[location]/page.tsx` tapi:
     - Bukan laporan stok khusus
     - Hanya tampilan real-time stok per lokasi
     - Tidak ada halaman khusus "Laporan Stok" seperti laporan penjualan

5. **GenLapStok → TampilLaporan**
   - ⚠️ **PARTIAL**: Stok ditampilkan tapi bukan dalam format laporan yang sama dengan penjualan

---

## Rekomendasi Perbaikan

### 1. **TAMBAHKAN UpdateStok setelah ValidasiData**
   ```typescript
   // Di src/app/api/sales/upload/route.ts setelah baris 183
   // Setelah sales.push(sale), tambahkan:
   // Update stock untuk setiap sale
   const currentLocation = getProductLocations().find(
     l => l.productId === product.id && 
          l.location === 'toko' && 
          l.storeId === storeId
   );
   if (currentLocation) {
     const newQuantity = Math.max(0, currentLocation.quantity - quantity);
     updateProductLocation(product.id, 'toko', storeId, newQuantity);
   }
   ```

### 2. **TAMBAHKAN Halaman Laporan Stok Khusus**
   - Buat halaman `/reports/stock` atau tambahkan tab di dashboard
   - Tampilkan stok per produk, per lokasi (gudang/toko), per toko
   - Bisa filter berdasarkan tanggal (stok pada tanggal tertentu)

### 3. **PERBAIKI Diagram Mermaid**
   Diagram yang lebih sesuai:
   ```mermaid
   stateDiagram-v2
       [*] --> Idle
       
       Idle --> InputPenjualan : Owner input data penjualan\n(offline/online)
       InputPenjualan --> ValidasiData : submit transaksi
       
       ValidasiData --> ErrorData : data tidak valid
       ErrorData --> InputPenjualan : perbaiki & submit ulang
       
       ValidasiData --> UpdateStok : data valid
       UpdateStok --> SimpanHistori : stok terupdate
       SimpanHistori --> Idle : transaksi tersimpan
       
       Idle --> GenLapPenjualan : minta laporan penjualan harian
       Idle --> GenLapStok : minta laporan stok
       
       GenLapPenjualan --> TampilLaporan : laporan penjualan siap
       GenLapStok --> TampilLaporan : laporan stok siap
       
       TampilLaporan --> Idle : laporan selesai ditampilkan
   ```

---

## Kesimpulan

**Status**: Diagram **70% sesuai** dengan implementasi web

**Masalah Utama**:
1. ❌ **UpdateStok tidak diimplementasikan** - ini adalah bug kritis
2. ⚠️ **Laporan Stok tidak ada halaman khusus** - hanya tampilan real-time
3. ⚠️ **State "MenungguPermintaanLaporan" tidak eksplisit** - langsung ke Idle

**Yang Sudah Benar**:
- ✅ Flow input dan validasi data penjualan
- ✅ Error handling dan perbaikan data
- ✅ Penyimpanan transaksi
- ✅ Laporan penjualan harian

**Action Items**:
1. Implementasikan UpdateStok setelah validasi data
2. Buat halaman laporan stok khusus
3. Update diagram Mermaid sesuai implementasi yang benar

