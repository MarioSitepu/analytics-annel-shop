# Quick Setup Supabase

## Langkah Cepat Setup Database Supabase

### 1. Buat Project Supabase

1. Buka https://supabase.com dan login/signup
2. Klik **"New Project"**
3. Isi:
   - **Name**: `annel-beauty-analytics`
   - **Database Password**: Buat password (simpan baik-baik!)
   - **Region**: Pilih terdekat (contoh: Singapore)
4. Klik **"Create new project"**
5. Tunggu 2-3 menit hingga selesai

### 2. Dapatkan Connection String

1. Di Supabase Dashboard, klik **Settings** (icon gear)
2. Pilih **Database** di sidebar
3. Scroll ke **Connection string**
4. Pilih tab **URI**
5. Copy connection string (format: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)

### 3. Setup di Project

1. Buat file `.env` di root project:
   ```bash
   # Copy dari .env.example jika ada
   ```

2. Tambahkan/update `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
   ```
   
   **Ganti:**
   - `[YOUR-PASSWORD]` dengan password database Anda
   - `xxxxx` dengan ID project Supabase Anda

### 4. Jalankan Migrasi

```bash
# Generate Prisma Client
npm run db:generate

# Push schema ke database
npm run db:push
```

### 5. Test

```bash
# Start development server
npm run dev
```

## Connection String untuk Production

Untuk production, gunakan **Connection Pooling**:

1. Di Supabase Dashboard > Settings > Database
2. Pilih **Connection Pooling**
3. Copy connection string dari **Transaction** mode
4. Format: `postgresql://postgres.xxxxx:[PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres`

## Troubleshooting

**Error: Connection timeout**
- Pastikan password benar
- Pastikan connection string lengkap

**Error: SSL required**
- Tambahkan `?sslmode=require` di akhir connection string

**Error: Too many connections**
- Gunakan Connection Pooling
- Atau tambahkan `?connection_limit=1`

## Lihat Juga

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Panduan lengkap
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Panduan deployment

