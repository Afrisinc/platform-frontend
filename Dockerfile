# ---------- Build ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm approve-builds && pnpm install --frozen-lockfile

# Copy source code
COPY . .

ARG VITE_API_URL
RUN VITE_API_URL=${VITE_API_URL} pnpm build

# ---------- Serve ----------
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 7005

CMD ["nginx", "-g", "daemon off;"]
