export type CategorySlug =
  | "all"
  | "sembako"
  | "bumbu"
  | "minuman"
  | "snack"
  | "perawatan"
  | "kebersihan";

export type PackagingShape = "sack" | "pouch" | "bottle" | "box" | "pack" | "tin";

export interface ProductArtworkSpec {
  shape: PackagingShape;
  primary: string;
  secondary: string;
  accent: string;
  badgeText: string;
  subText: string;
}

export interface Product {
  id: string;
  name: string;
  category: Exclude<CategorySlug, "all">;
  categoryLabel: string;
  uom: string;
  weightLabel: string;
  price: number;
  featured?: boolean;
  description: string;
  artwork: ProductArtworkSpec;
}

export type FulfillmentMode = "delivery" | "pickup";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerDetailsInput {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export type OrderPaymentStatus = "pending" | "paid" | "expired" | "cancelled";

export interface OrderItemSnapshot {
  id: string;
  name: string;
  uom: string;
  price: number;
  quantity: number;
}

export interface OrderRecord {
  orderId: string;
  createdAt: string;
  fulfillment: FulfillmentMode;
  items: OrderItemSnapshot[];
  subtotal: number;
  shippingFee: number;
  grossAmount: number;
  customer: CustomerDetailsInput;
  snapToken: string;
  redirectUrl: string;
  paymentStatus: OrderPaymentStatus;
  paymentMethod?: string;
}

export type LegalTopic =
  | "about"
  | "shipping"
  | "terms"
  | "privacy"
  | "refund"
  | "contact";
