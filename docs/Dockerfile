# Build context: repo root (ph-address-intel/)
# docker build -f docs/Dockerfile .

# Stage 1: Build
FROM node:24-slim AS builder

WORKDIR /app

# Install docs deps
COPY docs/package.json docs/package-lock.json ./docs/
RUN cd docs && npm ci

# Copy library source (referenced via vite alias ../src/index.ts)
COPY src ./src

COPY docs ./docs
RUN cd docs && npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/docs/dist /usr/share/nginx/html
COPY docs/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
