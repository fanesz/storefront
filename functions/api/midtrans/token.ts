interface Env {
  MIDTRANS_SERVER_KEY?: string;
  MIDTRANS_IS_PRODUCTION?: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const serverKey = (context.env.MIDTRANS_SERVER_KEY || "").trim();
  if (!serverKey) {
    return Response.json(
      { error_messages: ["MIDTRANS_SERVER_KEY belum dikonfigurasi di Cloudflare Pages environment."] },
      { status: 500 }
    );
  }

  const explicitProd = (context.env.MIDTRANS_IS_PRODUCTION || "").toLowerCase() === "true";
  const isProduction = explicitProd || (serverKey.startsWith("Mid-server-") && !serverKey.startsWith("SB-"));
  const snapUrl = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  try {
    const payload = (await context.request.json()) as {
      transaction_details?: { order_id?: string; gross_amount?: number };
    };
    const orderId = payload?.transaction_details?.order_id;
    const grossAmount = Number(payload?.transaction_details?.gross_amount);

    if (!orderId || !Number.isFinite(grossAmount) || grossAmount < 500) {
      return Response.json(
        { error_messages: ["Payload transaksi tidak valid (order_id / gross_amount)."] },
        { status: 400 }
      );
    }

    const upstream = await fetch(snapUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${serverKey}:`)}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await upstream.json().catch(() => ({}));
    return Response.json(data, { status: upstream.status });
  } catch (err) {
    return Response.json(
      { error_messages: [err instanceof Error ? err.message : "Gagal menghubungi Midtrans."] },
      { status: 502 }
    );
  }
};
