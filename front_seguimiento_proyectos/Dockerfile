# Etapa 1: build
FROM node:22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: producción (usar la misma versión)
FROM node:22
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY .env.local .env.local
EXPOSE 3001
CMD ["npm", "run", "start"]