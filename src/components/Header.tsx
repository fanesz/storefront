import React from "react";
import { MapPin, ReceiptText, Search, ShoppingCart, X } from "lucide-react";
import { STORE_INFO } from "../data/products";
import { formatIDR } from "../utils/format";

interface HeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  cartCount: number;
  cartSubtotal: number;
  ordersCount: number;
  onOpenCart: () => void;
  onOpenOrders: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  search,
  onSearchChange,
  cartCount,
  cartSubtotal,
  ordersCount,
  onOpenCart,
  onOpenOrders,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#047857] text-white shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2.5 text-white no-underline">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-black text-[#047857] shadow-xs">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight">{STORE_INFO.name}</span>
                <span className="hidden rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-50 sm:inline-block">
                  Buka · 07.00–22.00 WIB
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-emerald-100">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-200" />
                <span className="truncate">{STORE_INFO.address}</span>
              </div>
            </div>
          </a>

          <div className="hidden max-w-md flex-1 md:block">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari beras, minyak goreng, kecap, sabun..."
                className="h-10 w-full rounded-xl bg-white pr-9 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-300 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-2.5 rounded-md p-0.5 text-gray-400 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenOrders}
              className="relative flex h-10 items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <ReceiptText className="h-4 w-4" />
              <span className="hidden sm:inline">Pesanan</span>
              {ordersCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[11px] font-bold text-gray-900">
                  {ordersCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="flex h-10 items-center gap-2 rounded-xl bg-white px-3.5 text-xs font-bold text-[#047857] shadow-xs transition hover:bg-emerald-50"
            >
              <div className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#047857] px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">
                {cartCount > 0 ? formatIDR(cartSubtotal) : "Keranjang"}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-2.5 md:hidden">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari beras, minyak goreng, kecap, sabun..."
              className="h-9 w-full rounded-xl bg-white pr-8 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-300 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Hapus pencarian"
                className="absolute right-2.5 rounded-md p-0.5 text-gray-400 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
