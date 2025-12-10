# Fix: Prepared Statement Error dengan Connection Pooling

## Error

```
Error occurred during query execution:
ConnectorError(ConnectorError { user_facing_error: None, kind: QueryError(PostgresError { code: "26000", message: "prepared statement \"s14\" does not exist", severity: "ERROR" })
```

## Penyebab

Connection Pooling (pgbouncer) di Supabase **tidak support prepared statements** yang digunakan oleh Prisma. Ini adalah limitation dari pgbouncer.

## Solusi

### Untuk Development: Gunakan Direct Connection

**Update `.env`:**
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

**Format:**
- `postgres` (bukan `postgres.xxxxx`)
- `db.xxxxx.supabase.co` (bukan `pooler.supabase.com`)
- Port `5432`

### Untuk Production: Tetap Gunakan Connection Pooling

Untuk production di Vercel, tetap gunakan Connection Pooling:
```env
DATABASE_URL="postgresql://postgres.yfomjrygtrohfrtrdvrr:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
```

**Catatan:** Di production, prepared statement errors mungkin tidak terjadi karena:
- Vercel menggunakan connection pooling yang berbeda
- Atau bisa di-handle dengan retry logic

## Perbedaan Connection

### Direct Connection (Development)
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```
- ✅ Support prepared statements
- ✅ Support semua Prisma operations
- ⚠️ Mungkin timeout dari network tertentu
- ⚠️ Tidak recommended untuk production (beban tinggi)

### Connection Pooling (Production)
```
postgresql://postgres.xxxxx:[PASSWORD]@pooler.supabase.com:6543/postgres
```
- ✅ Lebih efisien untuk production
- ✅ Connection pooling
- ❌ Tidak support prepared statements
- ❌ Beberapa Prisma operations mungkin gagal

## Alternatif: Disable Prepared Statements (Tidak Recommended)

Jika tetap ingin menggunakan Connection Pooling, bisa disable prepared statements di Prisma:

**Update `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Disable prepared statements
  // Note: This may impact performance
}
```

**Atau di connection string:**
```
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1&prepared_statements=false"
```

**Tapi ini tidak recommended** karena:
- Bisa impact performance
- Tidak semua Prisma features support
- Bisa menyebabkan masalah lain

## Rekomendasi

1. **Development:** Gunakan direct connection
2. **Production:** Gunakan Connection Pooling (di Vercel biasanya OK)
3. **Jika production error:** Coba direct connection atau contact Supabase support

## Troubleshooting

### Jika Direct Connection Timeout

1. Check firewall settings
2. Coba dari network lain
3. Check Supabase project status
4. Contact Supabase support

### Jika Masih Error

1. Restart dev server setelah update `.env`
2. Clear Next.js cache: `npm run clean`
3. Regenerate Prisma Client: `npx prisma generate`

