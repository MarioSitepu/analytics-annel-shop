# Quick Fix: Vercel Environment Variable Error

## Error
```
Environment Variable "DATABASE_URL" references Secret "database_url", which does not exist.
```

## Solusi Cepat

### Langkah 1: Buka Vercel Dashboard
1. https://vercel.com/dashboard
2. Pilih project Anda

### Langkah 2: Set Environment Variable
1. Klik **Settings** → **Environment Variables**
2. Klik **Add New**
3. Isi:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://postgres.yfomjrygtrohfrtrdvrr:GLN9deXZqVpuTR52@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres`
   - **Environment**: ✅ Production ✅ Preview ✅ Development
4. Klik **Save**

### Langkah 3: Redeploy
1. Klik **Deployments**
2. Klik **"..."** pada deployment terbaru
3. Pilih **Redeploy**

## Catatan Penting

⚠️ **Jangan gunakan "Import from .env"** jika ada opsi untuk reference secret yang tidak ada.

✅ **Set langsung value** connection string di Environment Variables.

## Format Connection String

```
postgresql://postgres.yfomjrygtrohfrtrdvrr:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

Ganti `[PASSWORD]` dengan password database Supabase Anda.

## Setelah Fix

Setelah set environment variable dan redeploy, aplikasi akan:
- ✅ Build berhasil
- ✅ Connect ke database
- ✅ Siap digunakan

