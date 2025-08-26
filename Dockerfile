# Étape 1 : Build Angular
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Étape 2 : Serve Angular avec nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/front /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
