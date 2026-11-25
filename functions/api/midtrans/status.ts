interface Env {
  MIDTRANS_SERVER_KEY?: string;
  MIDTRANS_IS_PRODUCTION?: string;
}

export const onRequestGet = async (context: { request: Request; env: Env }) => {
  const url = new URL(context.request.url);
  const orderId = (url.searchParams.get("order_id") || "").trim();
  if (!orderId) {
    return Response.json({ error_messages: ["Parameter order_id wajib diisi."] }, { status: 400 });
  }

  const serverKey = (context.env.MIDTRANS_SERVER_KEY || "").trim();
  if (!serverKey) {
    return Response.json(
      { error_messages: ["MIDTRANS_SERVER_KEY belum dikonfigurasi di Cloudflare Pages environment."] },
      { status: 500 }
    );
  }

  const explicitProd = (context.env.MIDTRANS_IS_PRODUCTION || "").toLowerCase() === "true";
  const isProduction = explicitProd || (serverKey.startsWith("Mid-server-") && !serverKey.startsWith("SB-"));
  const apiBaseUrl = isProduction ? "https://api.midtrans.com/v2" : "https://api.sandbox.midtrans.com/v2";

  try {
    const upstream = await fetch(`${apiBaseUrl}/${encodeURIComponent(orderId)}/status`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${btoa(`${serverKey}:`)}`,
      },
    });
    const data = await upstream.json().catch(() => ({}));
    return Response.json(data, { status: upstream.status });
  } catch (err) {
    return Response.json(
      { error_messages: [err instanceof Error ? err.message : "Gagal mengecek status pembayaran."] },
      { status: 502 }
    );
  }
};
