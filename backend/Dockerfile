# Standalone API image. Build from the backend/ directory: docker build -t ecom-shop-api backend
FROM node:22-bookworm-slim AS build
WORKDIR /app/backend
ENV MONGOMS_DISABLE_POSTINSTALL=1
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim
WORKDIR /app/backend
ENV NODE_ENV=production APP_ENV=production
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/dist ./dist
COPY package.json catalog.json ./
USER node
EXPOSE 8000
CMD ["sh", "-c", "node dist/manage.js indexes && node dist/server.js"]
