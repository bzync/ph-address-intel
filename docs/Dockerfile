# Build context: repo root (ph-address-intel/)
# docker build -f docs/Dockerfile .

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install library deps and build docs
COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src
COPY tsconfig.json tsconfig.build.json ./

COPY docs/package.json docs/package-lock.json ./docs/
RUN cd docs && npm ci

COPY docs ./docs
RUN cd docs && npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/docs/dist /usr/share/nginx/html
COPY docs/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
