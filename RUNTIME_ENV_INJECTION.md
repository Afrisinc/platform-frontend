# Runtime Environment Injection for Vite/React Apps

Production-ready guide for injecting environment variables at container startup.

## Overview

Vite embeds environment variables at **build time**. This guide enables **runtime configuration** by:

1. Building with placeholder values
2. Replacing placeholders when the container starts

## Step 1: Create Environment Config File

Create `public/env-config.js` (served as static file):

```javascript
window.__ENV__ = {
  VITE_API_URL: "__VITE_API_URL__",
  VITE_APP_NAME: "__VITE_APP_NAME__",
};
```

## Step 2: Load Config in HTML

Add to `index.html` **before** your app bundle:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>App</title>
    <script src="/env-config.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## Step 3: Create Environment Helper

Create `src/utils/env.js`:

```javascript
/**
 * Get environment variable with runtime injection support.
 * Falls back to Vite's import.meta.env for development.
 */
export function getEnv(key) {
  // Check runtime config first (production)
  if (typeof window !== "undefined" && window.__ENV__) {
    const value = window.__ENV__[key];
    // Return if not a placeholder
    if (value && !value.startsWith("__")) {
      return value;
    }
  }

  // Fallback to Vite's build-time env (development)
  return import.meta.env[key] || "";
}

// Pre-exported common variables
export const API_URL = getEnv("VITE_API_URL");
export const APP_NAME = getEnv("VITE_APP_NAME");
```

## Step 4: Create Entrypoint Script

Create `docker/entrypoint.sh`:

```bash
#!/bin/sh
set -e

# Directory containing built files
DIST_DIR="/usr/share/nginx/html"
ENV_FILE="$DIST_DIR/env-config.js"

echo "Injecting runtime environment variables..."

# Replace placeholders in env-config.js
sed -i "s|__VITE_API_URL__|${VITE_API_URL:-}|g" "$ENV_FILE"
sed -i "s|__VITE_APP_NAME__|${VITE_APP_NAME:-}|g" "$ENV_FILE"

echo "Environment injection complete:"
cat "$ENV_FILE"

# Start nginx
exec nginx -g "daemon off;"
```

## Step 5: Dockerfile

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production=false

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
```

## Step 6: Nginx Configuration

Create `docker/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache env-config.js (contains runtime config)
    location = /env-config.js {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Step 7: Usage in Components

```javascript
import { API_URL, getEnv } from "../utils/env";

// Use pre-exported variable
console.log("API URL:", API_URL);

// Or get dynamically
const apiUrl = getEnv("VITE_API_URL");
```

## Deployment

### Docker Run

```bash
docker build -t myapp .

docker run -p 80:80 \
  -e VITE_API_URL="https://api.production.com" \
  -e VITE_APP_NAME="My App" \
  myapp
```

### Docker Compose

```yaml
version: "3.8"

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=https://api.production.com
      - VITE_APP_NAME=My App
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  template:
    spec:
      containers:
        - name: frontend
          image: myapp:latest
          ports:
            - containerPort: 80
          env:
            - name: VITE_API_URL
              valueFrom:
                configMapKeyRef:
                  name: frontend-config
                  key: api-url
            - name: VITE_APP_NAME
              value: "My App"
```

## File Structure

```
project/
├── docker/
│   ├── entrypoint.sh
│   └── nginx.conf
├── public/
│   └── env-config.js
├── src/
│   ├── utils/
│   │   └── env.js
│   └── main.jsx
├── index.html
├── Dockerfile
└── vite.config.js
```

## Adding New Variables

1. Add placeholder to `public/env-config.js`:

   ```javascript
   window.__ENV__ = {
     VITE_API_URL: "__VITE_API_URL__",
     VITE_NEW_VAR: "__VITE_NEW_VAR__", // Add here
   };
   ```

2. Add sed replacement to `docker/entrypoint.sh`:

   ```bash
   sed -i "s|__VITE_NEW_VAR__|${VITE_NEW_VAR:-}|g" "$ENV_FILE"
   ```

3. Use in code:
   ```javascript
   const newVar = getEnv("VITE_NEW_VAR");
   ```

## Troubleshooting

| Issue                           | Solution                                                |
| ------------------------------- | ------------------------------------------------------- |
| Variables not replacing         | Check entrypoint.sh has execute permission (`chmod +x`) |
| Placeholders showing in browser | Verify env vars are passed to container                 |
| Changes not reflecting          | Clear browser cache; env-config.js may be cached        |
| sed errors on macOS             | Use `gsed` or test in Linux container                   |

## Security Notes

- Never expose secrets in `env-config.js` (it's publicly accessible)
- Use this pattern only for **public** configuration (API URLs, feature flags)
- Sensitive data should be handled server-side
