# ==========================================
# Multi-Stage Dockerfile: Lens Producciones
# Optimized for Coolify Static Deployment
# ==========================================

# ------------------------------------------
# Stage 1: Build static export with Node.js
# ------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies based on lockfile
COPY package*.json ./
RUN npm ci

# Copy application source files
COPY . .

# Build and export static site to /app/out
RUN npm run build

# ------------------------------------------
# Stage 2: Serve static files with Nginx
# ------------------------------------------
FROM nginx:alpine AS runner

# Remove default Nginx welcome site
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy exported static files from builder
COPY --from=builder /app/out /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
