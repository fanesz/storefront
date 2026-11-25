# Minimarket Serbu — Storefront Web App (Midtrans Ready)

Aplikasi web belanja online **Minimarket Serbu** standalone berbasis **React 19 + Vite + Tailwind CSS 4** (tanpa perlu server backend terpisah) yang terintegrasi langsung dengan **Midtrans Snap Payment API**.

## Fitur Siap Verifikasi Midtrans
- **Katalog Produk Asli (IDR)**: 32 SKU kebutuhan harian nyata Minimarket Serbu dengan pencarian instan, filter 6 kategori, urutan harga, dan modal detail produk.
- **Alur Belanja Lengkap**: Keranjang tersimpan di `localStorage`, pilihan **Antar Kurir Toko** (`Rp 5.000`, gratis ongkir min. `Rp 150.000`) atau **Ambil di Toko** (`Gratis`), dan form Checkout lengkap.
- **Integrasi Pembayaran Midtrans Sandbox / Production**:
  - Membuat transaksi nyata ke `POST /snap/v1/transactions` dan mengarahkan pelanggan langsung ke **Midtrans Snap Payment Page** (`redirect_url`, mendukung QRIS, GoPay, ShopeePay, Virtual Account, dll.).
  - Mendukung pengecekan status pembayaran real-time (`GET /v2/{order_id}/status`) di menu **Pesanan**.
- **Halaman Kepatuhan Wajib Midtrans**: Tentang Kami, Kebijakan Pengiriman, Syarat & Ketentuan, Kebijakan Privasi, Kebijakan Pengembalian & Refund, dan Kontak Gerai.

## Menjalankan Secara Lokal

File `.env` sudah dikonfigurasi dengan Sandbox Server Key Anda. Jalankan di terminal:

```bash
cd storefront
bun install
bun run dev
```
Aplikasi berjalan di `http://localhost:5175`.

## Cara Mendapatkan Link Publik untuk Dikirim ke Midtrans

Karena browser memblokir panggilan langsung (CORS) ke endpoint Server Key Midtrans, aplikasi ini sudah menyertakan adapter proxy ringan (`/api/midtrans/token` & `/api/midtrans/status`) yang berjalan otomatis tanpa server backend terpisah di platform berikut:

### Opsi 1: Deploy Gratis ke Vercel (Direkomendasikan — Link Permanen)
1. Upload/hubungkan folder `storefront` ke Vercel (set **Root Directory** = `storefront`).
2. Tambahkan Environment Variable di dashboard Vercel:
   - `MIDTRANS_SERVER_KEY` = `SB-Mid-server-...`
   - `MIDTRANS_IS_PRODUCTION` = `false` (ubah ke `true` saat sudah punya Server Key Production)
3. Deploy — folder `api/midtrans/` otomatis aktif sebagai Vercel Serverless Function dan URL `https://<nama-app>.vercel.app` siap dikirim ke Midtrans.

### Opsi 2: Deploy Gratis ke Cloudflare Pages (Link Permanen)
1. Hubungkan ke Cloudflare Pages (**Root directory**: `storefront`, **Build command**: `bun run build`, **Build output**: `dist`).
2. Isi Environment Variable `MIDTRANS_SERVER_KEY` dan `MIDTRANS_IS_PRODUCTION=false`.
3. Folder `functions/api/midtrans/` otomatis aktif sebagai Cloudflare Pages Function.

### Opsi 3: Docker Container Mandiri (VPS / Cloudflare Tunnel)
```bash
cd storefront
docker build -t serbu-storefront .
docker run -d -p 8085:80 --env-file .env --name serbu-storefront serbu-storefront
```
