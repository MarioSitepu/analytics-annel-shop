# Setup Database Supabase

Panduan lengkap untuk setup database menggunakan Supabase.

## Langkah 1: Buat Project Supabase

1. Buka [https://supabase.com](https://supabase.com)
2. Klik **"Start your project"** atau **"Sign In"** jika sudah punya akun
3. Klik **"New Project"**
4. Isi informasi project:
   - **Name**: `annel-beauty-analytics` (atau nama lain)
   - **Database Password**: Buat password yang kuat (simpan dengan baik!)
   - **Region**: Pilih region terdekat (contoh: `Southeast Asia (Singapore)`)
   - **Pricing Plan**: Pilih **Free** untuk development
5. Klik **"Create new project"**
6. Tunggu hingga project selesai dibuat (sekitar 2-3 menit)

## Langkah 2: Dapatkan Connection String

1. Setelah project dibuat, masuk ke **Project Settings**
2. Pilih menu **Database** di sidebar kiri
3. Scroll ke bagian **Connection string**
4. Pilih tab **URI**
5. Copy connection string yang terlihat seperti:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

## Langkah 3: Setup Environment Variables

1. Buat file `.env` di root project (jika belum ada):
   ```bash
   cp .env.example .env
   ```

2. Edit file `.env` dan update `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
   ```

   **Catatan Penting:**
   - Ganti `[YOUR-PASSWORD]` dengan password database yang Anda buat
   - Ganti `xxxxx` dengan ID project Supabase Anda
   - Tambahkan `?pgbouncer=true&connection_limit=1` untuk connection pooling (recommended)

3. Atau gunakan **Connection Pooling** (lebih baik untuk production):
   - Di Supabase Dashboard, pilih **Connection Pooling**
   - Copy connection string dari **Transaction** mode
   - Format: `postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`

## Langkah 4: Jalankan Migrasi Database

Setelah connection string diset, jalankan migrasi untuk membuat tabel:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema ke database (untuk development)
npm run db:push

# Atau buat migration (untuk production)
npm run db:migrate
```

## Langkah 5: Verifikasi Setup

1. **Test koneksi**:
   ```bash
   npx prisma db pull
   ```
   Jika berhasil, akan menampilkan schema dari database.

2. **Buka Prisma Studio** (opsional):
   ```bash
   npm run db:studio
   ```
   Ini akan membuka browser dengan interface untuk melihat data di database.

## Langkah 6: Setup Database di Supabase Dashboard

### Membuat Tables Manual (Opsional)

Jika ingin melihat tables di Supabase Dashboard:

1. Buka Supabase Dashboard
2. Pilih menu **Table Editor** di sidebar
3. Tables akan muncul setelah migrasi dijalankan

### Menggunakan SQL Editor

1. Buka **SQL Editor** di Supabase Dashboard
2. Anda bisa menjalankan query SQL langsung di sini

## Connection String untuk Berbagai Use Case

### Development (Direct Connection)
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

### Production (Connection Pooling - Recommended)
```env
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
```

### Transaction Mode (Connection Pooling)
```env
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

## Troubleshooting

### Error: Connection timeout
- Pastikan password benar
- Pastikan connection string lengkap
- Coba gunakan connection pooling

### Error: SSL required
Tambahkan `?sslmode=require` di akhir connection string:
```env
DATABASE_URL="postgresql://...?sslmode=require"
```

### Error: Too many connections
- Gunakan connection pooling
- Atau tambahkan `?connection_limit=1` di connection string

### Error: Database does not exist
- Pastikan menggunakan database `postgres` (default)
- Atau buat database baru di Supabase Dashboard

## Keamanan

1. **Jangan commit file `.env`** ke repository
2. **Gunakan environment variables** di platform deployment (Vercel, dll)
3. **Gunakan connection pooling** untuk production
4. **Rotate password** secara berkala

## Tips

- **Free tier** Supabase memberikan:
  - 500 MB database storage
  - 2 GB bandwidth
  - Unlimited API requests
  - Cukup untuk development dan testing

- **Connection Pooling** sangat recommended untuk:
  - Production applications
  - Mencegah "too many connections" error
  - Better performance

- **Backup otomatis**: Supabase melakukan backup otomatis setiap hari (untuk paid plans)

## Next Steps

Setelah database setup:

1. ✅ Database sudah terhubung
2. ✅ Tables sudah dibuat
3. ✅ Aplikasi siap digunakan
4. ✅ Deploy aplikasi (lihat DEPLOYMENT.md)

## Referensi

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://supabase.com/docs/guides/integrations/prisma)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

