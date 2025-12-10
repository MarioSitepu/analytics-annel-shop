# Fix Connection Timeout ke Supabase

## Masalah

```
Error: P1001 - Can't reach database server
Connection timed out
```

## Penyebab

1. **Direct connection** ke Supabase sering timeout dari beberapa network
2. Firewall/network blocking port 5432
3. Supabase membatasi direct connections

## Solusi: Gunakan Connection Pooling

Connection Pooling lebih reliable dan direkomendasikan oleh Supabase.

### Langkah 1: Dapatkan Connection Pooling URL

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **Settings** (⚙️)
4. Pilih **Database** di sidebar
5. Scroll ke **Connection Pooling**
6. Pilih tab **Transaction** mode
7. Copy connection string

**Format:**
```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### Langkah 2: Update .env

Edit file `.env` dan update `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

**Ganti:**
- `xxxxx` → ID project Supabase Anda
- `[PASSWORD]` → Password database Anda
- `ap-southeast-1` → Region Anda (sesuaikan)

### Langkah 3: Test Connection

```powershell
npx prisma db pull
```

### Langkah 4: Push Schema

```powershell
npx prisma db push
```

## Alternatif: Menggunakan Script

Jalankan script helper:

```powershell
.\setup-supabase-connection.ps1
```

Script akan meminta connection pooling URL dan otomatis:
- Update `.env`
- Test connection
- Push schema

## Perbedaan Connection Types

### Direct Connection (Port 5432)
- ❌ Sering timeout
- ❌ Tidak recommended untuk production
- ✅ Bisa digunakan jika network mendukung

### Connection Pooling (Port 5432 atau 6543)
- ✅ Lebih reliable
- ✅ Recommended untuk production
- ✅ Better performance
- ✅ Handles connection limits

## Troubleshooting

**Masih timeout dengan Connection Pooling?**
- Pastikan password benar
- Pastikan connection string lengkap
- Coba port 6543 (Session mode) atau 5432 (Transaction mode)
- Check firewall settings
- Coba dari network lain

**Password dengan karakter khusus?**
- Gunakan URL encoding
- Atau reset password ke yang lebih sederhana

**Region berbeda?**
- Pastikan region di connection string sesuai dengan project
- Format: `aws-0-[REGION].pooler.supabase.com`

## Quick Fix

1. Supabase Dashboard → Settings → Database → Connection Pooling
2. Copy Transaction mode connection string
3. Update `.env` dengan connection string tersebut
4. Test: `npx prisma db pull`
5. Push: `npx prisma db push`

## Reference

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma + Supabase](https://supabase.com/docs/guides/integrations/prisma)

