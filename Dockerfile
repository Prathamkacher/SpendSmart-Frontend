# Stage 1: Build Angular app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:1.25-alpine
# Copy built files from previous stage
COPY --from=builder /app/dist/spendsmart-frontend/browser /usr/share/nginx/html
# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]