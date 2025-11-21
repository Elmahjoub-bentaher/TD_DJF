#FROM node:20-alpine
#
#WORKDIR /app
#
#COPY package*.json ./
#RUN npm install
#
#COPY . .
#
#EXPOSE 5173
#
#CMD ["npm", "run", "dev", "--", "--host"]

# STAGE 1 : Build de l'app React
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# STAGE 2 : Serveur Nginx
FROM nginx:alpine
# Copier la config Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copier les fichiers construits (le dossier 'dist')
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
