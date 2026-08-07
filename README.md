# DineFlow - Restaurant ERP + POS SaaS

Master monorepo for the DineFlow Restaurant ERP and POS platform.

DineFlow is a comprehensive, multi-tenant enterprise resource planning (ERP) and point-of-sale (POS) SaaS platform designed for the restaurant and hospitality industry. It powers full-lifecycle restaurant operations including real-time POS processing, Kitchen Display Systems (KDS), double-entry finance ledgers, multi-branch inventory, and advanced role-based access control (RBAC).

## Architecture & Technology Stack

Built on a high-performance modern web stack:

- **Monorepo:** Turborepo
- **Frontend Applications:** Next.js 14, React 18, Tailwind CSS, Shadcn UI
- **Backend Services:** Express.js (REST), Socket.io (Real-time KDS/Sync)
- **Database:** PostgreSQL with Prisma ORM (Multi-Tenant via AsyncLocalStorage)
- **Caching & Events:** Redis
- **Containerization:** Docker Multi-stage Builds

## Project Structure

- `apps/api-server`: Core REST backend and ORM layer.
- `apps/ws-server`: Real-time WebSocket synchronizer for Kitchen displays.
- `apps/pos-client`: Cashier Point-of-Sale interface.
- `apps/kds-client`: Kitchen Display System interface.
- `apps/erp-admin-client`: Back-office management and reporting dashboard.
- `apps/e2e`: Playwright End-to-End test suites.
- `apps/load-tests`: k6 performance and load testing scripts.
- `packages/`: Shared internal libraries (`@repo/auth`, `@repo/database`, `@repo/ui`, etc.)
- `docs/`: Master project documentation and architecture diagrams.

## Setup Instructions

### Prerequisites

- Node.js (v20+)
- npm (v10+)
- Docker & Docker Compose

### Local Development

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Start the local database and cache (requires Docker):

   ```bash
   docker-compose up -d
   ```

3. Setup environment variables (copy `.env.example` to `.env` and fill values).

4. Apply database migrations:

   ```bash
   npm run db:push --workspace=@repo/database
   ```

5. Start the development servers:
   ```bash
   npm run dev
   ```

## Production Docker Deployment

Each application contains a multistage `Dockerfile` optimized for production execution.
To build a specific application (e.g., `api-server`):

```bash
docker build -f apps/api-server/Dockerfile -t dineflow/api-server:latest .
```

For full cloud deployments (AWS/GCP), refer to the deployment prerequisites defined in `CHANGELOG.md` and `PhaseScope.md`.

## Testing

- Unit Tests: `npm run test`
- End-to-End Tests: `npm run test:e2e --workspace=e2e`
- Load Tests: `npm run test:load --workspace=load-tests`

## License

Proprietary. All rights reserved.
