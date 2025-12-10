# Fix Vercel Build Error - Peer Dependency Conflict

## Error

```
npm error ERESOLVE could not resolve
npm error While resolving: lucide-react@0.344.0
npm error Found: react@19.2.1
npm error Could not resolve dependency:
npm error peer react@"^16.5.1 || ^17.0.0 || ^18.0.0" from lucide-react@0.344.0
```

## Penyebab

`lucide-react@0.344.0` tidak support React 19, hanya support React 16-18.

## Solusi yang Diterapkan

### 1. Update `vercel.json`

Install command menggunakan `--legacy-peer-deps`:

```json
{
  "installCommand": "npm install --legacy-peer-deps"
}
```

### 2. Update `package.json`

Update `lucide-react` ke versi terbaru yang support React 19:

```json
{
  "dependencies": {
    "lucide-react": "^0.469.0"
  }
}
```

## Langkah Deploy

### 1. Commit Perubahan

```bash
git add vercel.json package.json
git commit -m "Fix peer dependency conflict for Vercel deploy"
git push
```

### 2. Vercel akan Auto-Deploy

Setelah push, Vercel akan:
- Install dependencies dengan `--legacy-peer-deps`
- Build aplikasi
- Deploy ke production

## Verifikasi

Setelah deploy, cek:
1. ✅ Build berhasil (tidak ada error)
2. ✅ Aplikasi bisa diakses
3. ✅ Database connection berhasil

## Alternatif: Update Dependencies Lokal

Jika ingin update dependencies lokal juga:

```bash
npm install --legacy-peer-deps
```

Ini akan update `package-lock.json` dengan versi yang benar.

## Catatan

- `--legacy-peer-deps` mengabaikan peer dependency conflicts
- Versi terbaru `lucide-react` sudah support React 19
- Build di Vercel akan menggunakan `--legacy-peer-deps` otomatis

## Troubleshooting

**Jika masih error:**
1. Check `package-lock.json` sudah di-commit
2. Pastikan `vercel.json` sudah di-push
3. Check build logs di Vercel untuk detail error

**Jika lucide-react masih error:**
- Coba update ke versi terbaru: `npm install lucide-react@latest --legacy-peer-deps`
- Atau downgrade React ke 18 (tidak recommended)

