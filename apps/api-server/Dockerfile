FROM node:20-alpine AS builder

WORKDIR /app
COPY . .
RUN npm install
RUN npx turbo run build --filter=api-server

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=api-server"]
