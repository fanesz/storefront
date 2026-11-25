# ===================================================
# Stage 1: Build Serbu Storefront React App with Bun
# ===================================================
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock* package-lock.json* ./
RUN bun install

COPY . .

ARG VITE_MIDTRANS_CLIENT_KEY=""
ARG VITE_MIDTRANS_IS_PRODUCTION="false"
ENV VITE_MIDTRANS_CLIENT_KEY=$VITE_MIDTRANS_CLIENT_KEY
ENV VITE_MIDTRANS_IS_PRODUCTION=$VITE_MIDTRANS_IS_PRODUCTION

RUN bun run build

# ===================================================
# Stage 2: Serve with lightweight Nginx + Midtrans Proxy
# ===================================================
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker-entrypoint.sh /docker-entrypoint-midtrans.sh
RUN chmod +x /docker-entrypoint-midtrans.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

ENTRYPOINT ["/docker-entrypoint-midtrans.sh"]
CMD ["nginx", "-g", "daemon off;"]
