# Topsus Frontend

Frontend SvelteKit (SPA) untuk [Aplikasi Akademik Topsus](https://github.com/DewaYoGamer/topsus_backend).

Stack:
- SvelteKit 2 + Svelte 4
- Tailwind CSS
- Vite

## Prasyarat

- Node.js 20+
- Backend (FastAPI) berjalan — lihat [topsus_backend](https://github.com/DewaYoGamer/topsus_backend)

## Jalankan Dev

```bash
npm install
npm run dev
```

Default: http://127.0.0.1:5173

## Konfigurasi Backend URL

Backend URL saat ini di-hardcode di `src/lib/api.js` (`API_BASE`). Saat deploy ke Vercel, ganti ke domain Railway.

Untuk production siapkan env var `PUBLIC_API_BASE` dan baca via `import.meta.env.PUBLIC_API_BASE`.

## Fitur

- Login JWT (3 role: admin, dosen, mahasiswa)
- Dashboard beda per role
- Admin: assign dosen pembimbing ke mahasiswa via dropdown
- Logout: panggil `POST /auth/logout` (JWT di-blacklist di backend)

## Akun Demo

| Email                 | Password | Role       |
|-----------------------|----------|------------|
| admin@kampus.ac.id    | admin123 | admin      |
| budi@kampus.ac.id     | dosen123 | dosen      |
| ani@kampus.ac.id      | mhs123   | mahasiswa  |
| chandra@kampus.ac.id  | mhs123   | mahasiswa  |

## Build

```bash
npm run build
npm run preview
```

## Deploy ke Vercel

1. Vercel → Import repo → root directory `.`
2. Framework: SvelteKit (auto-detect)
3. Set env `PUBLIC_API_BASE=https://<railway-backend-domain>` (setelah kode diubah untuk membacanya)
4. Deploy
