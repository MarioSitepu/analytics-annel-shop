# Quick Start Guide

Panduan cepat untuk memulai aplikasi dengan Supabase.

## Prerequisites

- Node.js 20+ terinstall
- Akun Supabase (gratis)

## Langkah 1: Clone & Install

```bash
# Install dependencies
npm install --legacy-peer-deps
```

## Langkah 2: Setup Supabase Database

### 2.1 Buat Project Supabase

1. Buka https://supabase.com
2. Login/Signup
3. Klik **"New Project"**
4. Isi:
   - Name: `annel-beauty-analytics`
   - Password: Buat password kuat (simpan baik-baik!)
   - Region: Pilih terdekat
5. Klik **"Create new project"**
6. Tunggu 2-3 menit

### 2.2 Dapatkan Connection String

1. Di Supabase Dashboard → **Settings** (⚙️)
2. Pilih **Database**
3. Scroll ke **Connection string**
4. Pilih tab **URI**
5. Copy connection string

### 2.3 Setup Environment

Buat file `.env` di root project:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Ganti:**
- `[YOUR-PASSWORD]` → Password database Anda
- `xxxxx` → ID project Supabase Anda

## Langkah 3: Setup Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema ke database
npm run db:push
```

## Langkah 4: Start Development Server

```bash
npm run dev
```

Buka browser di **http://localhost:3000**

## Login

Default credentials:
- Username: `admin`
- Password: `admin`

Atau:
- Username: `annel`
- Password: `beauty123`

## Troubleshooting

**Error: Can't resolve '@prisma/client'**
```bash
npx prisma generate
```

**Error: Connection timeout**
- Pastikan password benar
- Pastikan connection string lengkap

**Error: Cache issues**
```bash
npm run clean
npm run dev
```

## Next Steps

1. ✅ Database sudah terhubung
2. ✅ Aplikasi sudah running
3. 📝 Tambah produk di menu "Kelola Produk"
4. 📝 Tambah toko di menu "Tambah Toko"
5. 📤 Upload data penjualan

## Dokumentasi Lengkap

- [SETUP_SUPABASE.md](./SETUP_SUPABASE.md) - Quick setup Supabase
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Panduan lengkap Supabase
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Panduan deployment
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Troubleshooting guide

