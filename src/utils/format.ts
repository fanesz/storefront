export function formatIDR(amount: number): string {
  const rounded = Math.round(amount);
  return `Rp ${rounded.toLocaleString("id-ID")}`;
}

export function generateOrderId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SRB-${y}${m}${d}-${rand}`;
}

export function formatDateTimeID(iso: string): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: Record<string, unknown>) => void;
          onPending?: (result: Record<string, unknown>) => void;
          onError?: (result: Record<string, unknown>) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

let snapScriptPromise: Promise<boolean> | null = null;

export function loadMidtransSnapIfConfigured(): Promise<boolean> {
  const clientKey = (import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "").trim();
  if (!clientKey) {
    return Promise.resolve(false);
  }
  if (window.snap) {
    return Promise.resolve(true);
  }
  if (snapScriptPromise) {
    return snapScriptPromise;
  }

  const isProd = (import.meta.env.VITE_MIDTRANS_IS_PRODUCTION || "").toLowerCase() === "true";
  const src = isProd
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  snapScriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    script.onload = () => resolve(Boolean(window.snap));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return snapScriptPromise;
}
