# High-performance Nginx web server for Lens Producciones
FROM nginx:alpine

# Copy custom Nginx configuration optimized for video streaming
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy pre-built static export
COPY out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
