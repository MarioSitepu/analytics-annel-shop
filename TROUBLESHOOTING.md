# Troubleshooting Guide

## Error: Module not found: Can't resolve '@prisma/client'

Jika Anda mengalami error ini, ikuti langkah-langkah berikut:

### 1. Generate Prisma Client

Pastikan Prisma Client sudah di-generate:

```bash
npx prisma generate
```

### 2. Install Dependencies

Pastikan semua dependencies terinstall:

```bash
npm install --legacy-peer-deps
```

### 3. Clear Next.js Cache

Hapus cache Next.js:

```bash
# Windows PowerShell
Remove-Item -Recurse -Force .next

# Linux/Mac
rm -rf .next
```

### 4. Rebuild

Jalankan build lagi:

```bash
npm run build
```

### 5. Development Server

Jika error terjadi di development server:

```bash
# Stop server (Ctrl+C)
# Clear cache
Remove-Item -Recurse -Force .next
# Generate Prisma Client
npx prisma generate
# Start server
npm run dev
```

### 6. Verify Prisma Client

Pastikan Prisma Client ada di node_modules:

```bash
# Windows PowerShell
Test-Path node_modules\@prisma\client

# Linux/Mac
test -d node_modules/@prisma/client && echo "Exists" || echo "Not found"
```

Jika tidak ada, jalankan:
```bash
npx prisma generate
```

### 7. Check package.json

Pastikan `@prisma/client` ada di dependencies:

```json
{
  "dependencies": {
    "@prisma/client": "^5.20.0"
  }
}
```

### 8. Postinstall Script

Pastikan `postinstall` script ada di package.json untuk auto-generate Prisma Client:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### 9. Docker/CI Issues

Jika menggunakan Docker atau CI/CD, pastikan Prisma Client di-generate di dalam container:

```dockerfile
RUN npx prisma generate
```

### 10. Still Not Working?

1. Hapus `node_modules` dan `package-lock.json`:
```bash
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
```

2. Install ulang:
```bash
npm install --legacy-peer-deps
```

3. Generate Prisma Client:
```bash
npx prisma generate
```

4. Build:
```bash
npm run build
```

## Error: Prisma schema validation errors

Jika ada error validasi schema:

1. Check `prisma/schema.prisma` untuk syntax errors
2. Jalankan:
```bash
npx prisma format
```

3. Generate lagi:
```bash
npx prisma generate
```

## Error: Database connection

Jika ada error koneksi database:

1. Pastikan `DATABASE_URL` sudah diset di `.env`
2. Pastikan database service sudah running (jika menggunakan Docker: `docker-compose up -d postgres`)
3. Test koneksi:
```bash
npx prisma db pull
```

## Error: ENOENT: no such file or directory, pages-manifest.json

Error ini terjadi ketika cache Next.js korup atau tidak lengkap.

### Solusi Cepat

1. **Stop development server** (Ctrl+C)

2. **Hapus cache Next.js**:
```bash
# Windows PowerShell
Remove-Item -Recurse -Force .next

# Linux/Mac
rm -rf .next
```

3. **Restart development server**:
```bash
npm run dev
```

### Menggunakan Script Helper

Gunakan script yang sudah disediakan:

```bash
# Windows
npm run dev:clean

# Atau manual clean
npm run clean
npm run dev
```

### Jika Masih Error

1. **Stop semua Node.js processes**:
```bash
# Windows PowerShell
Get-Process -Name node | Stop-Process -Force

# Linux/Mac
pkill -f "next dev"
```

2. **Hapus semua cache**:
```bash
# Windows PowerShell
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Linux/Mac
rm -rf .next
rm -rf node_modules/.cache
```

3. **Regenerate Prisma Client**:
```bash
npx prisma generate
```

4. **Start server lagi**:
```bash
npm run dev
```

## Tips

- Selalu jalankan `npx prisma generate` setelah mengubah `prisma/schema.prisma`
- Gunakan `npm run db:generate` sebagai shortcut
- Pastikan Prisma Client di-generate sebelum build atau start server
- Jika development server error, coba `npm run clean` dulu sebelum restart
- Gunakan `npm run dev:clean` untuk clean cache dan restart sekaligus

