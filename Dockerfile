FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY next.config.ts tsconfig.json postcss.config.mjs ./
COPY src ./src
COPY public ./public
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS backend-build
WORKDIR /app/backend
ENV MONGOMS_DISABLE_POSTINSTALL=1
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim
WORKDIR /app
COPY --from=frontend-build /app/.next ./.next
COPY --from=frontend-build /app/node_modules ./node_modules
COPY --from=frontend-build /app/public ./public
COPY --from=frontend-build /app/package.json ./package.json
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY backend/package.json backend/catalog.json ./backend/
COPY deploy/start.sh ./deploy/start.sh
ENV NODE_ENV=production APP_ENV=production NEXT_TELEMETRY_DISABLED=1 BACKEND_URL=http://127.0.0.1:8000 DEMO_MODE=false
EXPOSE 10000
CMD ["/bin/sh", "/app/deploy/start.sh"]
