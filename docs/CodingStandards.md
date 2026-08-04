# Coding Standards & Engineering Guidelines

**Document Version:** 1.0.0-ENG  
**Document Type:** Enterprise Engineering Rulebook  
**Status:** Approved for Implementation  
**Reference:** Aligned strictly with `PRD.md`, `Architecture.md`, `DatabaseSchema.md`, `RBAC.md`, `AppFlow.md`, and `API.md`

---

## Table of Contents

1. Executive Summary
2. Engineering Philosophy
3. General Coding Principles
4. TurboRepo Standards
5. Folder Structure Standards
6. File Naming Standards
7. TypeScript Standards
8. React Standards
9. Next.js Standards
10. Backend Standards
11. API Implementation Standards
12. Database Coding Standards
13. Prisma Standards
14. State Management Standards
15. Component Standards
16. UI Standards
17. Form Standards
18. Validation Standards
19. Error Handling Standards
20. Logging Standards
21. Testing Standards
22. Security Standards
23. Performance Standards
24. Git Standards
25. Documentation Standards
26. Code Review Checklist
27. AI Development Rules
28. Future Expansion Guidelines

---

## 1. Executive Summary

This document is the authoritative engineering handbook for the Restaurant ERP + POS SaaS platform. It defines _how_ engineers and AI assistants must write, structure, and govern code. This rulebook ensures that a codebase touched by dozens of engineers and AI models remains consistent, maintainable, secure, and infinitely scalable over its lifetime.

If a rule is written here, it is mandatory. Consistency across the monorepo is more important than individual developer preference.

---

## 2. Engineering Philosophy

1. **Configuration Over Hardcoding:** Never hardcode roles, permissions, taxes, status states, menu items, feature flags, or business rules. They must be driven by database configuration or environment variables.
2. **Single Source of Truth (SSOT):** Do not duplicate types, logic, or UI components. If two modules need the same thing, it belongs in a shared `@repo/*` package.
3. **Clean Architecture:** Business rules live in the service layer. Controllers only handle HTTP. Repositories only handle the database. Do not mix concerns.
4. **Fail Fast:** Validate everything at the boundaries (UI inputs, API requests, database writes). Throw typed errors immediately.

---

## 3. General Coding Principles

