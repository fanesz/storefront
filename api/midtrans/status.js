export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error_messages: ["Method not allowed"] });
  }

  const orderId = String(req.query?.order_id || "").trim();
  if (!orderId) {
    return res.status(400).json({ error_messages: ["Parameter order_id wajib diisi."] });
  }

  const serverKey = (process.env.MIDTRANS_SERVER_KEY || "").trim();
  if (!serverKey) {
    return res.status(500).json({
      error_messages: ["MIDTRANS_SERVER_KEY belum dikonfigurasi di environment variables."],
    });
  }

  const explicitProd = (process.env.MIDTRANS_IS_PRODUCTION || "").toLowerCase() === "true";
  const isProduction = explicitProd || (serverKey.startsWith("Mid-server-") && !serverKey.startsWith("SB-"));
  const apiBaseUrl = isProduction ? "https://api.midtrans.com/v2" : "https://api.sandbox.midtrans.com/v2";

  try {
    const auth = Buffer.from(`${serverKey}:`).toString("base64");
    const upstream = await fetch(`${apiBaseUrl}/${encodeURIComponent(orderId)}/status`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${auth}`,
      },
    });
    const data = await upstream.json().catch(() => ({}));
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({
      error_messages: [err instanceof Error ? err.message : "Gagal mengecek status pembayaran."],
    });
  }
}
