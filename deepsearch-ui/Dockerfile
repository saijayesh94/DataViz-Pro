# Use the official nginx image as the base image
FROM nginx:alpine

# Copy the build output to the default nginx public directory
COPY ./dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set permissions for directories and files
RUN find /usr/share/nginx/html -type d -exec chmod 755 {} \; \
    && find /usr/share/nginx/html -type f -exec chmod 644 {} \;

# Expose port 80
EXPOSE 80

# Command to run nginx
CMD ["nginx", "-g", "daemon off;"]

