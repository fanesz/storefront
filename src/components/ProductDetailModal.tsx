import React, { useState } from "react";
import { Minus, Plus, Store, Truck, X } from "lucide-react";
import type { Product } from "../types";
import { STORE_INFO } from "../data/products";
import { formatIDR } from "../utils/format";
import { ProductArtwork } from "./ProductArtwork";

interface ProductDetailModalProps {
  product: Product | null;
  currentCartQty: number;
  onClose: () => void;
  onAddQty: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currentCartQty,
  onClose,
  onAddQty,
}) => {
  const [qty, setQty] = useState(1);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-bold text-gray-900">Detail Produk</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div className="relative flex h-52 items-center justify-center rounded-xl border border-gray-200 bg-gradient-to-b from-white to-emerald-50/70">
            <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-xs font-bold text-[#047857]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Stok Tersedia
            </span>
            <ProductArtwork spec={product.artwork} size={140} />
          </div>

          <div>
            <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#047857]">
              {product.categoryLabel}
            </span>
            <h3 className="mt-2 text-lg font-extrabold text-gray-900">{product.name}</h3>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#047857]">
                {formatIDR(product.price)}
              </span>
              <span className="text-xs font-semibold text-gray-500">
                Satuan: {product.uom} · {product.weightLabel}
              </span>
            </div>
            {currentCartQty > 0 && (
              <p className="mt-1.5 text-xs font-semibold text-emerald-700">
                Sudah ada {currentCartQty} {product.uom} di keranjang Anda
              </p>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[#047857]">
              <Store className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-gray-900">{STORE_INFO.branch}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-[#047857]" />
                  {STORE_INFO.deliveryEstimate}
                </span>
                <span>• {STORE_INFO.pickupEstimate}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-3.5">
            <div className="text-xs font-bold text-gray-900">Deskripsi Produk</div>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{product.description}</p>
            <div className="mt-3 divide-y divide-dashed divide-gray-200 border-t border-gray-200 pt-2 text-xs">
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Kode SKU</span>
                <span className="font-semibold text-gray-900">{product.id}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Kategori</span>
                <span className="font-semibold text-gray-900">{product.categoryLabel}</span>
              </div>
              <div className="flex justify-between pt-1.5">
                <span className="text-gray-500">Satuan Jual</span>
                <span className="font-semibold text-gray-900">
                  {product.uom} ({product.weightLabel})
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-gray-200 bg-white p-4">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-1.5">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Kurangi jumlah"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-6 text-center text-sm font-bold text-gray-900">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Tambah jumlah"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-[#047857] hover:bg-emerald-100"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onAddQty(product, qty);
              onClose();
            }}
            className="h-11 flex-1 rounded-xl bg-[#047857] px-4 text-sm font-bold text-white transition hover:bg-[#065f46]"
          >
            Tambah ke Keranjang · {formatIDR(product.price * qty)}
          </button>
        </div>
      </div>
    </div>
  );
};
