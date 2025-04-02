# Usa una imagen de Node para construir la app
FROM node:18 AS build

# Configura el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias de Angular y elimina la caché de npm
RUN npm ci --legacy-peer-deps && npm cache clean --force

# Copia el resto del código
COPY . .

# Construye la aplicación Angular en modo producción
RUN npm run build:prod

# Usa una imagen de Nginx para servir la aplicación
FROM nginx:alpine

# Copia los archivos de construcción al contenedor de Nginx
COPY --from=build /app/dist/main /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 80

# Inicia Nginx
CMD ["nginx", "-g", "daemon off;"]
