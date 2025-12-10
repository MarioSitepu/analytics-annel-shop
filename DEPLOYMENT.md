# Panduan Deployment

Aplikasi ini menggunakan PostgreSQL sebagai database dan dapat di-deploy menggunakan beberapa metode.

## Database

Database dibuat menggunakan **PostgreSQL**. Database akan dibuat otomatis saat menjalankan migrasi Prisma.

### Lokasi Database

- **Development**: Database lokal (via Docker atau PostgreSQL lokal)
- **Production**: Database cloud (Vercel Postgres, Supabase, Railway, dll)

## Setup Database

### 1. Setup Database Lokal (Development)

#### Menggunakan Docker (Recommended)

```bash
# Jalankan PostgreSQL menggunakan Docker Compose
docker-compose up -d postgres

# Database akan tersedia di:
# Host: localhost
# Port: 5432
# Database: annel_beauty
# User: postgres
# Password: postgres
```

#### Setup Manual PostgreSQL

1. Install PostgreSQL di sistem Anda
2. Buat database:
```sql
CREATE DATABASE annel_beauty;
```

3. Update `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/annel_beauty?schema=public"
```

### 2. Setup Database Production

#### Supabase (Recommended)

**Lihat panduan lengkap di [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**

Quick setup:
1. Buat project di [Supabase](https://supabase.com)
2. Dapatkan connection string dari **Settings > Database**
3. Update `DATABASE_URL` di environment variables:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
   ```
4. Jalankan migrasi:
   ```bash
   npm run db:push
   ```

#### Vercel Postgres

1. Buat Vercel Postgres database di dashboard Vercel
2. Copy connection string ke environment variables
3. Deploy aplikasi ke Vercel

#### Railway / Render

1. Buat PostgreSQL service
2. Copy connection string
3. Update `DATABASE_URL` di environment variables

## Migrasi Database

Setelah database setup, jalankan migrasi:

```bash
# Generate Prisma Client
npm run db:generate

# Jalankan migrasi (development)
npm run db:migrate

# Atau push schema langsung (untuk development)
npm run db:push
```

## Deployment

### 1. Deploy ke Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login ke Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Setup environment variables di Vercel dashboard:
   - `DATABASE_URL`: Connection string ke database PostgreSQL

5. Jalankan migrasi setelah deploy:
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### 2. Deploy menggunakan Docker

1. Build image:
```bash
docker-compose build
```

2. Jalankan migrasi:
```bash
docker-compose run app npx prisma migrate deploy
```

3. Start aplikasi:
```bash
docker-compose up -d
```

Aplikasi akan tersedia di `http://localhost:3000`

### 3. Deploy ke Platform Lain

#### Railway

1. Connect repository ke Railway
2. Add PostgreSQL service
3. Set environment variable `DATABASE_URL`
4. Deploy

#### Render

1. Create new Web Service
2. Connect repository
3. Add PostgreSQL database
4. Set environment variable `DATABASE_URL`
5. Build command: `npm run build`
6. Start command: `npm start`

## Environment Variables

Buat file `.env` atau set di platform deployment:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Next.js
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Environment
NODE_ENV=production
```

## Post-Deployment Checklist

1. ✅ Database sudah dibuat dan terhubung
2. ✅ Migrasi Prisma sudah dijalankan (`npx prisma migrate deploy`)
3. ✅ Environment variables sudah diset
4. ✅ Aplikasi bisa diakses
5. ✅ Test login dan fitur utama

## Troubleshooting

### Error: Database tidak ditemukan
- Pastikan database sudah dibuat
- Check `DATABASE_URL` di environment variables
- Pastikan database service sudah running

### Error: Migration failed
- Pastikan Prisma Client sudah di-generate: `npm run db:generate`
- Check koneksi database
- Pastikan user database punya permission untuk create tables

### Error: Connection timeout
- Check firewall settings
- Pastikan database service accessible dari deployment platform
- Untuk production, gunakan connection pooling (recommended)

## Catatan Penting

- **Jangan commit file `.env`** ke repository
- Gunakan connection pooling untuk production (contoh: PgBouncer)
- Backup database secara berkala
- Monitor database performance di production

