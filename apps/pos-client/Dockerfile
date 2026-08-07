FROM node:20-alpine AS builder

WORKDIR /app
COPY . .
RUN npm install
RUN npx turbo run build --filter=pos-client

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 3003
CMD ["npm", "run", "start", "--workspace=pos-client"]
