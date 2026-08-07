FROM node:20-alpine AS builder

WORKDIR /app
COPY . .
RUN npm install
RUN npx turbo run build --filter=erp-admin-client

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 3002
CMD ["npm", "run", "start", "--workspace=erp-admin-client"]
