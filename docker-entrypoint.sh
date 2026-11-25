#!/bin/sh
set -e

SERVER_KEY="${MIDTRANS_SERVER_KEY:-}"
IS_PROD="${MIDTRANS_IS_PRODUCTION:-false}"

if [ "$IS_PROD" = "true" ]; then
  SNAP_HOST="app.midtrans.com"
  API_HOST="api.midtrans.com"
else
  SNAP_HOST="app.sandbox.midtrans.com"
  API_HOST="api.sandbox.midtrans.com"
fi

AUTH_B64=$(printf "%s:" "$SERVER_KEY" | base64 | tr -d '\n')

cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location = /api/midtrans/token {
        resolver 1.1.1.1 8.8.8.8 valid=300s ipv6=off;
        proxy_ssl_server_name on;
        proxy_set_header Host ${SNAP_HOST};
        proxy_set_header Accept "application/json";
        proxy_set_header Content-Type "application/json";
        proxy_set_header Authorization "Basic ${AUTH_B64}";
        proxy_pass https://${SNAP_HOST}/snap/v1/transactions;
    }

    location = /api/midtrans/status {
        resolver 1.1.1.1 8.8.8.8 valid=300s ipv6=off;
        proxy_ssl_server_name on;
        proxy_set_header Host ${API_HOST};
        proxy_set_header Accept "application/json";
        proxy_set_header Authorization "Basic ${AUTH_B64}";
        proxy_pass https://${API_HOST}/v2/\$arg_order_id/status;
    }
}
EOF

exec "$@"
