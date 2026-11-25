# Étape 1 : Build de l'application React avec Vite
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:5001/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Étape 2 : Serveur Nginx léger pour la production
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
