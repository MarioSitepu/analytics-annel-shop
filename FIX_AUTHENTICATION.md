# Fix Authentication Error (P1000)

## Error yang Terjadi

```
Error: P1000: Authentication failed against database server
```

## Penyebab

Password database di `.env` tidak sesuai dengan password di Supabase.

## Solusi

### Langkah 1: Verifikasi Password di Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **Settings** (icon gear ⚙️)
4. Pilih **Database** di sidebar
5. Scroll ke bagian **Database password**
6. **Copy password** yang ada di sana

### Langkah 2: Update .env

Edit file `.env` dan pastikan format connection string benar:

**Format yang benar:**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD_HERE@db.yfomjrygtrohfrtrdvrr.supabase.co:5432/postgres"
```

**Contoh:**
```env
DATABASE_URL="postgresql://postgres:MyPassword123@db.yfomjrygtrohfrtrdvrr.supabase.co:5432/postgres"
```

**PENTING:**
- Ganti `YOUR_PASSWORD_HERE` dengan password dari Supabase Dashboard
- Jangan ada kurung siku `[]` di password
- Jangan ada spasi di awal/akhir connection string
- Password harus dalam tanda kutip

### Langkah 3: Jika Password Ada Karakter Khusus

Jika password mengandung karakter khusus seperti `@`, `#`, `$`, `%`, dll, gunakan **URL Encoding**:

| Karakter | Encoding |
|----------|----------|
| `@` | `%40` |
| `#` | `%23` |
| `$` | `%24` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |
| `/` | `%2F` |
| `?` | `%3F` |
| ` ` (spasi) | `%20` |

**Contoh:**
Jika password adalah `My@Pass#123`, gunakan:
```env
DATABASE_URL="postgresql://postgres:My%40Pass%23123@db.xxxxx.supabase.co:5432/postgres"
```

### Langkah 4: Reset Password (Jika Lupa)

Jika lupa password:

1. Supabase Dashboard → Settings → Database
2. Scroll ke **Database password**
3. Klik **Reset database password**
4. Copy password baru
5. Update `.env` dengan password baru

### Langkah 5: Test Connection

Setelah update `.env`, test connection:

```powershell
npx prisma db pull
```

Jika berhasil, akan menampilkan schema dari database.

### Langkah 6: Push Schema

Setelah connection berhasil:

```powershell
npx prisma db push
```

## Alternatif: Gunakan Connection Pooling

Jika direct connection masih bermasalah, gunakan Connection Pooling:

1. Supabase Dashboard → Settings → Database
2. Pilih **Connection Pooling**
3. Copy connection string dari **Transaction** mode
4. Format: `postgresql://postgres.xxxxx:[PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres`
5. Update `DATABASE_URL` di `.env`

## Quick Fix

1. Buka Supabase Dashboard → Settings → Database
2. Copy **Database password**
3. Edit `.env`, update password di `DATABASE_URL`
4. Test: `npx prisma db pull`
5. Push: `npx prisma db push`

## Troubleshooting

**Masih error setelah update password?**
- Pastikan tidak ada spasi di password
- Pastikan format connection string benar
- Coba reset password di Supabase
- Coba gunakan Connection Pooling

**Password dengan karakter khusus?**
- Gunakan URL encoding
- Atau reset password ke yang lebih sederhana (huruf dan angka saja)

**Connection timeout?**
- Pastikan internet connection stabil
- Coba gunakan Connection Pooling
- Check firewall settings

