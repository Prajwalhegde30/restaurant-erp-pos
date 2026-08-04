# API Architecture & Governance Standards

**Document Version:** 1.0.0-API  
**Document Type:** Enterprise API Blueprint  
**Status:** Approved for Implementation  
**Reference:** Aligned strictly with `PRD.md`, `Architecture.md`, `DatabaseSchema.md`, `RBAC.md`, and `AppFlow.md`

---

## Table of Contents

1. Executive Summary
2. API Philosophy
3. API Design Principles
4. REST Standards
5. Resource Naming Standards
6. URI Conventions
7. HTTP Method Usage
8. Request Standards
9. Response Standards
10. Error Handling Standards
11. Authentication Standards
12. Authorization Integration
13. Multi-Tenant Context Resolution
14. Branch Context Resolution
15. Validation Standards
16. Pagination
17. Filtering
18. Sorting
19. Searching
20. Idempotency
21. Transactions
22. File Upload Standards
23. API Versioning
24. Rate Limiting
25. Caching
26. WebSocket Standards
27. Event Communication
28. Background Job Integration
29. Logging
30. Monitoring
31. Security Standards
32. Future API Evolution
33. Glossary
34. Appendix: REST Resource Groups

---

## 1. Executive Summary

This document defines the API architecture and strict governance standards for the Restaurant ERP + POS SaaS platform. The API serves as the ultimate contract between the frontend interfaces (Next.js POS, KDS, Admin ERP) and the Node.js backend services.

This is not a list of endpoints. It is the enterprise standard that dictates _how_ endpoints must be constructed, authenticated, authorized, and structured. Every module implemented by the engineering team must adhere to these standards to ensure a cohesive, predictable, and highly scalable API ecosystem.

---

## 2. API Philosophy

1. **Predictability:** The API must behave consistently across all modules. If a developer learns how to query `orders`, they should instantly know how to query `inventory`.
2. **Idempotency as a First-Class Citizen:** Because the POS operates in highly unreliable network environments, all state-mutating requests must be idempotent to prevent duplicate charges or double inventory deductions.
3. **Defense in Depth:** The API is the primary attack surface. Validation, Authentication, Authorization, and Tenant Isolation must be aggressively enforced before any business logic executes.
4. **Offline Sync Support:** The API design must accommodate bulk syncs and vector clock/timestamp conflict resolution from offline-recovered POS terminals.

---

## 3. API Design Principles

- **Resource-Oriented Design:** The API models business entities (nouns) rather than remote procedure calls (verbs).
- **Statelessness:** No session state is retained on the server. Every request must contain all information necessary to execute.
- **Contract-First:** OpenAPI 3.x definitions must precede implementation. The schema is the absolute source of truth.
- **Fail Fast:** Input validation (Zod) and tenant authorization must reject invalid requests immediately before consuming database resources.

---

## 4. REST Standards

The API strictly adheres to RESTful architectural constraints over HTTP/1.1 (and HTTP/2 where applicable).

- Request and Response bodies must be formatted as `application/json`.
- State transitions are managed entirely through HTTP verbs (GET, POST, PUT, PATCH, DELETE).
- The API uses standard HTTP status codes to communicate success or failure semantically.

---

## 5. Resource Naming Standards

- **Nouns, not Verbs:** Use nouns to represent resources (e.g., `/orders`, not `/create-order`).
- **Pluralization:** Resource collections must always be pluralized (e.g., `/users`, `/branches`, `/inventory-items`).
- **Casing:** Use `kebab-case` for multi-word URI segments (e.g., `/purchase-orders`).
- **Properties in JSON:** JSON request/response payloads must use `snake_case` for property names, aligning 1:1 with the Database Schema convention.

---

## 6. URI Conventions

Resource URIs follow a strict hierarchical structure, but deep nesting is heavily discouraged.

- **Collection:** `/api/v1/{resources}` (e.g., `/api/v1/orders`)
- **Specific Resource:** `/api/v1/{resources}/{id}` (e.g., `/api/v1/orders/uuid-1234`)

**Nesting Rule:** Limit nesting to one level of depth. Only nest resources when the child resource is structurally meaningless without the parent.

- _Correct:_ `/api/v1/orders/{id}/items`
- _Incorrect:_ `/api/v1/branches/{id}/orders/{id}/items` -> Flatten this to `/api/v1/orders?branch_id={id}`.

---

## 7. HTTP Method Usage

