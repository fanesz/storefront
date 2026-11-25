import React, { useState } from "react";
import {
  AlertCircle,
  Building2,
  Loader2,
  Lock,
  MapPin,
  QrCode,
  Store,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import type { CartItem, CustomerDetailsInput, FulfillmentMode, OrderRecord } from "../types";
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, STORE_INFO } from "../data/products";
import { formatIDR, generateOrderId, loadMidtransSnapIfConfigured } from "../utils/format";
import { createMidtransSnapTransaction } from "../services/midtrans";

interface CheckoutModalProps {
  open: boolean;
  items: CartItem[];
  fulfillment: FulfillmentMode;
  onFulfillmentChange: (mode: FulfillmentMode) => void;
  onClose: () => void;
  onOrderCreated: (order: OrderRecord, usedInlineSnap: boolean) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  open,
  items,
  fulfillment,
  onFulfillmentChange,
  onClose,
  onOrderCreated,
}) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open || items.length === 0) return null;

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shippingFee =
    fulfillment === "pickup" || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const grossAmount = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Nama penerima wajib diisi.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMsg("Nomor telepon / WhatsApp aktif wajib diisi.");
      return;
    }
    if (fulfillment === "delivery" && !address.trim()) {
      setErrorMsg("Alamat lengkap pengiriman wajib diisi untuk pengantaran kurir toko.");
      return;
    }

    const customer: CustomerDetailsInput = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || "pelanggan@serbuminimarket.id",
      address:
        fulfillment === "delivery" ? address.trim() : `${STORE_INFO.branch}, ${STORE_INFO.address}`,
      notes: notes.trim(),
    };

    const orderId = generateOrderId();
    setSubmitting(true);

    try {
      const snapRes = await createMidtransSnapTransaction({
        orderId,
        items,
        shippingFee,
        fulfillment,
        customer,
      });

      const orderRecord: OrderRecord = {
        orderId,
        createdAt: new Date().toISOString(),
        fulfillment,
        items: items.map(({ product, quantity }) => ({
          id: product.id,
          name: product.name,
          uom: product.uom,
          price: product.price,
          quantity,
        })),
        subtotal,
        shippingFee,
        grossAmount,
        customer,
        snapToken: snapRes.token,
        redirectUrl: snapRes.redirect_url,
        paymentStatus: "pending",
      };

      const canUsePopup = await loadMidtransSnapIfConfigured();
      if (canUsePopup && window.snap) {
        onOrderCreated(orderRecord, true);
        window.snap.pay(snapRes.token, {
          onSuccess: () => {
            window.location.assign(`/?order_id=${encodeURIComponent(orderId)}&transaction_status=settlement`);
          },
          onPending: () => {
            window.location.assign(`/?order_id=${encodeURIComponent(orderId)}&transaction_status=pending`);
          },
        });
      } else {
        onOrderCreated(orderRecord, false);
        window.location.assign(snapRes.redirect_url);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pembayaran.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={() => !submitting && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[94dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-[#f3f5f7] shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3.5">
          <h2 className="text-base font-bold text-gray-900">Checkout Pesanan</h2>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            aria-label="Tutup checkout"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-3.5">
            <div className="mb-2.5 text-xs font-bold text-gray-900">Metode Penerimaan Pesanan</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onFulfillmentChange("delivery")}
                className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs transition ${
                  fulfillment === "delivery"
                    ? "border-[#047857] bg-emerald-50 font-bold text-[#047857]"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Truck className="h-4 w-4 shrink-0" />
                <div>
                  <div>Antar Kurir Toko</div>
                  <div className="text-[11px] font-normal text-gray-500">30–60 menit</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onFulfillmentChange("pickup")}
                className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs transition ${
                  fulfillment === "pickup"
                    ? "border-[#047857] bg-emerald-50 font-bold text-[#047857]"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Store className="h-4 w-4 shrink-0" />
                <div>
                  <div>Ambil di Toko</div>
                  <div className="text-[11px] font-normal text-gray-500">Gratis · 15 menit</div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
              <MapPin className="h-4 w-4 text-[#047857]" />
              <span>Data Penerima {fulfillment === "delivery" ? "& Alamat Pengiriman" : ""}</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="h-9 w-full rounded-lg border border-gray-300 px-3 text-xs text-gray-900 focus:border-[#047857] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  No. WhatsApp / Telepon *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="h-9 w-full rounded-lg border border-gray-300 px-3 text-xs text-gray-900 focus:border-[#047857] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Email (untuk bukti pembayaran)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="h-9 w-full rounded-lg border border-gray-300 px-3 text-xs text-gray-900 focus:border-[#047857] focus:outline-none"
              />
            </div>

            {fulfillment === "delivery" ? (
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Alamat Lengkap Pengiriman *
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#047857] focus:outline-none"
                />
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-2.5 text-xs text-emerald-950">
                <div className="font-bold">{STORE_INFO.branch}</div>
                <div className="mt-0.5 text-gray-600">
                  {STORE_INFO.address} ({STORE_INFO.hours})
                </div>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Catatan Pesanan (opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Patokan rumah atau instruksi pesanan"
                className="h-9 w-full rounded-lg border border-gray-300 px-3 text-xs text-gray-900 focus:border-[#047857] focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3.5">
            <div className="mb-2 text-xs font-bold text-gray-900">
              Ringkasan Pesanan ({totalItems} barang)
            </div>
            <div className="space-y-1.5 text-xs">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-gray-700">
                  <span className="truncate pr-3">
                    {quantity}× {product.name}
                  </span>
                  <span className="shrink-0 font-bold text-gray-900">
                    {formatIDR(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">Metode Pembayaran</span>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                via Midtrans
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 p-2 font-semibold text-gray-800">
                <QrCode className="h-4 w-4 shrink-0 text-[#047857]" />
                <span>QRIS</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 p-2 font-semibold text-gray-800">
                <Wallet className="h-4 w-4 shrink-0 text-[#047857]" />
                <span>E-Wallet</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 p-2 font-semibold text-gray-800">
                <Building2 className="h-4 w-4 shrink-0 text-[#047857]" />
                <span>Virtual Acc</span>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-gray-500">
              Anda akan diarahkan ke halaman pembayaran aman Midtrans untuk memilih QRIS, GoPay,
              ShopeePay, atau Virtual Account Bank.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3.5 text-xs">
            <div className="mb-2 font-bold text-gray-900">Rincian Pembayaran</div>
            <div className="space-y-1.5 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal Produk ({totalItems} barang)</span>
                <span className="font-semibold text-gray-900">{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim</span>
                <span className="font-semibold text-gray-900">
                  {shippingFee === 0 ? "Gratis" : formatIDR(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Layanan</span>
                <span className="font-bold text-[#047857]">Gratis</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-gray-200 pt-2 text-sm font-bold text-gray-900">
                <span>Total Pembayaran</span>
                <span className="text-base font-extrabold text-[#047857]">
                  {formatIDR(grossAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold text-gray-500">Total Pembayaran</div>
              <div className="text-lg font-extrabold text-gray-900">{formatIDR(grossAmount)}</div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 min-w-44 items-center justify-center gap-2 rounded-xl bg-[#047857] px-5 text-sm font-bold text-white transition hover:bg-[#065f46] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Bayar Sekarang"
              )}
            </button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-gray-500">
            <Lock className="h-3 w-3" />
            <span>Transaksi dienkripsi &amp; diproses aman oleh Midtrans</span>
          </div>
        </div>
      </form>
    </div>
  );
};
