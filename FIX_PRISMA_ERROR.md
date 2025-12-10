# Fix Prisma Generate Error di Windows

Jika Anda mengalami error `EPERM: operation not permitted` saat menjalankan `npm install` atau `npx prisma generate`, ikuti langkah-langkah berikut:

## Solusi 1: Close Cursor/VS Code dan Run Manual

1. **Close Cursor/VS Code** sepenuhnya
2. Buka **PowerShell** (bukan dari Cursor)
3. Navigate ke project directory:
   ```powershell
   cd "C:\Users\ASUS\Documents\Belajar\Kuliah\TubesSI\annel-beauty-analytics"
   ```
4. Hapus folder .prisma:
   ```powershell
   Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue
   ```
5. Generate Prisma client:
   ```powershell
   npx prisma generate
   ```

## Solusi 2: Run PowerShell sebagai Administrator

1. Klik kanan pada **PowerShell**
2. Pilih **Run as Administrator**
3. Navigate ke project directory
4. Jalankan:
   ```powershell
   cd "C:\Users\ASUS\Documents\Belajar\Kuliah\TubesSI\annel-beauty-analytics"
   Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue
   npx prisma generate
   ```

## Solusi 3: Gunakan Script Fix

Jalankan script yang sudah dibuat:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/fix-prisma.ps1
```

## Solusi 4: Install dengan Skip Scripts

Jika semua solusi di atas tidak berhasil, install dependencies tanpa postinstall script:

```powershell
npm install --ignore-scripts
```

Kemudian generate Prisma client secara manual setelah install selesai (diluar Cursor/VS Code).

## Solusi 5: Disable Windows Defender Temporarily

Jika Windows Defender memblokir, coba disable sementara:

1. Buka **Windows Security**
2. **Virus & threat protection**
3. **Manage settings**
4. **Real-time protection** → Off (sementara)
5. Generate Prisma client
6. Enable kembali Real-time protection

## Catatan

- Error ini biasanya terjadi karena file sedang digunakan oleh proses lain
- Cursor/VS Code atau dev server yang masih running bisa menyebabkan error ini
- Pastikan tidak ada proses Node yang masih running sebelum generate

## Setelah Prisma Generate Berhasil

Setelah Prisma client berhasil di-generate, lanjutkan dengan:

1. **Run database migration:**
   ```powershell
   npx prisma db push
   ```

2. **Create user:**
   ```powershell
   npm run create-user
   ```

3. **Start dev server:**
   ```powershell
   npm run dev
   ```

