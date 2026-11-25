import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Minus, Plus, Store, Truck } from "lucide-react";
import type {
  CartItem,
  CategorySlug,
  FulfillmentMode,
  LegalTopic,
  OrderRecord,
  Product,
} from "./types";
import { CATEGORIES, FREE_DELIVERY_THRESHOLD, PRODUCTS } from "./data/products";
import { formatIDR } from "./utils/format";
import { fetchMidtransOrderStatus, mapMidtransTransactionStatus } from "./services/midtrans";
import { Header } from "./components/Header";
import { ProductArtwork } from "./components/ProductArtwork";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { OrdersModal } from "./components/OrdersModal";
import { LegalModal } from "./components/LegalModal";
import { Footer } from "./components/Footer";

const CART_STORAGE_KEY = "serbu_storefront_cart_v1";
const ORDERS_STORAGE_KEY = "serbu_storefront_orders_v1";

type SortKey = "featured" | "price_asc" | "price_desc" | "name_asc";

function loadStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { id: string; quantity: number }[];
    const mapped: CartItem[] = [];
    for (const entry of parsed) {
      const product = PRODUCTS.find((p) => p.id === entry.id);
      if (product && entry.quantity > 0) {
        mapped.push({ product, quantity: entry.quantity });
      }
    }
    return mapped;
  } catch {
    return [];
  }
}

function loadStoredOrders(): OrderRecord[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OrderRecord[]) : [];
  } catch {
    return [];
  }
}