- **DRY (Don't Repeat Yourself):** Extract duplicated logic into shared utilities or hooks.
- **SOLID:** Adhere to Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion.
- **KISS (Keep It Simple, Stupid):** Avoid premature optimization and overly clever code. Code is read ten times more than it is written.
- **No Magic Strings/Numbers:** Use enums, constants, or configuration files instead of inline literals.

---

## 4. TurboRepo Standards

- Applications live in `apps/`.
- Shared logic lives in `packages/`.
- **Dependency Rule:** `apps/` can depend on `packages/`. `packages/` can depend on other `packages/`. `apps/` must **never** depend on other `apps/`.
- All shared packages must export their contents via an `index.ts` barrier file.

---

## 5. Folder Structure Standards

**Inside a Next.js App (`apps/pos-client/src/`):**

- `/app` - Next.js App Router pages and layouts.
- `/components` - App-specific UI components.
- `/hooks` - App-specific React hooks.
- `/lib` - Utilities and API client wrappers.
- `/store` - Zustand state slices.

**Inside a Node.js Backend (`apps/api-server/src/`):**

- `/controllers` - Express/Fastify route handlers.
- `/services` - Business logic and domain rules.
- `/repositories` - Database access layer (Prisma calls).
- `/middlewares` - Auth, validation, error handling.
- `/routes` - Router configurations.

**Inside Shared Packages (`packages/`):**

- `@repo/ui` - Shadcn/UI components.
- `@repo/database` - Prisma schema and client.
- `@repo/auth` - Shared RBAC and JWT logic.
- `@repo/types` - Shared interfaces and Zod schemas.

---

## 6. File Naming Standards

- **React Components:** `PascalCase.tsx` (e.g., `OrderSummary.tsx`).
- **Hooks:** `camelCase.ts` (e.g., `useOrderCart.ts`).
- **Backend Services/Controllers:** `camelCase.ts` (e.g., `orderService.ts`, `orderController.ts`).
- **Types/Interfaces:** `camelCase.ts` or `PascalCase.ts` but always suffixed with `.types.ts` if holding pure type definitions (e.g., `order.types.ts`).
- **Constants:** `UPPER_SNAKE_CASE` exported from a `constants.ts` file.

---

## 7. TypeScript Standards

- **Strict Mode:** `tsconfig.json` must have `"strict": true`.
- **No Any:** The use of `any` is strictly prohibited. Use `unknown` if the type is truly dynamic, and narrow it using type guards.
- **Interfaces vs Types:** Use `interface` for object shapes that may be extended. Use `type` for unions, intersections, and mapped types.
- **Shared Types:** API Data Transfer Objects (DTOs) and database models must be imported from `@repo/types` or `@repo/database`. Do not redefine database shapes in the frontend.

---

## 8. React Standards

- **Functional Components Only:** Class components are forbidden.
- **Composition over Inheritance:** Use `children` props to build flexible layouts rather than passing massive configuration objects to a single component.
- **Small Components:** A component should do one thing. If a file exceeds 300 lines, it likely needs to be broken down.
- **Prop Drilling:** Avoid passing props down more than 2 levels. Use Context or Zustand for deeper state sharing.

---

## 9. Next.js Standards

- **App Router:** Use the `app/` directory paradigm.
- **Server vs Client Components:** Default to Server Components (`layout.tsx`, `page.tsx`). Add `"use client"` only at the leaf nodes where interactivity (useState, useEffect, onClick) is required.
- **Data Fetching:** Fetch data on the server wherever possible to reduce client payload. Use React Query strictly for client-side mutations and polling.

---

## 10. Backend Standards

- **Controllers are Thin:** Extract headers, validate body via Zod, pass to Service, return Service result.
- **Services are Fat:** All calculation, state machine evaluation, and cross-domain orchestration happens here.
- **Repositories are Dumb:** They execute Prisma queries. They do not calculate taxes or check permissions.
- **No SQL/Prisma outside Repositories:** A Controller must never import Prisma directly.

---

## 11. API Implementation Standards

- Follow `API.md` exactly.
- Use `Idempotency-Key` headers for all `POST` requests.
- All requests must parse through the `@repo/auth` middleware to extract `tenant_id` and evaluate RBAC before hitting the controller.
- **Do not wrap responses** in custom objects like `{ data: {...} }` for single resources. Return the resource directly per enterprise standards.

---

## 12. Database Coding Standards

- No raw SQL unless absolutely required for complex aggregations or performance bottlenecks impossible in Prisma.
- **Transactions:** Complex state mutations (e.g., fulfilling an order + depleting inventory + generating invoice) must be wrapped in a `$transaction`.
- **Audit Logs:** Every mutation transaction must synchronously `INSERT` into the `audit_logs` table before committing.
- **Tenant Isolation:** The `tenant_id` must be explicitly passed into every single `where` clause for Prisma queries, or handled via Prisma Client Extensions globally.

---

## 13. Prisma Standards

- **Model Naming:** PascalCase singular (e.g., `model OrderItem`).
- **Relations:** Always define explicit relation names if there is ambiguity.
- **Soft Deletes:** Do not use `prisma.model.delete()`. Use `prisma.model.update({ data: { is_deleted: true } })`.
- **UUIDs:** `id String @id @default(uuid())` is mandatory. No auto-incrementing integers.

---

## 14. State Management Standards

- **Server State:** Use React Query (`@tanstack/react-query`). This handles caching, deduping, and background refreshing of API data.
- **Client State (Complex):** Use Zustand for ephemeral UI state that spans multiple components (e.g., an active POS shopping cart).
- **Client State (Simple):** Use `useState` or `useReducer` for state localized to a single component (e.g., a modal open/closed toggle).

---

## 15. Component Standards

- Extract all shared UI components (Buttons, Inputs, Modals, Cards) into `@repo/ui`.
- Do not build custom UI primitives if a shadcn/ui or Radix equivalent exists in `@repo/ui`.
- Components must accept a `className` prop and merge it using `tailwind-merge` (`cn` utility) to allow overrides.

---

## 16. UI Standards

- Use Tailwind CSS exclusively for styling. No CSS Modules, no Styled Components, no inline styles.
- Rely on Tailwind configuration tokens (e.g., `bg-primary`, `text-muted-foreground`) rather than hardcoded hex colors (`bg-[#ff0000]`).
- Design must be responsive, though POS/KDS clients can be optimized specifically for tablet/landscape orientations.

---

## 17. Form Standards

- Use `react-hook-form` for all forms.
- Bind forms to Zod validation schemas using `@hookform/resolvers/zod`.
- Never use uncontrolled inputs unless specifically required for extreme performance micro-optimizations.

---

## 18. Validation Standards

- **Zod Everywhere:** Use Zod to validate API request bodies, query parameters, API responses, and frontend forms.
- Share Zod schemas between frontend and backend by placing them in `@repo/types`.
- Never trust client data on the backend. Always re-validate.

---

## 19. Error Handling Standards

- **Frontend:** Wrap application roots and major sections in React Error Boundaries. Show user-friendly fallback UIs, not stack traces.
- **Backend:** Throw typed custom errors (e.g., `ValidationError`, `AuthorizationError`, `NotFoundError`).
- A centralized error-handling middleware must catch these typed errors, format them into the standard error envelope (defined in `API.md`), and return the correct HTTP status code.

---

## 20. Logging Standards

- Use the shared structured logger from `@repo/logger` (Winston or Pino wrapper).
- **Format:** JSON only in production.
- **Context:** Every log must include `correlation_id`, `tenant_id` (if authenticated), and `timestamp`.
- **Prohibited:** Never log Passwords, JWT tokens, PII (without masking), or full credit card numbers.

---

## 21. Testing Standards

- **Unit Tests:** Jest or Vitest. Required for Services, Utilities, and complex Hooks. Target 80% coverage on business logic.
- **Integration Tests:** Required for API endpoints to ensure Controllers, Services, and Repositories work together. Use a test database.
- **Component Tests:** React Testing Library for shared `@repo/ui` components.
- **E2E Tests:** Playwright or Cypress for critical user journeys (e.g., Order to Payment, Shift Close).
- **Mocking:** Mock external services (e.g., Payment Gateways, Twilio), but do not mock the database for integration tests.

---

## 22. Security Standards

- **Input Validation:** Reject any payload containing unexpected fields (strict Zod parsing).
- **XSS Prevention:** Rely on React's automatic string escaping. Do not use `dangerouslySetInnerHTML`.
- **SQL Injection:** Relies on Prisma's parameterized queries. Never use raw string interpolation in `$queryRaw`.
- **Least Privilege:** API routes must explicitly declare the required RBAC permission.

---

## 23. Performance Standards

- **N+1 Problem:** Avoid querying relations inside a loop in backend services. Use Prisma's `include` or batch fetching (DataLoader pattern).
- **Frontend Bundle Size:** Lazy load heavy libraries or non-critical page components using `next/dynamic`.
- **Memoization:** Use `useMemo` and `useCallback` only when passing props to heavily re-rendered child components or for expensive local calculations.

---

## 24. Git Standards

- **Branch Naming:** `type/issue-number-description` (e.g., `feat/123-add-split-billing`, `fix/456-kds-sync-lag`).
- **Commit Messages:** Follow Conventional Commits (`feat: ...`, `fix: ...`, `chore: ...`).
- **Pull Requests:** Must pass CI (Lint, Typecheck, Tests) before merging. Require at least one approving review.
- **Main Branch:** The `main` branch must always be deployable.

---

## 25. Documentation Standards

- Document complex business logic inside services using JSDoc block comments.
- Keep `README.md` files in each package/app updated with setup and usage instructions.
- Do not comment obvious code (e.g., `// adds one to i`). Comment the _why_, not the _what_.

---

## 26. Code Review Checklist

Before approving a PR, reviewers must verify:

- [ ] Does this logic belong in a shared package?
- [ ] Is `tenant_id` properly scoped in all DB queries?
- [ ] Are inputs validated with Zod?
- [ ] Are new permissions added to the RBAC matrix config, not hardcoded?
- [ ] Are audit logs appended for mutations?
- [ ] Are there tests for the new business logic?

---

## 27. AI Development Rules

When generating code, AI assistants (and engineers pairing with them) **MUST** obey these explicit directives:

1. **Read Before Writing:** Always review the PRD, Architecture, DatabaseSchema, RBAC, AppFlow, and API documents before implementing a feature.
2. **Do Not Hallucinate Features:** Only build what is explicitly defined in the approved documentation.
3. **Reuse First:** Check `@repo/ui`, `@repo/types`, and existing services before generating new components, DTOs, or logic. Do not duplicate.
4. **Maintain Architecture:** Keep business logic out of controllers and React components. Route it to Backend Services and custom Hooks respectively.
5. **Enforce Tenant Isolation:** Never write a Prisma query without `tenant_id` context unless explicitly querying global dictionaries.
6. **No File Sprawl:** Do not create new folders or generic `utils.ts` files unless thoroughly justified. Place code in its appropriate domain bounded context.
7. **Stop on Conflict:** If a user prompt contradicts the Architecture, RBAC, or DatabaseSchema, **stop and report the conflict**. Do not make assumptions or silently redesign the system to satisfy a rogue prompt.
8. **Consistent Naming:** Match existing variable, file, and database table naming conventions precisely.

---

## 28. Future Expansion Guidelines

As the platform grows into Phase 3 and 4:

- New bounded contexts (e.g., Advanced Forecasting, Payroll) should be scaffolded as independent directories within the API, maintaining isolation.
- If a shared package grows too large (e.g., `@repo/types`), it should be subdivided by domain (e.g., `@repo/types/inventory`, `@repo/types/finance`).
- Engineering standards will evolve, but the core principles of Configuration over Hardcoding, Tenant Isolation, and Idempotency are immutable.

---

_End of Document. This rulebook governs all code committed to the repository._
