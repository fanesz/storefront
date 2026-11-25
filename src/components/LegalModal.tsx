import React from "react";
import { X } from "lucide-react";
import type { LegalTopic } from "../types";
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, STORE_INFO } from "../data/products";
import { formatIDR } from "../utils/format";

interface LegalModalProps {
  topic: LegalTopic | null;
  onSelectTopic: (topic: LegalTopic) => void;
  onClose: () => void;
}

const TOPICS: { key: LegalTopic; label: string }[] = [
  { key: "about", label: "Tentang Kami" },
  { key: "shipping", label: "Pengiriman" },
  { key: "terms", label: "Syarat & Ketentuan" },
  { key: "privacy", label: "Kebijakan Privasi" },
  { key: "refund", label: "Pengembalian & Refund" },
  { key: "contact", label: "Hubungi Kami" },
];

export const LegalModal: React.FC<LegalModalProps> = ({ topic, onSelectTopic, onClose }) => {
  if (!topic) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3.5">
          <h2 className="text-base font-bold text-gray-900">Informasi &amp; Kebijakan Layanan</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup informasi"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto border-b border-gray-200 bg-gray-50 px-4 py-2.5">
          {TOPICS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectTopic(item.key)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                topic === item.key
                  ? "bg-[#047857] text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5 text-xs leading-relaxed text-gray-700">
          {topic === "about" && (
            <>
              <h3 className="text-sm font-bold text-gray-900">Tentang {STORE_INFO.name}</h3>
              <p>
                <strong>{STORE_INFO.name}</strong> adalah gerai ritel kebutuhan sehari-hari yang
                menyediakan sembako, minyak goreng, bumbu dapur, minuman, makanan ringan, perawatan
                diri, serta perlengkapan kebersihan rumah tangga dengan harga transparan dalam mata
                uang Rupiah (IDR).
              </p>
              <p>
                Melalui layanan belanja online ini, pelanggan dapat memesan produk langsung dari
                gerai fisik kami untuk diantar ke rumah oleh kurir toko maupun diambil sendiri di
                gerai tanpa antre.
              </p>
            </>
          )}

          {topic === "shipping" && (
            <>
              <h3 className="text-sm font-bold text-gray-900">
                Kebijakan Pemesanan &amp; Pengiriman
              </h3>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <strong>Antar Kurir Toko:</strong> Pesanan diproses segera setelah pembayaran
                  terkonfirmasi lunas dan dikirim oleh kurir toko dengan estimasi tiba{" "}
                  {STORE_INFO.deliveryEstimate} pada jam operasional ({STORE_INFO.hours}).
                </li>
                <li>
                  <strong>Biaya Pengiriman:</strong> Tarif flat {formatIDR(DELIVERY_FEE)} per
                  pesanan, dan <strong>Gratis Ongkir</strong> otomatis untuk belanja minimal{" "}
                  {formatIDR(FREE_DELIVERY_THRESHOLD)}.
                </li>
                <li>
                  <strong>Ambil di Toko (Pickup):</strong> Bebas biaya pengiriman. Pesanan disiapkan
                  dalam waktu ±15 menit setelah pembayaran berhasil dan dapat diambil di{" "}
                  {STORE_INFO.branch} ({STORE_INFO.address}).
                </li>
              </ul>
            </>
          )}

          {topic === "terms" && (
            <>
              <h3 className="text-sm font-bold text-gray-900">Syarat &amp; Ketentuan Layanan</h3>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  Seluruh harga produk yang tertera pada katalog {STORE_INFO.name} menggunakan mata
                  uang Rupiah Indonesia (IDR) dan sudah termasuk pajak yang berlaku.
                </li>
                <li>
                  Pesanan diproses secara otomatis setelah sistem menerima konfirmasi pembayaran
                  berhasil (<em>settlement</em>) dari gerbang pembayaran resmi Midtrans.
                </li>
                <li>
                  Pelanggan wajib mencantumkan nama penerima, nomor telepon/WhatsApp aktif, dan
                  alamat pengiriman yang benar agar pengantaran berjalan tepat waktu.
                </li>
                <li>
                  Apabila pembayaran tidak diselesaikan hingga batas waktu yang ditentukan pada
                  halaman pembayaran, pesanan akan otomatis kedaluwarsa.
                </li>
              </ul>
            </>
          )}

          {topic === "privacy" && (
            <>
              <h3 className="text-sm font-bold text-gray-900">Kebijakan Privasi Pelanggan</h3>
              <p>
                {STORE_INFO.name} menjaga kerahasiaan data pribadi pelanggan (nama, nomor telepon,
                alamat email, dan alamat pengiriman). Data tersebut hanya digunakan untuk keperluan
                pemrosesan transaksi, pengiriman barang, konfirmasi pesanan, serta layanan bantuan
                pelanggan.
              </p>
              <p>
                Pemrosesan pembayaran non-tunai dijalankan melalui infrastruktur berstandar
                keamanan industri milik <strong>Midtrans</strong>. {STORE_INFO.name} tidak menyimpan
                kredensial kartu maupun PIN pembayaran pelanggan.
              </p>
            </>
          )}

          {topic === "refund" && (
            <>
              <h3 className="text-sm font-bold text-gray-900">
                Kebijakan Pengembalian Barang &amp; Pengembalian Dana (Refund)
              </h3>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  Pelanggan berhak mengajukan penukaran barang atau pengembalian dana (
                  <em>refund</em>) apabila produk yang diterima rusak kemasan, kedaluwarsa, atau
                  tidak sesuai pesanan.
                </li>
                <li>
                  Laporan kendala wajib disampaikan maksimal <strong>1×24 jam</strong> sejak pesanan
                  diterima dengan menyertakan nomor pesanan (<code>SRB-...</code>) dan foto produk
                  melalui kontak layanan pelanggan kami.
                </li>
                <li>
                  Apabila stok pengganti tidak tersedia, pengembalian dana penuh sesuai nominal item
                  akan diproses kembali ke rekening atau metode pembayaran pelanggan dalam waktu{" "}
                  <strong>1–3 hari kerja</strong> setelah verifikasi disetujui.
                </li>
              </ul>
            </>
          )}

          {topic === "contact" && (
            <>
              <h3 className="text-sm font-bold text-gray-900">Hubungi Kami</h3>
              <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div>
                  <strong>Nama Usaha:</strong> {STORE_INFO.name}
                </div>
                <div>
                  <strong>Alamat Gerai:</strong> {STORE_INFO.address}
                </div>
                <div>
                  <strong>Jam Operasional:</strong> {STORE_INFO.hours}
                </div>
                <div>
                  <strong>Telepon / WhatsApp Layanan Pelanggan:</strong> {STORE_INFO.phone}
                </div>
                <div>
                  <strong>Email Resmi:</strong> {STORE_INFO.email}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
