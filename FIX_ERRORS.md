# Fix Errors - Troubleshooting

## Error 1: EPERM - operation not permitted (Prisma Generate)

**Error:**
```
EPERM: operation not permitted, rename '...query_engine-windows.dll.node.tmp...'
```

**Penyebab:**
- File DLL sedang digunakan oleh process lain
- Antivirus memblokir operasi
- Permission issue di Windows

**Solusi:**

### Solusi 1: Stop semua Node.js processes
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Solusi 2: Hapus node_modules/.prisma dan regenerate
```powershell
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
npx prisma generate
```

### Solusi 3: Run as Administrator
- Buka PowerShell sebagai Administrator
- Jalankan `npx prisma generate`

### Solusi 4: Disable antivirus sementara
- Nonaktifkan antivirus sementara
- Jalankan `npx prisma generate`
- Aktifkan kembali antivirus

## Error 2: P1000 - Authentication failed

**Error:**
```
Error: P1000: Authentication failed against database server
```

**Penyebab:**
- Password database salah
- Connection string tidak lengkap
- Format connection string salah

**Solusi:**

### 1. Verifikasi Password

Pastikan password di `.env` benar. Password Supabase adalah password yang Anda buat saat membuat project.

**Cek di Supabase:**
1. Buka Supabase Dashboard
2. Settings → Database
3. Scroll ke **Database password**
4. Jika lupa, klik **Reset database password**

### 2. Format Connection String

**Format yang benar:**
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

**Pastikan:**
- Tidak ada spasi di awal/akhir
- Password tidak ada karakter khusus yang perlu di-encode
- Jika password ada karakter khusus, gunakan URL encoding:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`
  - `&` → `%26`
  - `+` → `%2B`
  - `=` → `%3D`

### 3. Test Connection String

**Cara 1: Test dengan Prisma**
```powershell
npx prisma db pull
```

**Cara 2: Test dengan psql (jika terinstall)**
```powershell
psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

### 4. Gunakan Connection Pooling (Alternatif)

Jika direct connection tidak bekerja, coba Connection Pooling:

1. Di Supabase Dashboard → Settings → Database
2. Pilih **Connection Pooling**
3. Copy connection string dari **Transaction** mode
4. Format: `postgresql://postgres.xxxxx:[PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres`

### 5. Reset Password (Jika Lupa)

1. Supabase Dashboard → Settings → Database
2. Scroll ke **Database password**
3. Klik **Reset database password**
4. Copy password baru
5. Update `.env` dengan password baru

## Langkah-langkah Fix Lengkap

### Step 1: Fix Prisma Generate Error

```powershell
# Stop semua Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Hapus .prisma folder
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue

# Hapus .next cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Generate ulang
npx prisma generate
```

### Step 2: Fix Database Connection

```powershell
# 1. Verifikasi password di Supabase Dashboard
# 2. Update .env dengan password yang benar
# 3. Test connection
npx prisma db pull
```

### Step 3: Push Schema

```powershell
# Setelah connection berhasil
npx prisma db push
```

## Tips

1. **Password dengan karakter khusus**: Gunakan URL encoding atau reset password ke yang lebih sederhana
2. **Connection Pooling**: Lebih stabil untuk production, gunakan untuk menghindari connection issues
3. **Test connection dulu**: Selalu test dengan `npx prisma db pull` sebelum `db push`
4. **Backup password**: Simpan password Supabase di tempat aman

## Quick Fix Script

Buat file `fix.ps1`:

```powershell
# Stop Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Clean Prisma
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue

# Clean Next.js cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Generate Prisma
Write-Host "Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

# Test connection
Write-Host "Testing database connection..." -ForegroundColor Cyan
npx prisma db pull

Write-Host "Done! If connection successful, run: npx prisma db push" -ForegroundColor Green
```

Jalankan:
```powershell
.\fix.ps1
```

