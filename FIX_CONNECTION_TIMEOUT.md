# Fix: Connection Timeout ke Supabase

## Error

```
Can't reach database server at `aws-1-ap-southeast-1.pooler.supabase.com:5432`
```

## Penyebab

Connection Pooling port 5432 (Transaction mode) mungkin tidak bisa diakses dari network Anda atau ada masalah dengan connection string.

## Solusi

### Opsi 1: Gunakan Port 6543 (Session Mode) - Recommended

Port 6543 adalah Session mode yang lebih reliable untuk development.

**Update `.env`:**
```env
DATABASE_URL="postgresql://postgres.yfomjrygtrohfrtrdvrr:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"
```

**Restart dev server:**
```powershell
# Stop server (Ctrl+C)
npm run dev
```

### Opsi 2: Coba Direct Connection (Jika Pooling Gagal)

Jika connection pooling masih timeout, coba direct connection:

**Update `.env`:**
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.yfomjrygtrohfrtrdvrr.supabase.co:5432/postgres"
```

**Catatan:** Direct connection mungkin juga timeout jika ada firewall issue.

### Opsi 3: Check Connection String

Pastikan:
1. ✅ Password benar
2. ✅ Connection string lengkap
3. ✅ Tidak ada karakter khusus yang perlu di-escape
4. ✅ Format connection string benar

## Format Connection String

**Connection Pooling (Port 6543 - Session Mode):**
```
postgresql://postgres.yfomjrygtrohfrtrdvrr:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Connection Pooling (Port 5432 - Transaction Mode):**
```
postgresql://postgres.yfomjrygtrohfrtrdvrr:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**Direct Connection:**
```
postgresql://postgres:[PASSWORD]@db.yfomjrygtrohfrtrdvrr.supabase.co:5432/postgres
```

## Troubleshooting

### 1. Test Connection

```powershell
npx prisma db pull
```

Jika berhasil, connection OK. Jika gagal, coba opsi lain.

### 2. Check Supabase Dashboard

1. Buka Supabase Dashboard
2. Settings > Database > Connection Pooling
3. Copy connection string yang benar
4. Pastikan password benar

### 3. Check Network/Firewall

- Pastikan tidak ada firewall yang block connection
- Coba dari network lain jika mungkin
- Check apakah Supabase project masih aktif

### 4. Restart Dev Server

Setelah update `.env`, selalu restart dev server:
```powershell
# Stop (Ctrl+C)
npm run dev
```

## Rekomendasi

**Untuk Development:**
- Gunakan port 6543 (Session mode) - lebih reliable
- Connection pooling lebih baik untuk development

**Untuk Production:**
- Gunakan connection pooling
- Port 5432 atau 6543 tergantung kebutuhan

## Catatan

- Connection pooling port 5432 (Transaction mode) mungkin tidak support semua operations
- Port 6543 (Session mode) lebih kompatibel untuk development
- Direct connection mungkin timeout karena firewall/network issue
