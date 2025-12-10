# Beauty Analytics - Sistem Manajemen Penjualan

Sistem web lengkap untuk analisis dan manajemen penjualan toko offline dan online dengan fitur dashboard, manajemen produk, transfer stok, dan upload data penjualan dari CSV.

## Fitur Utama

### 1. Dashboard
- Analisis penjualan berdasarkan tanggal yang dipilih
- Total penjualan dan total keuntungan
- Grafik penjualan per produk dan per toko
- Data dari CSV toko offline dan gudang untuk 1 hari yang dipilih

### 2. Kelola Produk
- Tambah produk baru
- Edit informasi produk
- Ubah harga dengan timestamp (otomatis mendeteksi tanggal pembelian dari CSV dan mengubah harga sesuai waktu)
- Riwayat perubahan harga

### 3. Transfer & Tambah Produk
- Transfer produk antara gudang dan toko
- Transfer produk antar toko
- Tambah stok produk di gudang atau toko
- Tabel lokasi produk real-time

### 4. Upload Penjualan
- Pilih jenis toko (offline/online)
- Pilih toko spesifik
- Upload file CSV penjualan
- Format CSV: `productName, quantity, price, date, time` (opsional)

### 5. Tambah Toko
- Tambah toko offline dengan alamat
- Tambah toko online dengan URL/platform
- Toko otomatis muncul di dropdown pilihan

### 6. History
- History transfer produk per tanggal
- History penambahan stok per tanggal
- Filter berdasarkan tanggal yang dipilih

## Teknologi

- **Next.js 16** - Framework React dengan App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Grafik dan visualisasi data
- **PapaParse** - Parser CSV
- **date-fns** - Manipulasi tanggal
- **Lucide React** - Icons

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Jalankan development server:
```bash
npm run dev
```

3. Buka browser di `http://localhost:3000`

## Struktur Data

Data disimpan dalam folder `data/` sebagai file JSON:
- `products.json` - Data produk
- `stores.json` - Data toko
- `productLocations.json` - Lokasi dan stok produk
- `productTransfers.json` - History transfer
- `productAdditions.json` - History penambahan stok
- `sales.json` - Data penjualan

## Format CSV Penjualan

File CSV harus memiliki header dan kolom berikut:
- `productName` atau `Nama Produk` - Nama produk
- `quantity` atau `Jumlah` - Jumlah barang
- `price` atau `Harga` - Harga per item (opsional, akan menggunakan harga produk jika tidak ada)
- `date` atau `Tanggal` - Tanggal penjualan (format: YYYY-MM-DD)
- `time` atau `Waktu` - Waktu penjualan (opsional, format: HH:mm)

Contoh:
```csv
productName,quantity,price,date,time
Produk A,5,50000,2025-12-05,14:20
Produk B,3,75000,2025-12-05,15:30
```

## Cara Menggunakan

1. **Setup Awal:**
   - Tambah produk di menu "Kelola Produk"
   - Tambah toko di menu "Tambah Toko"
   - Set harga produk (akan digunakan untuk perhitungan jika CSV tidak memiliki kolom harga)

2. **Upload Penjualan:**
   - Pilih menu "Upload Penjualan"
   - Pilih jenis toko (offline/online)
   - Pilih toko spesifik
   - Upload file CSV

3. **Lihat Dashboard:**
   - Pilih tanggal di kalender
   - Lihat analisis penjualan untuk tanggal tersebut

4. **Kelola Stok:**
   - Gunakan menu "Transfer Produk" untuk memindahkan barang
   - Gunakan tab "Tambah Stok" untuk menambah stok baru

5. **Lihat History:**
   - Pilih tanggal di menu "History"
   - Lihat transfer dan penambahan stok untuk tanggal tersebut

## Catatan Penting

- Sistem otomatis mendeteksi tanggal pembelian dari CSV dan menggunakan harga yang berlaku pada waktu tersebut
- Perubahan harga disimpan dengan timestamp dan akan berlaku mulai waktu tersebut
- Data disimpan dalam file JSON lokal (dapat diganti dengan database untuk production)
