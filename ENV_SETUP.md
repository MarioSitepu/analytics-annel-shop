# Environment Variables Setup

## File Environment

File environment variables disimpan di `.env` di root project.

## Setup

### 1. Copy Template

**Windows (PowerShell):**
```powershell
Copy-Item env.example .env
```

**Linux/Mac:**
```bash
cp env.example .env
```

**Atau buat manual:**
- Copy isi dari `env.example`
- Buat file baru bernama `.env`
- Paste isi tersebut

### 2. Update Values

Edit file `.env` dan update nilai-nilai berikut:

#### Database URL (Supabase)

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

**Cara mendapatkan:**
1. Buka Supabase Dashboard
2. Settings → Database
3. Connection string → Tab URI
4. Copy connection string
5. Ganti `[YOUR-PASSWORD]` dengan password database Anda
6. Ganti `xxxxx` dengan ID project Supabase Anda

**Contoh:**
```env
DATABASE_URL="postgresql://postgres:mypassword123@db.abcdefghijk.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

#### Application URL

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Untuk production, ganti dengan URL aplikasi Anda:
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### Environment

```env
NODE_ENV=development
```

Untuk production:
```env
NODE_ENV=production
```

## File Structure

```
project-root/
├── .env              # Environment variables (JANGAN commit!)
├── .env.example       # Template (bisa commit)
├── env.example        # Template alternatif
└── ...
```

## Security Notes

⚠️ **PENTING:**
- ❌ JANGAN commit file `.env` ke repository
- ✅ File `.env.example` atau `env.example` boleh di-commit
- ✅ Gunakan environment variables di platform deployment (Vercel, dll)
- ✅ Jangan share password atau secret keys

## Verification

Setelah setup, verifikasi dengan:

```bash
# Test database connection
npx prisma db pull

# Start development server
npm run dev
```

## Troubleshooting

**Error: DATABASE_URL not found**
- Pastikan file `.env` ada di root project
- Pastikan nama file benar: `.env` (dengan titik di depan)
- Restart development server setelah membuat/update `.env`

**Error: Invalid connection string**
- Pastikan connection string lengkap
- Pastikan password benar
- Pastikan tidak ada spasi di awal/akhir connection string

**Error: Connection timeout**
- Pastikan password benar
- Pastikan connection string lengkap
- Coba gunakan Connection Pooling untuk Supabase

## Production Deployment

Untuk production (Vercel, Railway, dll):

1. Set environment variables di platform dashboard
2. Jangan hardcode di code
3. Gunakan Connection Pooling untuk Supabase
4. Set `NODE_ENV=production`

### Vercel Example

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add:
   - `DATABASE_URL` = connection string
   - `NEXT_PUBLIC_APP_URL` = production URL
   - `NODE_ENV` = production

## Reference

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Setup Supabase
- [QUICK_START.md](./QUICK_START.md) - Quick start guide