| Method   | CRUD Mapping | Description                                        | Idempotent?                         |
| -------- | ------------ | -------------------------------------------------- | ----------------------------------- |
| `GET`    | Read         | Retrieves a resource or collection.                | Yes                                 |
| `POST`   | Create       | Creates a new resource. Triggers workflows.        | No (Unless Idempotency-Key is used) |
| `PUT`    | Update       | Replaces a resource entirely.                      | Yes                                 |
| `PATCH`  | Update       | Partially modifies a resource.                     | Yes                                 |
| `DELETE` | Delete       | Performs a soft-delete (sets `is_deleted = true`). | Yes                                 |

---

## 8. Request Standards

### 8.1 Required Headers

Every API request must include:

- `Content-Type: application/json`
- `Authorization: Bearer <JWT>` (Except public endpoints)
- `X-Correlation-ID: <UUID>` (Client-generated for end-to-end tracing)

### 8.2 Context Headers (Optional but Recommended)

- `X-Branch-ID: <UUID>` (Sets the operational scope for the request without embedding it in the URI).

### 8.3 State-Mutating Headers

- `Idempotency-Key: <UUID>` (Required for all `POST` requests).

### 8.4 Payload Validation

Requests exceeding a maximum payload size (e.g., 5MB) must be rejected with `413 Payload Too Large`.

---

## 9. Response Standards

The API returns direct resource representations without unnecessary "wrapper" objects (e.g., no `{"status": "success", "data": {...}}` envelopes), mimicking enterprise standards like Stripe.

**Single Resource Request (`GET /api/v1/orders/{id}`):**

```json
{
  "id": "uuid-1234",
  "status": "closed",
  "total_amount": 150.0,
  "created_at": "2026-08-04T12:00:00Z"
}
```

**Collection Request (`GET /api/v1/orders`):**
Lists must be wrapped in a pagination object (see Section 16).

```json
{
  "data": [
    { "id": "uuid-1", "status": "closed" },
    { "id": "uuid-2", "status": "draft" }
  ],
  "has_more": false,
  "next_cursor": null
}
```

---

## 10. Error Handling Standards

Errors must return appropriate HTTP status codes (4xx, 5xx) and a unified JSON error model.

### 10.1 Standard Error Envelope

```json
{
  "error": {
    "type": "validation_error",
    "code": "invalid_parameter",
    "message": "The 'discount_amount' cannot exceed the 'total_amount'.",
    "details": [
      {
        "field": "discount_amount",
        "issue": "must_be_less_than_total"
      }
    ],
    "correlation_id": "req-uuid-9876",
    "doc_url": "https://docs.api.example.com/errors/invalid_parameter"
  }
}
```

### 10.2 HTTP Status Codes

| Code  | Meaning               | Usage                                                                               |
| ----- | --------------------- | ----------------------------------------------------------------------------------- |
| `400` | Bad Request           | Malformed JSON, missing required parameters.                                        |
| `401` | Unauthorized          | Missing, expired, or invalid JWT.                                                   |
| `403` | Forbidden             | JWT is valid, but RBAC denies access (or Tenant mismatch).                          |
| `404` | Not Found             | Resource does not exist (or belongs to another tenant).                             |
| `409` | Conflict              | Optimistic concurrency failure, duplicate idempotency key, state machine violation. |
| `422` | Unprocessable Entity  | Zod schema validation failures.                                                     |
| `429` | Too Many Requests     | Rate limit exceeded.                                                                |
| `500` | Internal Server Error | Unexpected backend crash. Must mask sensitive stack traces.                         |

---

## 11. Authentication Standards

- **Strategy:** Stateless JWT (JSON Web Tokens).
- **Issuance:** Login generates a short-lived Access Token (e.g., 15 mins) and a HttpOnly, Secure cookie-based Refresh Token.
- **Claims:** JWT payload must contain `sub` (user_id), `tenant_id`, and standard `exp`/`iat` claims.
- **Revocation:** Logout must blacklist the Refresh Token in Redis. Terminated users are explicitly denied during token validation.

---

## 12. Authorization Integration

Authorization is decoupled from business logic and handled via strict middleware.

- **RBAC Matrix Check:** Middleware extracts the `tenant_id` and `user_id` from the JWT, queries the Redis-cached RBAC matrix, and asserts that the user possesses the required permission (e.g., `orders.edit.branch`) for the requested branch scope.
- **Approval Flow Evaluation:** If the requested action requires secondary approval (e.g., refund above threshold), the API intercepts the request and responds with a `403 Forbidden` carrying an escalation payload (e.g., `{"code": "approval_required", "threshold": 50}`).

