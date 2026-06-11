# Use lightweight Nginx alpine image
FROM nginx:alpine

# Copy static assets to Nginx default html serving directory
COPY index.html style.css app.js /usr/share/nginx/html/

# Expose container port 80
EXPOSE 80

# Start Nginx server in the foreground
CMD ["nginx", "-g", "daemon off;"]
