# Stage 1: Build React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency configs
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build production bundles
RUN npm run build

# Stage 2: Serve static files using Nginx
FROM nginx:alpine

# Copy built assets to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config to support client-side routing (SPAs)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
