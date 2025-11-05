# Etapa 1: build
FROM node:22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Etapa 2: producción
FROM node:22
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY .env .env

EXPOSE 3000

# Usar db push en lugar de migrate deploy
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/main.js"]