import type { CartItem, CustomerDetailsInput, FulfillmentMode, OrderPaymentStatus } from "../types";

export interface CreateSnapResult {
  token: string;
  redirect_url: string;
}

export interface MidtransStatusResponse {
  status_code?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
  order_id?: string;
  gross_amount?: string;
}

export async function createMidtransSnapTransaction(params: {
  orderId: string;
  items: CartItem[];
  shippingFee: number;
  fulfillment: FulfillmentMode;
  customer: CustomerDetailsInput;
}): Promise<CreateSnapResult> {
  const { orderId, items, shippingFee, fulfillment, customer } = params;

  const itemDetails = items.map(({ product, quantity }) => ({
    id: product.id.slice(0, 50),
    price: Math.round(product.price),
    quantity,
    name: product.name.slice(0, 50),
    category: product.categoryLabel.slice(0, 50),
    merchant_name: "Minimarket Serbu",
  }));

  if (shippingFee > 0) {
    itemDetails.push({
      id: "ONGKIR-KURIR",
      price: Math.round(shippingFee),
      quantity: 1,
      name: "Ongkos Kirim Kurir Toko Serbu",
      category: "Pengiriman",
      merchant_name: "Minimarket Serbu",
    });
  }

  const grossAmount = itemDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cleanName = customer.fullName.trim() || "Pelanggan Serbu";
  const cleanPhone = customer.phone.trim();
  const cleanEmail = customer.email.trim() || "pelanggan@serbuminimarket.id";
  const finishUrl = `${window.location.origin}/?order_id=${encodeURIComponent(orderId)}`;

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    item_details: itemDetails,
    customer_details: {
      first_name: cleanName.slice(0, 50),
      email: cleanEmail,
      phone: cleanPhone,
      shipping_address: {
        first_name: cleanName.slice(0, 50),
        phone: cleanPhone,
        address:
          fulfillment === "delivery"
            ? customer.address.trim().slice(0, 200)
            : "Ambil di Toko — Minimarket Serbu Gerai Utama",
        city: "Palembang",
        country_code: "IDN",
      },
    },
    callbacks: {
      finish: finishUrl,
    },
  };

  const response = await fetch("/api/midtrans/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as {
    token?: string;
    redirect_url?: string;
    error_messages?: string[];
  };

  if (!response.ok || !data.token || !data.redirect_url) {
    const msg =
      data.error_messages?.join(", ") ||
      `Gagal membuat sesi pembayaran Midtrans (HTTP ${response.status}).`;
    throw new Error(msg);
  }

  return {
    token: data.token,
    redirect_url: data.redirect_url,
  };
}

export function mapMidtransTransactionStatus(txStatus?: string, fraudStatus?: string): OrderPaymentStatus {
  const s = (txStatus || "").toLowerCase();
  if (s === "settlement") return "paid";
  if (s === "capture") return fraudStatus === "challenge" ? "pending" : "paid";
  if (s === "expire") return "expired";
  if (s === "cancel" || s === "deny" || s === "failure") return "cancelled";
  return "pending";
}

export async function fetchMidtransOrderStatus(orderId: string): Promise<MidtransStatusResponse | null> {
  try {
    const res = await fetch(`/api/midtrans/status?order_id=${encodeURIComponent(orderId)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as MidtransStatusResponse;
    if (!data.transaction_status) return null;
    return data;
  } catch {
    return null;
  }
}
