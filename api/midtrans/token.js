export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error_messages: ["Method not allowed"] });
  }

  const serverKey = (process.env.MIDTRANS_SERVER_KEY || "").trim();
  if (!serverKey) {
    return res.status(500).json({
      error_messages: ["MIDTRANS_SERVER_KEY belum dikonfigurasi di environment variables."],
    });
  }

  const explicitProd = (process.env.MIDTRANS_IS_PRODUCTION || "").toLowerCase() === "true";
  const isProduction = explicitProd || (serverKey.startsWith("Mid-server-") && !serverKey.startsWith("SB-"));
  const snapUrl = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const orderId = payload?.transaction_details?.order_id;
    const grossAmount = Number(payload?.transaction_details?.gross_amount);

    if (!orderId || !Number.isFinite(grossAmount) || grossAmount < 500) {
      return res.status(400).json({
        error_messages: ["Payload transaksi tidak valid (order_id / gross_amount)."],
      });
    }

    const auth = Buffer.from(`${serverKey}:`).toString("base64");
    const upstream = await fetch(snapUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await upstream.json().catch(() => ({}));
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({
      error_messages: [err instanceof Error ? err.message : "Gagal menghubungi Midtrans."],
    });
  }
}
