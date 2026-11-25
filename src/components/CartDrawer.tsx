import React from "react";
import { Info, Minus, Plus, ShoppingBag, Store, Trash2, Truck, X } from "lucide-react";
import type { CartItem, FulfillmentMode } from "../types";
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, STORE_INFO } from "../data/products";
import { formatIDR } from "../utils/format";
import { ProductArtwork } from "./ProductArtwork";

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  fulfillment: FulfillmentMode;
  onFulfillmentChange: (mode: FulfillmentMode) => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onClearCart: () => void;
  onClose: () => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  items,
  fulfillment,
  onFulfillmentChange,
  onUpdateQty,
  onClearCart,
  onClose,
  onProceedCheckout,
}) => {
  if (!open) return null;

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const remainingForFreeShip = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const shippingFee =
    fulfillment === "pickup" || subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : DELIVERY_FEE;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-md flex-col bg-[#f3f5f7] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3.5">
          <h2 className="text-base font-bold text-gray-900">
            Keranjang Belanja {totalCount > 0 ? `(${totalCount})` : ""}
          </h2>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Kosongkan
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup keranjang"
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-white p-1.5">
            <button
              type="button"
              onClick={() => onFulfillmentChange("delivery")}
              className={`rounded-lg p-2.5 text-left transition ${
                fulfillment === "delivery"
                  ? "border border-[#047857] bg-emerald-50"
                  : "border border-transparent hover:bg-gray-50"
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-xs font-bold ${
                  fulfillment === "delivery" ? "text-[#047857]" : "text-gray-600"
                }`}
              >
                <Truck className="h-4 w-4" />
                Antar ke Alamat
              </div>
              <div className="mt-0.5 pl-5 text-[11px] text-gray-500">Estimasi 30–60 menit</div>
            </button>

            <button
              type="button"
              onClick={() => onFulfillmentChange("pickup")}
              className={`rounded-lg p-2.5 text-left transition ${
                fulfillment === "pickup"
                  ? "border border-[#047857] bg-emerald-50"
                  : "border border-transparent hover:bg-gray-50"
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-xs font-bold ${
                  fulfillment === "pickup" ? "text-[#047857]" : "text-gray-600"
                }`}
              >
                <Store className="h-4 w-4" />
                Ambil di Toko
              </div>
              <div className="mt-0.5 pl-5 text-[11px] text-gray-500">Gratis, siap 15 menit</div>
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#047857]">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <p className="mt-3 text-sm font-bold text-gray-900">Keranjang masih kosong</p>
              <p className="mt-1 text-xs text-gray-500">
                Pilih produk kebutuhan harian dari katalog untuk mulai berbelanja.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 rounded-xl bg-[#047857] px-4 py-2 text-xs font-bold text-white hover:bg-[#065f46]"
              >
                Lihat Katalog Produk
              </button>
            </div>
          ) : (
            <>
              {fulfillment === "delivery" && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-900">
                  {remainingForFreeShip > 0 ? (
                    <span>
                      Tambah belanja <strong>{formatIDR(remainingForFreeShip)}</strong> lagi untuk{" "}
                      <strong>Gratis Ongkir Kurir Toko</strong>.
                    </span>
                  ) : (
                    <span className="font-semibold text-[#047857]">
                      Selamat! Pesanan Anda mendapat Gratis Ongkir Kurir Toko.
                    </span>
                  )}
                </div>
              )}

              <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white px-3.5">
                <div className="flex items-center gap-2 py-3 text-xs font-bold text-gray-900">
                  <Store className="h-4 w-4 text-[#047857]" />
                  <span>{STORE_INFO.branch}</span>
                </div>

                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3 py-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                      <ProductArtwork spec={product.artwork} size={46} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-bold text-gray-900">{product.name}</div>
                      <div className="mt-0.5 text-[11px] text-gray-500">
                        {formatIDR(product.price)} / {product.uom}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-gray-900">
                          {formatIDR(product.price * quantity)}
                        </span>
                        <div className="flex h-7 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-1">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(product.id, -1)}
                            aria-label="Kurangi"
                            className="flex h-5 w-5 items-center justify-center rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-4 text-center text-xs font-bold text-gray-900">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(product.id, 1)}
                            aria-label="Tambah"
                            className="flex h-5 w-5 items-center justify-center rounded bg-[#047857] text-white hover:bg-[#065f46]"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#047857]" />
                <span>
                  Harga dan ketersediaan stok tersinkronisasi langsung dengan sistem gerai{" "}
                  {STORE_INFO.name}.
                </span>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalCount} barang)</span>
                <span className="font-semibold text-gray-900">{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimasi Ongkos Kirim</span>
                <span className="font-semibold text-[#047857]">
                  {shippingFee === 0 ? "Gratis" : formatIDR(shippingFee)}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-dashed border-gray-200 pt-2">
                <span className="text-sm font-bold text-gray-900">Total Tagihan</span>
                <span className="text-lg font-extrabold text-gray-900">
                  {formatIDR(subtotal + shippingFee)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedCheckout}
              className="mt-3 h-11 w-full rounded-xl bg-[#047857] text-sm font-bold text-white transition hover:bg-[#065f46]"
            >
              Lanjut ke Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
