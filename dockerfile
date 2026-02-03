# Usar Node.js 18 (versión LTS estable)
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json primero (para aprovechar cache)
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]
