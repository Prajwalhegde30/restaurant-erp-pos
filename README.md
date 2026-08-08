<div align="center">

# 🍽️ DineFlow

**Enterprise Restaurant ERP & POS SaaS Platform**

A modern, multi-tenant Restaurant ERP and Point-of-Sale platform engineered for restaurants, cafés, cloud kitchens, food courts, and large hospitality businesses. DineFlow unifies front-of-house transactions, kitchen fulfillment, multi-branch inventory, and back-office analytics into a single, high-performance ecosystem.

[![Version](https://img.shields.io/badge/version-v1.0.0-blue.svg?style=for-the-badge)](https://github.com/Prajwalhegde30/restaurant-erp-pos)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=vercel&logoColor=white)](https://turbo.build/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg?style=for-the-badge)](#-license)

[Features](#-key-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Deployment](#-production-deployment) • [API](#-api-documentation) • [FAQ](#-faq)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Screenshots](#-screenshots)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
- [Docker & Containerization](#-docker--containerization)
- [Testing](#-testing)
- [Production Deployment](#-production-deployment)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Performance](#-performance)
- [Project Statistics](#-project-statistics)
- [Roadmap](#-roadmap)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

DineFlow is a comprehensive enterprise-grade solution engineered to handle the complexities of modern food and beverage operations. By tearing down the walls between front-of-house transactions and back-of-house operations, DineFlow provides a unified source of truth.

The platform combines:

- **POS (Point of Sale)**
- **ERP (Enterprise Resource Planning)**
- **Kitchen Display System (KDS)**
- **CRM & Loyalty**
- **Inventory & Supply Chain**
- **Procurement & Vendors**
- **Finance & Accounting**
- **Analytics & Reporting**

---

## ✨ Key Features

### 🛒 POS (Point of Sale)

- **Order Management:** Dine-in, Takeaway, and Delivery workflows.
- **Advanced Payments:** Split billing, multi-tender support, and custom tipping.
- **Dynamic Pricing:** Conditional discounts, modifier price chaining, and happy-hour automation.
- **Taxation:** Automated regional tax calculation and receipt generation.

### 🍳 Kitchen Fulfillment

- **Live KDS:** High-visibility real-time Kitchen Display System.
- **Event-Driven:** Real-time synchronization powered by WebSockets (Socket.io) and Redis Pub/Sub.
- **Order Routing:** Smart order queuing mapped to specific kitchen stations.
- **Preparation Tracking:** Instant status updates from prep to fulfillment.

### 📦 Inventory & Procurement

- **Vendor Management:** Comprehensive supplier database with lead-time tracking.
- **Purchase Orders (POs):** Automated PO generation and Goods Receipt Note (GRN) matching.
- **Recipe Explosion:** Multi-level recipe and sub-recipe batch costing.
- **Stock Depletion:** Real-time, transaction-triggered stock deduction and low-stock alerts.

### 👥 CRM & Loyalty

- **Customer Profiles:** Detailed order history and preference tracking.
- **Loyalty Programs:** Tiered point-accrual systems.
- **Promotions:** Configurable coupon codes with automated validation.
- **Gift Cards:** Digital and physical gift card issuance and redemption.

### 📈 Finance & Accounting

- **Invoicing:** Automated accounts payable and receivable tracking.
- **Double-Entry Ledgers:** Immutable journal entries for all financial movements.
- **Shift Management:** Cash drawer balancing and end-of-day register closing logic.

### 📊 Analytics & Back Office

- **PMIX Analysis:** Detailed Product Mix performance charting.
- **Labor Reports:** Shift duration, sales-per-labor-hour, and staff efficiency metrics.
- **Aggregated Dashboards:** Real-time, multi-branch KPI aggregation.
- **Audit Trails:** Immutable logging of all sensitive administrative actions.

### 🔒 Security & Compliance

- **Authentication:** Stateless JWT tokens mapped to HttpOnly secure cookies.
- **RBAC:** Granular Role-Based Access Control matrix.
- **Multi-Tenant Isolation:** Complete logical tenant segregation via `AsyncLocalStorage`.

---

## 🖼️ Screenshots

_Note: Final visual assets are pending UI production deployments._

|                                                  Point of Sale Dashboard                                                  |                                                  Kitchen Display System (KDS)                                                  |
| :-----------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------: |
| <img src="https://via.placeholder.com/600x400/1F2937/FFFFFF?text=POS+Dashboard+Preview" alt="POS Dashboard" width="100%"> | <img src="https://via.placeholder.com/600x400/1F2937/FFFFFF?text=KDS+Board+Preview" alt="Kitchen Display System" width="100%"> |

|                                                 ERP Back-Office Analytics                                                 |                                                  Customer & Loyalty CRM                                                   |
| :-----------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------: |
| <img src="https://via.placeholder.com/600x400/1F2937/FFFFFF?text=ERP+Analytics+Preview" alt="ERP Analytics" width="100%"> | <img src="https://via.placeholder.com/600x400/1F2937/FFFFFF?text=CRM+Dashboard+Preview" alt="CRM Dashboard" width="100%"> |

---

## 🏗️ Architecture

DineFlow employs a distributed microservices-style architecture managed within a Turborepo monorepo, optimized for scalable enterprise deployment across Kubernetes clusters.

```mermaid
graph TD
    %% Clients
    subgraph Clients [Frontend Applications]
        POS[POS Client <br/> Next.js]
        KDS[KDS Client <br/> Next.js]
        ADMIN[ERP Admin <br/> Next.js]
    end

    %% Network / WAF
    WAF((API Gateway / WAF <br/> Nginx/Cloudflare))

    %% Backend Services
    subgraph Services [Backend Microservices]
        API[API Server <br/> Express REST]
        WS[WebSocket Server <br/> Socket.io]
    end

    %% Data Layer
    subgraph Persistence [Data Layer]
        REDIS[(Redis <br/> Cache & Pub/Sub)]
        PG[(PostgreSQL <br/> Primary/Replica)]
    end

    %% Connections
    POS --> WAF
    KDS --> WAF
    ADMIN --> WAF

    WAF --> API
    WAF --> WS

    API --> PG
    API --> REDIS
    WS --> REDIS

    %% Shared Packages
    subgraph Libs [Shared Monorepo Packages]
        AUTH[@repo/auth]
        DB[@repo/database]
        UI[@repo/ui]
        PUBSUB[@repo/pubsub]
    end

    API -.-> AUTH
    API -.-> DB
    WS -.-> DB
    WS -.-> PUBSUB
    POS -.-> UI
```

---

## 💻 Technology Stack

| Layer         | Technology              | Purpose                                               |
| ------------- | ----------------------- | ----------------------------------------------------- |
| **Monorepo**  | Turborepo               | Fast, incremental builds and dependency management    |
| **Frontend**  | Next.js 14, React 18    | High-performance, server-rendered UIs                 |
| **Styling**   | Tailwind CSS, Shadcn UI | Rapid, beautiful, accessible component design         |
| **Backend**   | Express.js, Socket.io   | Scalable REST APIs and real-time bidirectional events |
| **Database**  | PostgreSQL              | Robust, ACID-compliant relational data storage        |
| **ORM**       | Prisma                  | Type-safe database queries and migrations             |
| **Cache/Bus** | Redis                   | Ephemeral data caching and cross-service Pub/Sub      |
| **Testing**   | Vitest, Playwright, k6  | Comprehensive Unit, E2E, and Load testing             |
| **DevOps**    | Docker                  | Consistent multi-environment containerization         |

---

## 📁 Repository Structure

```text
DineFlow/
├── apps/
│   ├── api-server/         # Main REST API and business logic (Express)
│   ├── ws-server/          # Real-time WebSocket hub (Socket.io)
│   ├── pos-client/         # Cashier Point of Sale UI (Next.js)
│   ├── kds-client/         # Kitchen Display System UI (Next.js)
│   ├── erp-admin-client/   # Back-office management portal (Next.js)
│   ├── e2e/                # Playwright end-to-end tests
│   └── load-tests/         # k6 performance scripts
├── packages/
│   ├── auth/               # Shared JWT & RBAC utilities
│   ├── config/             # Shared ESLint/TS configs
│   ├── database/           # Prisma schema and client
│   ├── logger/             # Centralized logging utilities
│   ├── pubsub/             # Redis pub/sub wrappers
│   ├── types/              # Global TypeScript interfaces
│   ├── ui/                 # Shared Shadcn UI components
│   └── utils/              # Common helper functions
├── docs/                   # Master architecture and phase plans
├── docker-compose.yml      # Local development infrastructure
└── turbo.json              # Monorepo build pipelines
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v20 LTS recommended)
- **npm** (v10 or higher)
- **Docker & Docker Compose** (for local infrastructure)
- **Git**

### 1. Installation

Clone the repository and install dependencies from the monorepo root:

```bash
git clone https://github.com/Prajwalhegde30/restaurant-erp-pos.git
cd restaurant-erp-pos
npm install
```

### 2. Environment Variables

Copy the template configuration file:

```bash
cp .env.example .env
```

Open `.env` and configure your local PostgreSQL credentials, Redis URLs, and JWT secrets.

### 3. Local Infrastructure

Start the local PostgreSQL and Redis containers:

```bash
docker-compose up -d
```

### 4. Database Initialization

Apply the Prisma schema to your running PostgreSQL instance:

```bash
npm run db:push --workspace=@repo/database
```

### 5. Development Mode

Start all application development servers concurrently via Turborepo:

```bash
npm run dev
```

- `api-server` defaults to port `3000`
- `ws-server` defaults to port `3001`
- `erp-admin-client` defaults to port `3002`
- `pos-client` defaults to port `3003`
- `kds-client` defaults to port `3004`

---

## 🐳 Docker & Containerization

DineFlow is strictly designed for containerized deployment.

Every application module contains a multistage `Dockerfile` located in its respective `apps/<app-name>` directory. The build process uses `turbo prune` to extract only the dependencies required for the target application, resulting in highly optimized, lightweight Node.js Alpine images.

To manually build an image (e.g., the API Server):

```bash
docker build -f apps/api-server/Dockerfile -t dineflow/api-server:latest .
```

_Note: The root `docker-compose.yml` is configured for **local development infrastructure only** (spinning up local PostgreSQL and Redis instances). It is not intended for standing up the entire application stack in production._

---

## 🧪 Testing

DineFlow maintains high reliability through rigorous testing strategies configured across the monorepo.

- **Unit Tests:** Run via Vitest. Covers middleware, auth logic, services, and isolated components.
  ```bash
  npm run test
  ```
- **E2E Tests:** Run via Playwright. Simulates complex user journeys like login, order creation, payments, and shift closings.
  ```bash
  npm run test:e2e --workspace=e2e
  ```
- **Load Tests:** Run via k6. Targets API throughput and analytics query performance to ensure strict P99 latency SLAs.
  ```bash
  npm run test:load --workspace=load-tests
  ```

---

## 🌍 Production Deployment

DineFlow is designed for horizontal scalability in the cloud and operates seamlessly on managed Kubernetes platforms (EKS, GKE) or container orchestration services (ECS, Cloud Run).

### Deployment Flow

1. **Development:** Local execution using `npm run dev` and local containers.
2. **Staging:** Push to `main` triggers a CI/CD pipeline building Docker images and deploying to a mirrored staging cluster for QA validation and E2E execution.
3. **Production:** Tagged releases (e.g., `v1.0.0`) trigger zero-downtime rolling updates to the production cluster.

### AWS / GCP Readiness

The repository provides the application code and Dockerfiles. **Cloud Infrastructure Provisioning (Load Balancers, WAFs, VPCs, managed RDS, ElastiCache) is intentionally excluded from the application codebase** and must be performed externally via Infrastructure-as-Code (e.g., Terraform) by your DevOps/SRE team.

---

## 📖 API Documentation

DineFlow implements a RESTful JSON API.
_Detailed OpenAPI/Swagger documentation is located in the `docs/API.md` file._

### Core API Namespaces

- `/api/auth/*` - Authentication & Token generation
- `/api/pos/*` - Cart, Checkout, and Order handling
- `/api/inventory/*` - Stock adjustments and POs
- `/api/finance/*` - Ledger entries and shift tracking
- `/api/crm/*` - Loyalty, Users, and Gift Cards
- `/api/analytics/*` - Aggregated PMIX and Labor queries

### WebSocket Events

The `ws-server` listens on port `3001`.

- **Rooms:** Clients join tenant-specific rooms (e.g., `tenant:123:kds`)
- **Events Emitted:** `order.created`, `order.updated`, `item.prep_started`, `inventory.low_stock`.

---

## 🛡️ Security

Security is deeply integrated at the framework level.

- **JWT Authentication:** Short-lived, stateless access tokens mapped to encrypted HttpOnly cookies to prevent XSS.
- **RBAC (Role-Based Access Control):** Highly granular, dynamic permission evaluation cached in Redis. Ensures a cashier cannot access admin financials.
- **Tenant Isolation:** Strict logical separation using Node.js `AsyncLocalStorage` to implicitly inject `tenant_id` clauses into all Prisma queries, preventing cross-tenant data bleeding.
- **Audit Logging:** Immutable, timestamped tracking of all sensitive operations (e.g., price overrides, refunds, role changes).

---

## ⚡ Performance

- **Redis Caching:** Accelerates RBAC validation and frequently accessed catalog data, drastically reducing DB load.
- **WebSockets:** Eliminates KDS HTTP polling overhead via efficient bidirectional Socket.io pipelines.
- **Analytics Snapshots:** High-cardinality reporting queries hit read-replicas or materialized views.
- **Turbopack / SWC:** Ensures rapid frontend compilation and highly optimized production bundle sizes.

---

## 📊 Project Statistics

| Metric                   | Detail                                                   |
| ------------------------ | -------------------------------------------------------- |
| **Completed Phases**     | 12 Phases (Phase 0 Foundation through Phase 11)          |
| **Applications**         | 8                                                        |
| **Packages**             | 9                                                        |
| **Database**             | PostgreSQL                                               |
| **Authentication**       | Custom JWT / Multi-Tenant Context Injection              |
| **Testing**              | Vitest / Playwright / k6                                 |
| **Deployment Readiness** | Containerized, CI-Verified, Ready for Cloud Provisioning |

---

## 🗺️ Roadmap

- ✅ **Phase 0:** Project Bootstrap & Foundation
- ✅ **Phase 1:** Database Schema & ORM
- ✅ **Phase 2:** Multi-Tenant, Authentication & RBAC
- ✅ **Phase 3:** Shared Packages & Design System
- ✅ **Phase 4:** Administration & Catalog Management
- ✅ **Phase 5:** Core POS Operations
- ✅ **Phase 6:** Kitchen Fulfillment
- ✅ **Phase 7:** Inventory & Procurement
- ✅ **Phase 8:** Finance
- ✅ **Phase 9:** CRM (Customer, Loyalty, Coupons, Gift Cards)
- ✅ **Phase 10:** Analytics & Administration
- ✅ **Phase 11:** Production Readiness & Testing

_(Note: External cloud provisioning and staging data seeding tasks remain as DevOps activities outside this application repository)._

---

## ❓ FAQ

**Q: Is DineFlow designed for single-location or multi-location businesses?**  
A: DineFlow's multi-tenant architecture supports thousands of branches under a single corporate tenant, scaling effortlessly from a single café to a multinational franchise.

**Q: Does DineFlow support offline mode?**  
A: Offline resilience via local PouchDB/IndexedDB sync is scheduled for a future roadmap enhancement. Currently, a stable internet connection is required for live transactions.

**Q: Can I replace PostgreSQL with MySQL?**  
A: Prisma supports MySQL, but DineFlow heavily utilizes PostgreSQL-specific features like `JSONB` for modifiers and advanced indexing. We highly recommend sticking with PostgreSQL.

---

## 🔧 Troubleshooting

- **Database Errors on Startup (`P2021`):** Ensure you have run `npm run db:push --workspace=@repo/database` to apply the Prisma schema to your PostgreSQL container.
- **Port Conflicts:** Ensure ports `3000` through `3004` are free. If running multiple Next.js apps locally, Turborepo will attempt to assign sequential ports, but explicit mapping is preferred.
- **Redis Connection Failures:** Verify your `.env` contains a valid `REDIS_URL` and that your local Docker container is running (`docker ps`).

---

## 🤝 Contributing

We welcome contributions to DineFlow! Please adhere to the following guidelines:

1. Ensure all new logic is covered by Vitest unit tests.
2. Maintain strict TypeScript types (no implicit `any`).
3. Follow the conventional commit format (e.g., `feat:`, `fix:`, `chore:`).
4. Do not bypass the Turborepo CI pipeline; all PRs must pass `build`, `lint`, and `typecheck`.

---

## 📄 License

Proprietary. All rights reserved.
