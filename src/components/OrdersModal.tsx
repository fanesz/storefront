import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ReceiptText,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";
import type { OrderPaymentStatus, OrderRecord } from "../types";
import { formatDateTimeID, formatIDR } from "../utils/format";

interface OrdersModalProps {
  open: boolean;
  orders: OrderRecord[];
  onClose: () => void;
  onRefreshStatus: (orderId: string) => Promise<void>;
}

function renderStatusBadge(status: OrderPaymentStatus) {
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-[#047857]">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Lunas · Diproses
      </span>
    );
  }
  if (status === "expired" || status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
        <XCircle className="h-3.5 w-3.5" />
        {status === "expired" ? "Kedaluwarsa" : "Dibatalkan"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
      <Clock className="h-3.5 w-3.5" />
      Menunggu Pembayaran
    </span>
  );
}

export const OrdersModal: React.FC<OrdersModalProps> = ({
  open,
  orders,
  onClose,
  onRefreshStatus,
}) => {
  const [checkingId, setCheckingId] = useState<string | null>(null);

  if (!open) return null;

  const handleCheck = async (orderId: string) => {
    setCheckingId(orderId);
    try {
      await onRefreshStatus(orderId);
    } finally {
      setCheckingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-[#f3f5f7] shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3.5">
          <h2 className="text-base font-bold text-gray-900">Riwayat Pesanan Saya</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pesanan"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#047857]">
                <ReceiptText className="h-7 w-7" />
              </div>
              <p className="mt-3 text-sm font-bold text-gray-900">Belum ada pesanan</p>
              <p className="mt-1 text-xs text-gray-500">
                Pesanan yang telah Anda checkout akan tercatat otomatis di halaman ini.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.orderId}
                className="space-y-3 rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
                  <div>
                    <div className="text-xs font-extrabold text-gray-900">{order.orderId}</div>
                    <div className="mt-0.5 text-[11px] text-gray-500">
                      {formatDateTimeID(order.createdAt)} ·{" "}
                      {order.fulfillment === "delivery" ? "Antar Kurir Toko" : "Ambil di Toko"}
                    </div>
                  </div>
                  {renderStatusBadge(order.paymentStatus)}
                </div>

                <div className="space-y-1 text-xs">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-gray-700">
                      <span className="truncate pr-2">
                        {item.quantity}× {item.name}
                      </span>
                      <span className="shrink-0 font-semibold text-gray-900">
                        {formatIDR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  {order.shippingFee > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span>Ongkos Kirim</span>
                      <span>{formatIDR(order.shippingFee)}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-gray-200 pt-2.5">
                  <div>
                    <span className="text-[11px] text-gray-500">Total Tagihan: </span>
                    <span className="text-sm font-extrabold text-[#047857]">
                      {formatIDR(order.grossAmount)}
                    </span>
                    {order.paymentMethod && (
                      <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-600">
                        {order.paymentMethod.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={checkingId === order.orderId}
                      onClick={() => handleCheck(order.orderId)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${
                          checkingId === order.orderId ? "animate-spin" : ""
                        }`}
                      />
                      Cek Status
                    </button>

                    {order.paymentStatus === "pending" && order.redirectUrl && (
                      <a
                        href={order.redirectUrl}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#047857] px-3 text-xs font-bold text-white no-underline hover:bg-[#065f46]"
                      >
                        Bayar
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