---

## 13. Multi-Tenant Context Resolution

- **Strict Isolation:** The `tenant_id` is extracted strictly from the validated JWT, **never** from user input (URI, Body, or Query Params).
- **Context Injection:** The API layer injects the `tenant_id` into the AsyncLocalStorage context. The database ORM (Prisma) middleware automatically appends `tenant_id = ?` to every query. Cross-tenant access is architecturally impossible.

---

## 14. Branch Context Resolution

Because operations are highly branch-scoped, the `branch_id` must be explicitly resolved.

- **Source:** Extract from `X-Branch-ID` header or explicitly from the resource payload (e.g., `POST /api/v1/orders` requiring `"branch_id": "uuid"`).
- **Validation:** The API asserts that the authenticated user has an active Role Assignment (per `RBAC.md`) in the specified `branch_id`.

---

## 15. Validation Standards

- **Engine:** Zod schema validation.
- **Execution:** Validation occurs in the Controller layer, strictly before hitting Business Services.
- **Types:** Payloads must strictly type-check (e.g., strings vs. numbers). Coercion is forbidden.
- **Failure:** Returns `422 Unprocessable Entity` with an array of specific field-level violations (Section 10.1).

---

## 16. Pagination

- **Cursor-Based Pagination:** Mandatory for high-volume, continuously growing datasets (Orders, Audit Logs, Stock Movements) to prevent slow deep-offsets. Returns `next_cursor`.
- **Offset-Based Pagination:** Permitted only for bounded master data (Users, Roles, Branches). Uses `limit` and `offset` query parameters.

---

## 17. Filtering

Filters are applied via query strings.

- **Exact Match:** `?status=closed`
- **Multiple Values (OR):** `?status=draft,placed`
- **Range Operators:** Use bracket notation for ranges: `?created_at[gte]=2026-08-01&created_at[lte]=2026-08-31`.

---

## 18. Sorting

Sorting is controlled via the `sort` query parameter.

- Ascending: `?sort=created_at`
- Descending: `?sort=-created_at`
- Multiple: `?sort=-created_at,total_amount`

---

## 19. Searching

Full-text search routes use the `q` query parameter (e.g., `GET /api/v1/customers?q=john+doe`). This triggers backend `tsvector` or `pg_trgm` fuzzy matching.

---

## 20. Idempotency

Idempotency is a strict requirement for network resilience and offline POS sync.

- **Header:** `Idempotency-Key: <UUID>`
- **Logic:** The API checks Redis for the key.
  - If it exists and is `processing`, return `409 Conflict`.
  - If it exists and is `completed`, return the exact cached `200 OK` JSON response from the original request.
  - If it does not exist, lock the key, execute the transaction, cache the response, and return.
- **Scope:** Keys are scoped to the `tenant_id` and expire after 24 hours.

---

## 21. Transactions

State-mutating endpoints must wrap their database operations in a single ACID transaction block.

- Example: `POST /api/v1/orders/{id}/bill` must update the Order state, generate the Invoice, and write to the `audit_logs` atomically. If the audit log fails, the entire request rolls back, returning `500`.

---

## 22. File Upload Standards

The Node.js API never handles raw multipart binary data to protect CPU resources.

- **Pattern:** The client calls `POST /api/v1/uploads/presigned-url` indicating file type (image/pdf) and size.
- **Response:** API validates RBAC and returns a temporary, securely signed AWS S3 (or equivalent) URL.
- **Client Action:** Client uploads directly to Object Storage.
- **Confirmation:** Client calls `POST /api/v1/resources` passing the object storage URL.
- **Validation:** S3 buckets enforce max size and virus scanning hooks via Cloud Functions.

---

## 23. API Versioning

- **URI Versioning:** Version is embedded in the URI path: `/api/v1/`.
- **Evolution:** Non-breaking changes (adding fields) do not bump versions. Breaking changes (removing fields, renaming concepts) require `/api/v2/`.
- **Deprecation:** Sunset endpoints must include the `Sunset` HTTP header specifying the shutdown date.

---

## 24. Rate Limiting

