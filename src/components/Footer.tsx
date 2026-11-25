import React from "react";
import { Clock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import type { LegalTopic } from "../types";
import { STORE_INFO } from "../data/products";

interface FooterProps {
  onOpenLegal: (topic: LegalTopic) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white text-gray-600">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#047857] text-sm font-black text-white">
                S
              </div>
              <span className="text-sm font-extrabold text-gray-900">{STORE_INFO.name}</span>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-gray-600">{STORE_INFO.tagline}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-[#047857]">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Pembayaran Non-Tunai Resmi via Midtrans</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-gray-900">Informasi &amp; Kebijakan</div>
            <ul className="mt-2.5 space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal("about")}
                  className="text-gray-600 hover:font-semibold hover:text-[#047857]"
                >
                  Tentang {STORE_INFO.name}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal("shipping")}
                  className="text-gray-600 hover:font-semibold hover:text-[#047857]"
                >
                  Cara Belanja &amp; Kebijakan Pengiriman
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal("terms")}
                  className="text-gray-600 hover:font-semibold hover:text-[#047857]"
                >
                  Syarat &amp; Ketentuan Layanan
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal("privacy")}
                  className="text-gray-600 hover:font-semibold hover:text-[#047857]"
                >
                  Kebijakan Privasi
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal("refund")}
                  className="text-gray-600 hover:font-semibold hover:text-[#047857]"
                >
                  Kebijakan Pengembalian &amp; Refund
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold text-gray-900">Kontak &amp; Lokasi Gerai</div>
            <div className="mt-2.5 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#047857]" />
                <span>{STORE_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0 text-[#047857]" />
                <span>{STORE_INFO.hours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-[#047857]" />
                <span>{STORE_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#047857]" />
                <span>{STORE_INFO.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-gray-200 pt-4 text-[11px] text-gray-500 sm:flex-row">
          <span>
            &copy; {new Date().getFullYear()} {STORE_INFO.name}. Seluruh harga dalam Rupiah (IDR).
          </span>
          <span>Metode Pembayaran: QRIS · GoPay · ShopeePay · Virtual Account Bank</span>
        </div>
      </div>
    </footer>
  );
};
