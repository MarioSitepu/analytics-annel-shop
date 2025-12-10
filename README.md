# Annel Beauty Analytics

Sistem web lengkap untuk analisis dan manajemen penjualan produk kecantikan dengan dukungan multi-toko (offline dan online). Aplikasi ini menyediakan dashboard analytics real-time, manajemen produk dan stok, upload data penjualan dari CSV/Excel, serta tracking riwayat transaksi lengkap.

## 📋 Daftar Isi

- [Overview](#overview)
- [Fitur Utama](#fitur-utama)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Struktur Project](#struktur-project)
- [Database Schema](#database-schema)
- [Instalasi & Setup](#instalasi--setup)
- [API Endpoints](#api-endpoints)
- [Arsitektur Aplikasi](#arsitektur-aplikasi)
- [Cara Penggunaan](#cara-penggunaan)
- [Deployment](#deployment)
- [Development Guidelines](#development-guidelines)

## 🎯 Overview

**Annel Beauty Analytics** adalah sistem manajemen penjualan dan analitik yang dirancang khusus untuk bisnis kecantikan dengan dukungan:

- **Multi-Store Management**: Kelola toko offline dan online dalam satu platform
- **Real-time Analytics**: Dashboard dengan grafik interaktif untuk analisis penjualan
- **Stock Management**: Sistem manajemen stok dengan tracking lokasi (gudang/toko)
- **CSV/Excel Import**: Upload data penjualan dari file CSV atau Excel dengan validasi otomatis
- **Price History Tracking**: Riwayat perubahan harga modal dengan timestamp
- **Product Analytics**: Analisis mendalam per produk dengan grafik penjualan

## ✨ Fitur Utama

### 1. Dashboard Analytics
- **Total Penjualan**: Menampilkan total pendapatan dari semua penjualan
- **Total Keuntungan**: Perhitungan keuntungan berdasarkan harga modal dan harga jual
- **Jumlah Transaksi**: Total transaksi penjualan
- **Total Produk Terjual**: Jumlah unit produk yang terjual
- **Grafik Penjualan per Produk**: Bar chart pendapatan per produk
- **Grafik Penjualan per Toko**: Pie chart distribusi penjualan per toko
- **Tabel Detail**: Tabel lengkap penjualan produk dan toko dengan sorting

### 2. Manajemen Produk
- **Daftar Produk**: Tabel semua produk dengan informasi harga modal
- **Tambah Produk**: Form untuk menambahkan produk baru
- **Ubah Harga Modal**: 
  - Mode "Pada Tanggal": Update harga dengan timestamp tertentu
  - Mode "Setiap Pembelian": Update harga otomatis saat penambahan stok
- **Riwayat Harga**: Tracking semua perubahan harga modal
- **Product Analytics**: Modal dengan analytics per produk:
  - Total stok per lokasi
  - Total penjualan dan keuntungan
  - Grafik penjualan per tanggal
  - Grafik penjualan per toko

### 3. Manajemen Stok
- **Tambah Stok**: 
  - Tambah stok di gudang
  - Tambah stok di toko offline
  - Validasi stok sebelum penambahan
- **Kurangi Stok**: Form untuk mengurangi stok produk
- **Transfer Stok**:
  - Transfer dari gudang ke toko
  - Transfer dari toko ke gudang
  - Transfer antar toko offline
- **Tabel Lokasi Real-time**: Tabel produk dengan stok per lokasi (update setiap 5 detik)

### 4. Upload Data Penjualan
- **Multi-Format Support**: 
  - CSV (Comma Separated Values)
  - Excel (.xlsx, .xls)
- **Smart Product Matching**: 
  - Exact match
  - Partial match
  - Word-by-word match
  - Fuzzy matching dengan similarity check
- **Stock Validation**: Validasi stok sebelum import
- **Error Handling**: 
  - Tracking produk yang tidak terdeteksi
  - Error messages detail per baris
  - Rekomendasi stok yang dibutuhkan
- **Upload History**: Riwayat semua upload dengan detail:
  - Jumlah baris yang diimport
  - Jumlah yang di-skip
  - Error messages
  - Timestamp upload

### 5. Manajemen Toko
- **Tambah Toko**: 
  - Toko Offline: Nama, alamat
  - Toko Online: Nama, platform/URL
- **Daftar Toko**: Tabel semua toko dengan tipe dan informasi lengkap

### 6. History & Tracking
- **History Penambahan Stok**: Riwayat semua penambahan stok dengan timestamp
- **History Transfer**: Riwayat transfer produk antar lokasi
- **History Produk Tidak Terdeteksi**: Daftar produk dari CSV yang tidak match dengan database
- **Filter per Tanggal**: Filter history berdasarkan tanggal tertentu

### 7. Authentication & Security
- **Secure Authentication**: Sistem autentikasi dengan password hashing menggunakan bcrypt
- **Password Security**: Password di-hash dengan bcrypt (12 salt rounds)
- **Form Validation**: Validasi input menggunakan Zod schema validation
- **Rate Limiting**: Rate limiting dengan Upstash Redis (opsional, untuk production)
- **HTTPOnly Cookies**: Session token disimpan dalam HTTPOnly cookies untuk keamanan
- **Protected Routes**: Route protection untuk halaman yang memerlukan login
- **Input Validation**: Validasi semua input di frontend dan backend

## 🛠 Teknologi yang Digunakan

### Frontend
- **Next.js 16.0.8** - React framework dengan App Router
- **React 19.2.1** - UI library
- **TypeScript 5** - Type safety dan developer experience
- **Tailwind CSS 4** - Utility-first CSS framework
- **Recharts 2.12.7** - Library untuk grafik dan visualisasi data
- **Lucide React 0.469.0** - Icon library
- **date-fns 3.3.1** - Utility untuk manipulasi tanggal

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 5.20.0** - Next-generation ORM untuk database
- **PostgreSQL** - Relational database (via Supabase atau self-hosted)

### Security & Authentication
- **NextAuth.js 5.0.0-beta.25** - Authentication framework (prepared for future use)
- **bcrypt 5.1.1** - Password hashing dengan salt rounds
- **Zod 3.23.8** - Schema validation untuk form dan API
- **@upstash/ratelimit 1.1.2** - Rate limiting untuk API protection
- **@upstash/redis 1.35.0** - Redis client untuk rate limiting

### File Processing
- **PapaParse 5.4.1** - CSV parser
- **XLSX 0.18.5** - Excel file parser

### Development Tools
- **ESLint 9** - Linting tool
- **Babel React Compiler 1.0.0** - React compiler untuk optimasi

### Deployment
- **Docker** - Containerization
- **Vercel** - Platform deployment (recommended)
- **Supabase** - Database hosting (recommended)

## 📁 Struktur Project

```
annel-beauty-analytics/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   │   ├── login/route.ts
│   │   │   │   └── logout/route.ts
│   │   │   ├── dashboard/route.ts    # Dashboard data endpoint
│   │   │   ├── products/             # Product endpoints
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── analytics/route.ts
│   │   │   │   │   └── price/route.ts
│   │   │   │   ├── addition/route.ts
│   │   │   │   ├── database/route.ts
│   │   │   │   ├── history/route.ts
│   │   │   │   ├── location/route.ts
│   │   │   │   ├── reduction/route.ts
│   │   │   │   ├── transfer/route.ts
│   │   │   │   └── route.ts
│   │   │   ├── sales/               # Sales endpoints
│   │   │   │   └── upload/
│   │   │   │       ├── history/route.ts
│   │   │   │       └── route.ts
│   │   │   ├── stores/route.ts       # Store endpoints
│   │   │   └── history/route.ts     # History endpoint
│   │   ├── dashboard/               # Dashboard page
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── products/                # Product management pages
│   │   │   ├── add/                 # Add stock pages
│   │   │   │   ├── [location]/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── transfer/page.tsx    # Transfer stock page
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── upload-sales/             # Upload sales pages
│   │   │   ├── [type]/page.tsx
│   │   │   └── layout.tsx
│   │   ├── add-store/                # Add store pages
│   │   │   ├── [type]/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── database-barang/          # Product database page
│   │   ├── history/                  # History page
│   │   ├── login/                    # Login page
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Landing page
│   │   └── globals.css              # Global styles
│   ├── components/                   # React components
│   │   ├── Layout.tsx                # Main layout with sidebar
│   │   └── ProtectedRoute.tsx        # Route protection component
│   ├── lib/                          # Utility libraries
│   │   ├── db.ts                     # Prisma client instance
│   │   └── storage.ts                # Database operations (CRUD)
│   └── types/                        # TypeScript type definitions
│       └── index.ts
├── prisma/
│   └── schema.prisma                 # Prisma schema definition
├── public/                            # Static assets
├── data/                              # JSON data files (legacy/backup)
├── scripts/                           # Setup scripts
│   ├── setup-db.sh
│   ├── setup-db.ps1
│   ├── clean-dev.sh
│   └── clean-dev.ps1
├── docker-compose.yml                 # Docker Compose configuration
├── Dockerfile                         # Docker image definition
├── next.config.ts                     # Next.js configuration
├── tsconfig.json                      # TypeScript configuration
├── package.json                       # Dependencies and scripts
├── vercel.json                        # Vercel deployment config
└── env.example                        # Environment variables template
```

## 🗄 Database Schema

Aplikasi menggunakan **PostgreSQL** dengan schema berikut (didefinisikan di `prisma/schema.prisma`):

### Models

#### 1. Product
```prisma
model Product {
  id              String            @id @default(uuid())
  name            String
  sku             String?
  costPrice       Float             @default(0)
  sellingPrice    Float?
  priceUpdateMode String?           @default("date")
  createdAt       DateTime          @default(now())
  priceHistory    PriceHistory[]
  additions       ProductAddition[]
  locations       ProductLocation[]
  transfers       ProductTransfer[]
  sales           Sale[]
}
```

#### 2. PriceHistory
```prisma
model PriceHistory {
  id        String   @id @default(uuid())
  productId String
  price     Float
  timestamp DateTime
  type      String   @default("cost")  // "cost" atau "selling"
  product   Product  @relation(...)
}
```

#### 3. Store
```prisma
model Store {
  id            String               @id @default(uuid())
  name          String
  type          String               // "offline" atau "online"
  address       String?
  createdAt     DateTime             @default(now())
  additions     ProductAddition[]
  locations     ProductLocation[]
  transfersFrom ProductTransfer[]
  transfersTo   ProductTransfer[]
  sales         Sale[]
  uploadHistory SalesUploadHistory[]
}
```

#### 4. ProductLocation
```prisma
model ProductLocation {
  id        String  @id @default(uuid())
  productId String
  location  String  // "gudang" atau "toko"
  quantity  Int     @default(0)
  storeId   String?
  product   Product @relation(...)
  store     Store?  @relation(...)
  
  @@unique([productId, location, storeId])
}
```

#### 5. ProductTransfer
```prisma
model ProductTransfer {
  id           String   @id @default(uuid())
  productId    String
  fromLocation String
  toLocation   String
  fromStoreId  String?
  toStoreId   String?
  quantity     Int
  timestamp    DateTime @default(now())
  product      Product  @relation(...)
  fromStore    Store?   @relation(...)
  toStore      Store?   @relation(...)
}
```

#### 6. ProductAddition
```prisma
model ProductAddition {
  id        String   @id @default(uuid())
  productId String
  location  String
  storeId   String?
  quantity  Int
  timestamp DateTime @default(now())
  product   Product  @relation(...)
  store     Store?   @relation(...)
}
```

#### 7. Sale
```prisma
model Sale {
  id          String   @id @default(uuid())
  storeId     String
  productId   String
  productName String
  quantity    Int
  price       Float
  total       Float
  date        String
  timestamp   DateTime @default(now())
  product     Product  @relation(...)
  store       Store    @relation(...)
}
```

#### 8. UndetectedProduct
```prisma
model UndetectedProduct {
  id          String   @id @default(uuid())
  productName String
  storeId     String
  storeName   String
  rowNumber   Int
  timestamp   DateTime @default(now())
}
```

#### 9. SalesUploadHistory
```prisma
model SalesUploadHistory {
  id        String   @id @default(uuid())
  storeId   String
  storeName String
  fileName  String
  fileType  String
  imported  Int      @default(0)
  skipped   Int      @default(0)
  totalRows Int      @default(0)
  errors    String[]
  timestamp DateTime @default(now())
  store     Store    @relation(...)
}
```

#### 10. User
```prisma
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String   // Hashed password with bcrypt
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🚀 Instalasi & Setup

### Prerequisites
- Node.js 20+ 
- npm atau yarn
- PostgreSQL (atau akun Supabase)
- Git

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd annel-beauty-analytics
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Setup Database

#### Opsi A: Supabase (Recommended untuk Production)
1. Buat akun di [Supabase](https://supabase.com)
2. Buat project baru
3. Dapatkan connection string dari **Settings > Database > Connection string > URI**
4. Copy connection string ke file `.env`

#### Opsi B: Docker (Development)
```bash
docker-compose up -d postgres
```
Database akan tersedia di `localhost:5432`

#### Opsi C: PostgreSQL Lokal
1. Install PostgreSQL
2. Buat database: `createdb annel_beauty`
3. Update `DATABASE_URL` di `.env`

### Step 4: Environment Variables
Buat file `.env` di root project:
```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Rate Limiting (Optional - untuk production)
# Dapatkan dari: https://console.upstash.com/
# UPSTASH_REDIS_REST_URL="https://xxxxx.upstash.io"
# UPSTASH_REDIS_REST_TOKEN="your-token-here"
```

### Step 5: Database Migration
```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Atau push schema langsung (untuk development)
npm run db:push
```

### Step 6: Run Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### Step 7: Create User
Buat user pertama dengan menjalankan script:
```bash
npm run create-user
```

Script ini akan membuat user dengan kredensial:
- Username: `annelbeauty7`
- Password: `goannelbeauty12`

**Catatan**: Password disimpan dalam bentuk hashed menggunakan bcrypt untuk keamanan.

### Step 8: Login
Gunakan kredensial yang telah dibuat:
- Username: `annelbeauty7`
- Password: `goannelbeauty12`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Dashboard
- `GET /api/dashboard` - Get dashboard analytics data

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products` - Update product
- `GET /api/products/[id]/analytics` - Get product analytics
- `POST /api/products/[id]/price` - Update product price
- `GET /api/products/location` - Get product locations
- `POST /api/products/addition` - Add product stock
- `POST /api/products/reduction` - Reduce product stock
- `POST /api/products/transfer` - Transfer product stock
- `GET /api/products/history` - Get product history
- `GET /api/products/database` - Get products for database view

### Sales
- `POST /api/sales/upload` - Upload sales CSV/Excel
- `GET /api/sales/upload/history` - Get upload history

### Stores
- `GET /api/stores` - Get all stores
- `POST /api/stores` - Create new store

### History
- `GET /api/history` - Get history (transfers, additions) by date

## 🏗 Arsitektur Aplikasi

### Frontend Architecture
- **Next.js App Router**: File-based routing dengan server components
- **Client Components**: Komponen interaktif dengan `'use client'` directive
- **Server Components**: Komponen untuk data fetching di server
- **API Routes**: RESTful API endpoints untuk data operations

### Data Flow
1. **User Action** → Client Component
2. **API Call** → `/api/*` endpoint
3. **Business Logic** → `lib/storage.ts` functions
4. **Database** → Prisma ORM → PostgreSQL

### State Management
- **Local State**: React `useState` untuk component state
- **Server State**: Fetch data dari API routes
- **Session**: localStorage untuk authentication

### Database Layer
- **Prisma ORM**: Type-safe database access
- **Connection Pooling**: Optimized database connections
- **Transactions**: Atomic operations untuk data consistency

## 📖 Cara Penggunaan

### 1. Setup Awal
1. **Tambah Produk**: 
   - Navigasi ke "Kelola Produk"
   - Klik "Tambah Produk"
   - Isi nama produk dan harga modal awal
   
2. **Tambah Toko**:
   - Navigasi ke "Tambah Toko"
   - Pilih tipe toko (offline/online)
   - Isi informasi toko

3. **Set Harga Produk**:
   - Di halaman "Kelola Produk"
   - Klik icon "Ubah Harga" pada produk
   - Pilih mode update (tanggal/pembelian)
   - Masukkan harga baru

### 2. Manajemen Stok
1. **Tambah Stok**:
   - Navigasi ke "Tambah Produk" > Pilih lokasi (gudang/toko)
   - Pilih produk dan masukkan jumlah
   - Klik "Tambah Stok"

2. **Transfer Stok**:
   - Navigasi ke "Transfer Produk"
   - Pilih produk, lokasi asal, dan lokasi tujuan
   - Masukkan jumlah
   - Klik "Transfer"

### 3. Upload Penjualan
1. **Siapkan File CSV/Excel**:
   - Format: `Nama Variasi`, `Jumlah`, `Harga Setelah Diskon`, `Waktu Pembayaran Dilakukan`
   - Atau format fleksibel dengan kolom: `productName`, `quantity`, `price`, `date`

2. **Upload File**:
   - Navigasi ke "Upload Penjualan"
   - Pilih tipe toko (offline/online)
   - Pilih toko spesifik
   - Upload file CSV/Excel
   - Review hasil upload

3. **Handle Errors**:
   - Jika ada produk tidak terdeteksi, tambahkan produk di "Kelola Produk"
   - Jika stok tidak cukup, tambahkan stok terlebih dahulu

### 4. Analisis Data
1. **Dashboard**:
   - Lihat overview penjualan di halaman Dashboard
   - Grafik interaktif untuk analisis visual

2. **Product Analytics**:
   - Di halaman "Kelola Produk"
   - Klik icon analytics pada produk
   - Lihat detail analytics per produk

3. **History**:
   - Navigasi ke "History"
   - Pilih tanggal untuk melihat history transfer dan penambahan stok

## 🚢 Deployment

### Vercel (Recommended)
1. Push code ke GitHub
2. Import project di Vercel
3. Set environment variables:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy

### Docker
```bash
# Build image
docker build -t annel-beauty-analytics .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  annel-beauty-analytics
```

### Docker Compose
```bash
docker-compose up -d
```

Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk panduan lengkap.

## 💻 Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Naming**: 
  - Components: PascalCase
  - Functions: camelCase
  - Files: kebab-case untuk routes, PascalCase untuk components

### Best Practices
1. **KISS (Keep It Simple, Stupid)**: Kode sederhana dan mudah dipahami
2. **YAGNI (You Aren't Gonna Need It)**: Jangan tambahkan fitur yang tidak diperlukan
3. **DRY (Don't Repeat Yourself)**: Reuse code dan functions
4. **SOLID Principles**: 
   - Single Responsibility
   - Open/Closed
   - Liskov Substitution
   - Interface Segregation
   - Dependency Inversion

### Project Structure
- **Components**: Reusable UI components di `src/components/`
- **API Routes**: Business logic di `src/app/api/`
- **Database Operations**: CRUD functions di `src/lib/storage.ts`
- **Types**: TypeScript definitions di `src/types/`

### Testing
- Manual testing untuk semua fitur
- Validasi input di frontend dan backend
- Error handling yang comprehensive

### Performance
- **Server Components**: Untuk data fetching
- **Client Components**: Hanya untuk interaktif UI
- **Connection Pooling**: Untuk database connections
- **Caching**: Next.js automatic caching

## 📝 Format CSV/Excel

### Required Columns
- `Nama Variasi` atau `Nama Produk` atau `productName` - Nama produk
- `Jumlah` atau `quantity` - Jumlah unit
- `Harga Setelah Diskon` atau `price` - Harga per unit
- `Waktu Pembayaran Dilakukan` atau `date` - Tanggal penjualan

### Supported Formats
- **CSV**: Comma-separated, UTF-8 encoding
- **Excel**: .xlsx, .xls dengan worksheet "orders" atau sheet pertama

### Example CSV
```csv
Nama Variasi,Jumlah,Harga Setelah Diskon,Waktu Pembayaran Dilakukan
Produk A,5,50000,2025-12-05 14:20
Produk B,3,75000,2025-12-05 15:30
```

## 🔒 Security Notes

### Implemented Security Features
- **Password Hashing**: Password di-hash menggunakan bcrypt dengan 12 salt rounds
- **Form Validation**: Validasi input menggunakan Zod schema di frontend dan backend
- **Rate Limiting**: Rate limiting dengan Upstash Redis (5 requests per 15 menit per IP)
- **HTTPOnly Cookies**: Session token disimpan dalam HTTPOnly cookies untuk mencegah XSS
- **SQL Injection Protection**: Dilindungi oleh Prisma ORM dengan prepared statements
- **XSS Protection**: Dilindungi oleh React default escaping dan sanitization
- **Input Sanitization**: Semua input divalidasi dan disanitasi sebelum diproses

### Security Best Practices
- **Environment Variables**: Jangan commit `.env` file ke repository
- **Password Policy**: Gunakan password yang kuat (minimal 12 karakter)
- **HTTPS**: Selalu gunakan HTTPS di production
- **Session Management**: Session token expired setelah 7 hari
- **Rate Limiting**: Aktifkan rate limiting di production untuk mencegah brute force

### Future Enhancements
- **NextAuth.js Integration**: Untuk full session management dan OAuth support
- **2FA/MFA**: Two-factor authentication untuk keamanan tambahan
- **Audit Logging**: Logging semua aktivitas penting untuk audit

## 🐛 Troubleshooting

### Database Connection Issues
- Pastikan `DATABASE_URL` benar
- Untuk Supabase, gunakan connection pooling
- Check firewall settings

### Build Errors
- Pastikan Prisma Client sudah di-generate: `npm run db:generate`
- Clear `.next` folder: `npm run clean`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### CSV Upload Issues
- Pastikan format CSV sesuai
- Check console untuk error messages
- Validasi stok sebelum upload

## 📚 Dokumentasi Tambahan

- [SETUP_SUPABASE.md](./SETUP_SUPABASE.md) - Panduan setup Supabase
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Panduan deployment
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Troubleshooting guide
- [DATABASE_INFO.md](./DATABASE_INFO.md) - Informasi database

## 📄 License

Private project - All rights reserved

## 👥 Credits

Dikembangkan untuk **Annel Beauty** - Sistem Analytics & Manajemen Penjualan

---

**Version**: 0.1.0  
**Last Updated**: 2025
