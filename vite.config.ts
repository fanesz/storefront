import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { IncomingMessage, ServerResponse } from "node:http";

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function resolveMidtransConfig(env: Record<string, string>) {
  const serverKey = (env.MIDTRANS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY || "").trim();
  const explicitProd = (env.MIDTRANS_IS_PRODUCTION || process.env.MIDTRANS_IS_PRODUCTION || "").toLowerCase() === "true";
  const isProduction = explicitProd || (serverKey.startsWith("Mid-server-") && !serverKey.startsWith("SB-"));
  const snapUrl = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
  const apiBaseUrl = isProduction
    ? "https://api.midtrans.com/v2"
    : "https://api.sandbox.midtrans.com/v2";
  const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;

  return { serverKey, snapUrl, apiBaseUrl, authHeader };
}

function midtransProxyPlugin(env: Record<string, string>): Plugin {
  const attachMiddleware = (middlewares: {
    use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void;
  }) => {
    middlewares.use(async (req, res, next) => {
      const rawUrl = req.url || "";
      const url = new URL(rawUrl, "http://localhost");

      if (url.pathname === "/api/midtrans/token") {
        if (req.method !== "POST") {
          return sendJson(res, 405, { error_messages: ["Method not allowed"] });
        }

        const { serverKey, snapUrl, authHeader } = resolveMidtransConfig(env);
        if (!serverKey) {
          return sendJson(res, 500, {
            error_messages: ["MIDTRANS_SERVER_KEY belum dikonfigurasi pada environment."],
          });
        }

        try {
          const bodyText = await readRequestBody(req);
          const parsed = JSON.parse(bodyText || "{}");
          const orderId = parsed?.transaction_details?.order_id;
          const grossAmount = Number(parsed?.transaction_details?.gross_amount);

          if (!orderId || !Number.isFinite(grossAmount) || grossAmount < 500) {
            return sendJson(res, 400, {
              error_messages: ["Payload transaksi tidak valid (order_id / gross_amount)."],
            });
          }

          const upstream = await fetch(snapUrl, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
            body: JSON.stringify(parsed),
          });

          const data = await upstream.json().catch(() => ({}));
          return sendJson(res, upstream.status, data);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Gagal menghubungi Midtrans.";
          return sendJson(res, 502, { error_messages: [message] });
        }
      }

      if (url.pathname === "/api/midtrans/status") {
        if (req.method !== "GET") {
          return sendJson(res, 405, { error_messages: ["Method not allowed"] });
        }

        const orderId = (url.searchParams.get("order_id") || "").trim();
        if (!orderId) {
          return sendJson(res, 400, { error_messages: ["Parameter order_id wajib diisi."] });
        }

        const { serverKey, apiBaseUrl, authHeader } = resolveMidtransConfig(env);
        if (!serverKey) {
          return sendJson(res, 500, {
            error_messages: ["MIDTRANS_SERVER_KEY belum dikonfigurasi pada environment."],
          });
        }

        try {
          const upstream = await fetch(`${apiBaseUrl}/${encodeURIComponent(orderId)}/status`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: authHeader,
            },
          });
          const data = await upstream.json().catch(() => ({}));
          return sendJson(res, upstream.status, data);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Gagal mengecek status pembayaran.";
          return sendJson(res, 502, { error_messages: [message] });
        }
      }

      next();
    });
  };

  return {
    name: "serbu-midtrans-proxy",
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss(), midtransProxyPlugin(env)],
    server: {
      host: true,
      port: 5175,
      allowedHosts: true,
    },
    preview: {
      host: true,
      port: 5175,
      allowedHosts: true,
    },
  };
});