export const App: React.FC = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategorySlug>("all");
  const [sortBy, setSortBy] = useState<SortKey>("featured");
  const [fulfillment, setFulfillment] = useState<FulfillmentMode>("delivery");

  const [cart, setCart] = useState<CartItem[]>(() => loadStoredCart());
  const [orders, setOrders] = useState<OrderRecord[]>(() => loadStoredOrders());

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [legalTopic, setLegalTopic] = useState<LegalTopic | null>(null);
  const [returnBanner, setReturnBanner] = useState<string | null>(null);

  useEffect(() => {
    const compact = cart.map((c) => ({ id: c.product.id, quantity: c.quantity }));
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(compact));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const refreshOrderStatus = async (orderId: string) => {
    const live = await fetchMidtransOrderStatus(orderId);
    if (!live) return;
    const mappedStatus = mapMidtransTransactionStatus(live.transaction_status, live.fraud_status);
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              paymentStatus: mappedStatus,
              paymentMethod: live.payment_type || o.paymentMethod,
            }
          : o
      )
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnedOrderId = params.get("order_id");
    const txStatus = params.get("transaction_status");
    if (!returnedOrderId) return;

    if (txStatus) {
      const initialMapped = mapMidtransTransactionStatus(txStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderId === returnedOrderId ? { ...o, paymentStatus: initialMapped } : o
        )
      );
    }

    setReturnBanner(`Pesanan ${returnedOrderId} tercatat. Memeriksa status pembayaran terbaru...`);
    setOrdersOpen(true);
    void refreshOrderStatus(returnedOrderId).then(() => {
      setReturnBanner(`Status pesanan ${returnedOrderId} berhasil diperbarui.`);
    });

    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = PRODUCTS.filter((p) => {
      const matchCat = category === "all" || p.category === category;
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    const sorted = [...list];
    if (sortBy === "price_asc") sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") sorted.sort((a, b) => b.price - a.price);
    else if (sortBy === "name_asc") sorted.sort((a, b) => a.name.localeCompare(b.name, "id"));
    else sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

    return sorted;
  }, [search, category, sortBy]);

  const cartQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cart) map.set(item.product.id, item.quantity);
    return map;
  }, [cart]);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((s, i) => s + i.product.price * i.quantity, 0),
    [cart]
  );

  const addProductQty = (product: Product, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (!existing) {
        return delta > 0 ? [...prev, { product, quantity: delta }] : prev;
      }
      const nextQty = existing.quantity + delta;
      if (nextQty <= 0) {
        return prev.filter((i) => i.product.id !== product.id);
      }
      return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: nextQty } : i));
    });
  };

  const updateProductQty = (productId: string, delta: number) => {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (product) addProductQty(product, delta);
  };

  const handleOrderCreated = (order: OrderRecord, usedInlineSnap: boolean) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setCheckoutOpen(false);
    if (usedInlineSnap) {
      setOrdersOpen(true);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        search={search}
        onSearchChange={setSearch}
        cartCount={cartCount}
        cartSubtotal={cartSubtotal}
        ordersCount={orders.length}
        onOpenCart={() => setCartOpen(true)}
        onOpenOrders={() => setOrdersOpen(true)}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-4">
        {returnBanner && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-[#047857]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{returnBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setReturnBanner(null)}
              className="text-xs font-bold underline"
            >
              Tutup
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-gray-200/80 p-1 md:col-span-5">
            <button
              type="button"
              onClick={() => setFulfillment("delivery")}
              className={`flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold transition ${
                fulfillment === "delivery"
                  ? "bg-white text-[#047857] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Truck className="h-4 w-4" />
              <span>Antar ke Alamat</span>
            </button>
            <button
              type="button"
              onClick={() => setFulfillment("pickup")}
              className={`flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold transition ${
                fulfillment === "pickup"
                  ? "bg-white text-[#047857] shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Store className="h-4 w-4" />
              <span>Ambil di Toko</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-[#065f46] to-[#047857] px-4 py-2.5 text-white md:col-span-7">
            <div>
              <div className="text-xs font-bold sm:text-sm">Belanja Harian Diantar Cepat</div>
              <div className="text-[11px] text-emerald-100">
                Gratis Ongkir Kurir Toko min. belanja {formatIDR(FREE_DELIVERY_THRESHOLD)}
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-extrabold text-amber-800">
              Instan 30–60m
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setCategory(cat.slug)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  category === cat.slug
                    ? "border-emerald-300 bg-emerald-50 font-bold text-[#047857]"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <span className="text-xs text-gray-500">{filteredProducts.length} produk</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              aria-label="Urutkan produk"
              className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 focus:border-[#047857] focus:outline-none"
            >
              <option value="featured">Pilihan Utama</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="name_asc">Nama A–Z</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-sm font-bold text-gray-900">Produk tidak ditemukan</p>
            <p className="mt-1 text-xs text-gray-500">
              Coba kata kunci lain atau pilih kategori Semua Produk.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
              className="mt-4 rounded-xl bg-[#047857] px-4 py-2 text-xs font-bold text-white"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const qty = cartQtyMap.get(product.id) || 0;
              return (
                <div
                  key={product.id}
                  className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-3 transition hover:border-emerald-300 hover:shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className="text-left"
                  >
                    <div className="flex h-28 items-center justify-center rounded-lg bg-slate-50">
                      <ProductArtwork spec={product.artwork} size={78} />
                    </div>
                    <div className="mt-2.5 text-[11px] font-semibold text-gray-400">
                      {product.categoryLabel}
                    </div>
                    <h2 className="mt-0.5 line-clamp-2 min-h-8 text-xs font-bold text-gray-900 sm:text-sm">
                      {product.name}
                    </h2>
                    <div className="mt-1.5 flex items-baseline gap-1">
                      <span className="text-sm font-extrabold text-[#047857] sm:text-base">
                        {formatIDR(product.price)}
                      </span>
                      <span className="text-[11px] text-gray-500">/ {product.uom}</span>
                    </div>
                  </button>

                  <div className="mt-3">
                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => addProductQty(product, 1)}
                        className="h-8 w-full rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-bold text-[#047857] transition hover:bg-[#047857] hover:text-white"
                      >
                        + Tambah
                      </button>
                    ) : (
                      <div className="flex h-8 items-center justify-between rounded-lg border border-[#047857] bg-white px-1">
                        <button
                          type="button"
                          onClick={() => addProductQty(product, -1)}
                          aria-label="Kurangi"
                          className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs font-extrabold text-gray-900">{qty}</span>
                        <button
                          type="button"
                          onClick={() => addProductQty(product, 1)}
                          aria-label="Tambah"
                          className="flex h-6 w-6 items-center justify-center rounded bg-[#047857] text-white hover:bg-[#065f46]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {cartCount > 0 && !cartOpen && !checkoutOpen && (
        <div className="sticky bottom-3 z-20 mx-auto mt-6 w-full max-w-md px-4 sm:hidden">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex h-12 w-full items-center justify-between rounded-xl bg-[#047857] px-4 text-white shadow-lg"
          >
            <span className="text-xs font-bold">{cartCount} barang di keranjang</span>
            <span className="text-sm font-extrabold">Lihat · {formatIDR(cartSubtotal)}</span>
          </button>
        </div>
      )}

      <Footer onOpenLegal={setLegalTopic} />

      <ProductDetailModal
        key={selectedProduct?.id || "closed"}
        product={selectedProduct}
        currentCartQty={selectedProduct ? cartQtyMap.get(selectedProduct.id) || 0 : 0}
        onClose={() => setSelectedProduct(null)}
        onAddQty={addProductQty}
      />

      <CartDrawer
        open={cartOpen}
        items={cart}
        fulfillment={fulfillment}
        onFulfillmentChange={setFulfillment}
        onUpdateQty={updateProductQty}
        onClearCart={() => setCart([])}
        onClose={() => setCartOpen(false)}
        onProceedCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        items={cart}
        fulfillment={fulfillment}
        onFulfillmentChange={setFulfillment}
        onClose={() => setCheckoutOpen(false)}
        onOrderCreated={handleOrderCreated}
      />

      <OrdersModal
        open={ordersOpen}
        orders={orders}
        onClose={() => setOrdersOpen(false)}
        onRefreshStatus={refreshOrderStatus}
      />

      <LegalModal
        topic={legalTopic}
        onSelectTopic={setLegalTopic}
        onClose={() => setLegalTopic(null)}
      />
    </div>
  );
};
export default App;
