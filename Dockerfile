# Use lightweight Nginx alpine image
FROM nginx:alpine

# Copy static assets to Nginx default html serving directory
COPY src/* /usr/share/nginx/html/

# Create health check endpoint
RUN mkdir -p /usr/share/nginx/html/health && \
    echo '{"status":"healthy","timestamp":"'$(date -u +'%Y-%m-%dT%H:%M:%SZ')'"}' > /usr/share/nginx/html/health/status.json

# Copy custom Nginx config for monitoring headers
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
    try_files $uri $uri/ /index.html; \
    add_header X-Application "Piedra-Papel-Tijera"; \
    add_header X-Version "1.0.0"; \
    add_header Cache-Control "public, max-age=3600"; \
  } \
  location /health/status.json { \
    access_log off; \
    add_header Content-Type "application/json"; \
  } \
}' > /etc/nginx/conf.d/default.conf

# Expose container port 80
EXPOSE 80

# Health check for orchestration systems
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health/status.json || exit 1

# Start Nginx server in the foreground
CMD ["nginx", "-g", "daemon off;"]
