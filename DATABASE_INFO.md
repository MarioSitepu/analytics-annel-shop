# Informasi Database

## Dimana Database Dibuat?

Database **PostgreSQL** dibuat di lokasi yang berbeda tergantung environment:

### 1. Development (Lokal)

#### Menggunakan Docker (Recommended)
- **Lokasi**: Container Docker lokal
- **Host**: `localhost`
- **Port**: `5432`
- **Database Name**: `annel_beauty`
- **User**: `postgres`
- **Password**: `postgres`

Database dibuat otomatis saat menjalankan:
```bash
docker-compose up -d postgres
```

#### Menggunakan PostgreSQL Lokal
- **Lokasi**: PostgreSQL yang terinstall di komputer Anda
- **Host**: `localhost`
- **Port**: `5432` (default)
- **Database Name**: `annel_beauty` (harus dibuat manual)
- **User**: User PostgreSQL Anda
- **Password**: Password PostgreSQL Anda

Database harus dibuat manual:
```sql
CREATE DATABASE annel_beauty;
```

### 2. Production

Database dibuat di platform cloud yang Anda pilih:

#### Vercel Postgres
- **Lokasi**: Vercel's managed PostgreSQL
- **Host**: Disediakan oleh Vercel
- **Connection String**: Disediakan di Vercel dashboard
- Database dibuat otomatis saat membuat Vercel Postgres service

#### Supabase
- **Lokasi**: Supabase cloud
- **Host**: `*.supabase.co`
- **Connection String**: Disediakan di Supabase dashboard
- Database dibuat otomatis saat membuat project

#### Railway / Render / Platform Lain
- **Lokasi**: Platform cloud yang dipilih
- **Host**: Disediakan oleh platform
- **Connection String**: Disediakan di platform dashboard
- Database dibuat otomatis saat membuat PostgreSQL service

## Bagaimana Database Dibuat?

### 1. Schema Database

Schema database didefinisikan di file `prisma/schema.prisma`. File ini berisi:
- Definisi semua tabel (models)
- Relasi antar tabel
- Index dan constraint

### 2. Migrasi Database

Database dibuat melalui **Prisma Migrations**:

```bash
# Generate Prisma Client
npm run db:generate

# Buat dan jalankan migrasi
npm run db:migrate
```

Atau untuk development cepat:
```bash
# Push schema langsung ke database (tanpa migration files)
npm run db:push
```

### 3. Tabel yang Dibuat

Saat migrasi dijalankan, Prisma akan membuat tabel-tabel berikut:

1. **products** - Data produk
2. **price_history** - History perubahan harga
3. **stores** - Data toko
4. **product_locations** - Lokasi dan stok produk
5. **product_transfers** - History transfer produk
6. **product_additions** - History penambahan stok
7. **sales** - Data penjualan
8. **undetected_products** - Produk yang tidak terdeteksi saat upload
9. **sales_upload_history** - History upload file penjualan

## Setup Database untuk Pertama Kali

### Development

1. **Start PostgreSQL** (pilih salah satu):
   ```bash
   # Menggunakan Docker
   docker-compose up -d postgres
   
   # Atau pastikan PostgreSQL lokal sudah running
   ```

2. **Setup environment variable**:
   ```bash
   # Copy .env.example ke .env
   cp .env.example .env
   
   # Edit .env dan set DATABASE_URL
   # Untuk Docker:
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/annel_beauty?schema=public"
   ```

3. **Jalankan migrasi**:
   ```bash
   npm run db:setup
   # Atau
   npm run db:generate
   npm run db:migrate
   ```

### Production

1. **Buat database di platform cloud** (Vercel, Supabase, dll)
2. **Copy connection string** ke environment variables
3. **Jalankan migrasi**:
   ```bash
   npx prisma migrate deploy
   ```

## File-file Penting

- `prisma/schema.prisma` - Definisi schema database
- `prisma/migrations/` - File migrasi (dibuat otomatis)
- `.env` - Environment variables (termasuk DATABASE_URL)
- `src/lib/db.ts` - Prisma Client instance
- `src/lib/storage.ts` - Functions untuk akses database

## Catatan

- **Jangan commit file `.env`** ke repository
- Database harus dibuat **sebelum** menjalankan aplikasi
- Migrasi harus dijalankan **setelah** database dibuat
- Untuk production, gunakan connection pooling untuk performa lebih baik

