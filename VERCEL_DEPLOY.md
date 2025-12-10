# Panduan Deploy ke Vercel

## Error: Secret "database_url" tidak ditemukan

Error ini terjadi karena environment variable `DATABASE_URL` di Vercel mencoba mereferensikan secret yang tidak ada.

## Solusi

### Opsi 1: Set Environment Variable Langsung (Recommended)

1. **Buka Vercel Dashboard**
   - https://vercel.com/dashboard
   - Pilih project Anda

2. **Settings → Environment Variables**

3. **Add Environment Variable:**
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://postgres.yfomjrygtrohfrtrdvrr:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres`
   - **Environment**: Pilih semua (Production, Preview, Development)
   - **Jangan** gunakan "Import from .env" jika ada opsi secret reference

4. **Save**

### Opsi 2: Buat Secret Terlebih Dahulu

1. **Vercel Dashboard → Settings → Secrets**

2. **Create Secret:**
   - **Name**: `database_url` (lowercase, sesuai error)
   - **Value**: Connection string Supabase Anda
   - **Save**

3. **Settings → Environment Variables**

4. **Add Environment Variable:**
   - **Key**: `DATABASE_URL`
   - **Value**: Pilih secret `database_url` dari dropdown
   - **Environment**: Semua
   - **Save**

### Opsi 3: Update via Vercel CLI

```bash
# Install Vercel CLI (jika belum)
npm i -g vercel

# Login
vercel login

# Set environment variable
vercel env add DATABASE_URL production

# Paste connection string saat diminta
# Ulangi untuk preview dan development jika perlu
```

## Format Connection String untuk Vercel

**Connection Pooling (Recommended):**
```
postgresql://postgres.yfomjrygtrohfrtrdvrr:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**Ganti `[PASSWORD]` dengan password database Supabase Anda.**

## Environment Variables yang Diperlukan

Set di Vercel:

1. **DATABASE_URL**
   ```
   postgresql://postgres.yfomjrygtrohfrtrdvrr:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```

2. **NEXT_PUBLIC_APP_URL** (opsional)
   ```
   https://your-project.vercel.app
   ```

3. **NODE_ENV** (opsional, otomatis di Vercel)
   ```
   production
   ```

## Setelah Set Environment Variables

1. **Redeploy** aplikasi:
   - Vercel Dashboard → Deployments
   - Klik "..." pada deployment terbaru
   - Pilih "Redeploy"

2. **Atau trigger deploy baru:**
   ```bash
   git push origin main
   ```

## Verifikasi

Setelah deploy, cek:

1. **Build Logs** - Pastikan tidak ada error
2. **Function Logs** - Test API endpoint
3. **Database Connection** - Test koneksi ke Supabase

## Troubleshooting

### Error: Secret tidak ditemukan
- **Solusi**: Set environment variable langsung (Opsi 1)
- Atau buat secret terlebih dahulu (Opsi 2)

### Error: Connection timeout
- **Solusi**: Pastikan menggunakan Connection Pooling
- Check firewall Supabase (biasanya sudah allow Vercel IPs)

### Error: Build failed
- **Solusi**: Pastikan Prisma Client di-generate
- Check build logs untuk detail error

### Error: Environment variable tidak ter-load
- **Solusi**: Redeploy setelah set environment variables
- Pastikan environment variable set untuk semua environments

## Tips

1. **Jangan commit `.env`** ke repository
2. **Gunakan Connection Pooling** untuk production
3. **Set environment variables** sebelum deploy pertama
4. **Redeploy** setelah update environment variables
5. **Monitor logs** untuk troubleshooting

## Reference

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Secrets](https://vercel.com/docs/concepts/projects/environment-variables#secret-environment-variables)