- **Strategy:** Redis-based token bucket algorithm.
- **Buckets:** Rate limits are partitioned by `tenant_id` AND `IP Address` to protect against both brute force and noisy neighbors.
- **Headers:** Responses must include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`.
- **Violation:** Yields `429 Too Many Requests`.

---

## 25. Caching

- **Client Caching:** Master data (Menus, Tax Configs) returns `Cache-Control: public, max-age=300` allowing client-side React Query caching.
- **Server Caching:** Operational data (Orders, Stock) returns `Cache-Control: no-cache` to ensure real-time accuracy. Server caches data aggressively in Redis, invalidated via event triggers.

---

## 26. WebSocket Standards

WebSockets are mandatory for the KDS (Kitchen Display System) and POS sync.

- **Connection:** Client upgrades connection, passing a short-lived Ticket JWT generated via REST.
- **Namespaces:** Connections are forcefully joined to `tenant:{tenant_id}:branch:{branch_id}` Redis Pub/Sub channels.
- **Format:** Messages use strict JSON payloads with an `event_type` and `payload` envelope.
- **Resilience:** Clients must implement exponential backoff on disconnect. Upon reconnect, clients must fetch a REST snapshot before resuming WebSocket listening to capture missed events.

---

## 27. Event Communication

- Internal APIs communicate asynchronously to prevent latency. (e.g., POS does not wait for Inventory calculations).
- Every major REST mutation (Create, Update, Delete) publishes an event to the Message Broker (Redis/BullMQ) representing the state change (e.g., `OrderClosed`).

---

## 28. Background Job Integration

- Endpoints triggering heavy processing (e.g., Generating a monthly P&L export) must respond immediately with `202 Accepted` and a `job_id`.
- Clients poll `GET /api/v1/jobs/{job_id}` or listen to WebSockets for completion status.

---

## 29. Logging

- Every HTTP request is logged in structured JSON via `@repo/logger`.
- **Sanitization:** Passwords, API Keys, credit card numbers, and PII must be masked before logging.
- **Context:** Logs must include the `correlation_id`, `tenant_id`, and `user_id` to trace a request end-to-end.

---

## 30. Monitoring

- **Health Checks:** `/health/liveness` (returns 200 OK instantly) and `/health/readiness` (checks DB/Redis connectivity).
- **Metrics:** Endpoints expose Prometheus metrics for request count, error rates, and response latency (RED metrics).

---

## 31. Security Standards

- **HTTPS Only:** TLS 1.3 is strictly mandated. Plain HTTP is rejected at the load balancer.
- **OWASP Top 10:** Input is validated (Zod), output is parameterized (Prisma SQL injection prevention), and Cross-Site Scripting (XSS) is mitigated via Content-Security-Policy headers in frontend clients.
- **PII Protection:** Endpoints returning Customer phone numbers or emails must be strictly guarded by `customer_pii.view` permissions.

---

## 32. Future API Evolution

To support Phase 3/4 Roadmap (Public API Marketplace):

- The internal `/api/v1/` will remain tightly coupled to the frontend.
- A new `/public-api/v1/` namespace will be developed. It will use long-lived, scoped API Keys instead of JWTs, enforce much stricter rate limits, and implement webhooks (outgoing HTTPS POSTs) for third-party integrations (e.g., accounting software).

---

## 33. Glossary

- **Idempotency:** A property guaranteeing that making multiple identical API requests yields the exact same state as making a single request.
- **JWT (JSON Web Token):** A cryptographically signed token representing user identity and tenant context.
- **Zod:** A TypeScript-first schema declaration and validation library used for input validation.
- **Correlation ID:** A unique identifier passed across all microservices and logs to trace a single request's lifecycle.
- **Cursor-Based Pagination:** A method of pagination that relies on a specific record pointer rather than a numeric offset, vital for performance at scale.

---

## 34. Appendix: REST Resource Groups

This section acts as a navigational guide for the REST implementation. The API will expose endpoints clustered around the following resource domains:

- **Authentication & IAM:** `/auth`, `/users`, `/roles`, `/api-keys`
- **Tenant & Organization:** `/tenants`, `/branches`, `/settings`
- **Catalog:** `/menus`, `/categories`, `/menu-items`, `/modifiers`, `/combos`
- **POS & Operations:** `/orders`, `/tables`, `/reservations`, `/bills`
- **Fulfillment:** `/kitchen-tickets`, `/stations`
- **Supply Chain:** `/inventory-items`, `/recipes`, `/purchase-orders`, `/goods-receipts`, `/suppliers`
- **Finance:** `/payments`, `/refunds`, `/invoices`, `/journal-entries`, `/day-sessions`, `/cash-drawers`
- **CRM:** `/customers`, `/loyalty`, `/coupons`, `/gift-cards`
- **Workforce:** `/employees`, `/shifts`, `/payroll`
- **System:** `/audit-logs`, `/notifications`, `/reports`, `/uploads`

---

_End of Document._
