# Multi-stage build for ultra-light production image
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build static export
COPY . .
RUN npm run build

# Stage 2: High-performance Nginx web server
FROM nginx:alpine

# Copy custom Nginx configuration optimized for video streaming
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static build output
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
