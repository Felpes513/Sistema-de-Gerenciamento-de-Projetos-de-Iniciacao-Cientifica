FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration=production

FROM nginx:1.27-alpine

RUN apk add --no-cache curl

COPY nginx.frontend.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/FrontTCC/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -fsS http://localhost/ >/dev/null || exit 1
