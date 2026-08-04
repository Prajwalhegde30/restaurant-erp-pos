# DatabaseSchema Revision Report

**Document Version:** 1.0.0-REV
**Document Type:** Schema Gap Analysis for Revision
**Status:** Awaiting Developer Clarification
**Source Document:** `DatabaseSchema.md` (v1.0.0-DBA) — FROZEN, DO NOT MODIFY
**Reference Documents:** `Architecture.md` (v1.2.0-ARCH), `PhaseScope.md` (v1.0.0-EXEC)
**Prepared By:** Engineering Review Process
**Reason:** Catalog & Operational Models (Task 1.2) cannot be implemented without resolving the gaps documented below.

> **Important:** This document does not modify the original `DatabaseSchema.md`.
> It records only what is missing from the frozen documentation.
> No schema, Prisma model, or DDL is proposed here.

---

## Table of Contents

1. Menu
2. Category
3. MenuItem
4. Modifier
5. Combo
6. Order
7. OrderItem
8. DiningTable
9. Reservation
10. Blocking Issues
11. Non-Blocking Issues

---

## 1. Menu

### Gap 1.1 — Field List Undefined

- **Missing Information:** The `menus` table has no defined column list beyond the globally mandated fields (`id`, `tenant_id`, audit fields, soft delete fields). No entity-specific fields are defined.
- **Why Implementation Cannot Proceed:** A Prisma model requires a complete field list. Without documented fields (e.g., `name`, `description`, `published_at`), any field added would be an undocumented engineering assumption.
- **Impact If Left Undefined:** Every field added to `menus` beyond the global standard is an invention not traceable to the frozen documentation.
- **Clarification Question:** What entity-specific fields does the `menus` table require (e.g., name, description, display ordering, publication date)?

---

### Gap 1.2 — Versioning Mechanism Undefined

- **Missing Information:** `DatabaseSchema.md §25.2` states: _"Versioned. Price changes create new versions to protect past operational reporting."_ The physical versioning mechanism is not defined.
- **Why Implementation Cannot Proceed:** Three mutually exclusive strategies exist: (a) a `version` integer column on the same row, (b) a separate `menu_versions` table (new row per version), or (c) immutable rows where a "new version" is a new Menu row. Each results in a fundamentally different schema.
- **Impact If Left Undefined:** Choosing the wrong strategy will require a destructive migration to correct. Historical operational reporting accuracy depends on this decision.
- **Clarification Question:** Does "Versioned" mean a `version` integer on the `menus` row, a separate `menu_versions` history table, or that each price-change creates a new `menus` row?

---

### Gap 1.3 — Branch Assignment Strategy Undefined

- **Missing Information:** `DatabaseSchema.md §25.2` states Menu "Belongs to Tenant; Assigned to Branch." The assignment mechanism is not defined.
- **Why Implementation Cannot Proceed:** Two distinct strategies exist: (a) a `branch_id` FK column on the `menus` row (one menu, one branch), or (b) a separate `menu_branch_assignments` join table (one menu assigned to many branches). These are structurally incompatible.
- **Impact If Left Undefined:** A chain restaurant where the same menu applies to multiple branches requires a join table. A single `branch_id` column would force duplication. Choosing incorrectly requires a breaking migration.
- **Clarification Question:** Can a single Menu be assigned to multiple Branches simultaneously? If yes, is there a named join table (e.g., `menu_branches`) for this assignment?

---

### Gap 1.4 — Status / Lifecycle Undefined

- **Missing Information:** No status, publication state, or lifecycle is defined for the Menu entity. `DatabaseSchema.md §25.1` defines a Tenant lifecycle (`Created → Active → Suspended`), but no equivalent is defined for Menu.
- **Why Implementation Cannot Proceed:** Without a status field, there is no way to distinguish a draft menu from a published one, which is a fundamental catalog management requirement.
- **Impact If Left Undefined:** Business logic for publishing and deactivating menus cannot be built on the schema.
- **Clarification Question:** Does a Menu have a publication lifecycle (e.g., Draft, Published, Archived)? If yes, what are the valid states?

---

## 2. Category

### Gap 2.1 — Field List Undefined

- **Missing Information:** No field list is defined for the `categories` table beyond globally mandated fields.
- **Why Implementation Cannot Proceed:** A Prisma model cannot be built without documented fields (e.g., `name`, `description`, `display_order`).
- **Impact If Left Undefined:** Any field added is an undocumented engineering assumption.
- **Clarification Question:** What entity-specific fields does the `categories` table require?

---

### Gap 2.2 — Hierarchical Structure Undefined

- **Missing Information:** `DatabaseSchema.md §25.2` states "Hierarchical grouping." `DatabaseSchema.md §8` lists "Hierarchical/Recursive" as a supported relationship type. However, the self-referencing parent-child FK pattern is not explicitly confirmed for Category.
- **Why Implementation Cannot Proceed:** Without confirmation, adding a `parent_id` self-referencing FK is an assumption. If Categories are not recursive, a different structural hierarchy (e.g., Category → SubCategory as separate tables) would be needed.
- **Impact If Left Undefined:** Incorrect hierarchy implementation would require a breaking schema change when the Admin UI is built in Phase 4.
- **Clarification Question:** Does Category use a self-referencing `parent_id` column for nesting? What is the maximum depth of nesting?

---

### Gap 2.3 — Menu Foreign Key Undefined

- **Missing Information:** No explicit FK from `categories` to `menus` is defined in the documentation. Categories are described as "grouping of items" but their ownership by a Menu is not formally stated.
- **Why Implementation Cannot Proceed:** Without a documented FK, adding `menu_id` to `categories` is an engineering assumption.
- **Impact If Left Undefined:** If categories are tenant-wide (not menu-specific), a `menu_id` FK would be incorrect and would need to be dropped.
- **Clarification Question:** Does a Category belong to a specific Menu, or is it a tenant-level construct that can span menus?

---

## 3. MenuItem

### Gap 3.1 — Field List Undefined

- **Missing Information:** No field list is defined for `menu_items`. The `price` field is strongly implied by `DatabaseSchema.md §18` (OrderItems snapshot price), but is not explicitly named. No other fields (name, description, tax rate) are defined.
- **Why Implementation Cannot Proceed:** A Prisma model requires explicit field definitions. Price in particular carries significant data type implications (e.g., `Decimal(10,2)` for financial precision vs. `Float`).
- **Impact If Left Undefined:** Using the wrong data type for price (e.g., `Float` instead of `Decimal`) creates irreversible financial rounding errors in production.
- **Clarification Question:** What fields does `menu_items` require? What is the required data type for the `price` field (Decimal precision)?

---

### Gap 3.2 — Category Relationship Undefined

- **Missing Information:** No FK from `menu_items` to `categories` is defined. The document implies items exist within categories ("grouping of items") but does not define the FK or whether it is one-to-many or many-to-many.
- **Why Implementation Cannot Proceed:** A MenuItem may belong to one Category (FK on `menu_items`) or many Categories (join table). These are structurally incompatible.
- **Impact If Left Undefined:** A many-to-many implementation creates a join table. A one-to-many adds a `category_id` FK. Wrong choice requires breaking migration.
- **Clarification Question:** Does a MenuItem belong to exactly one Category, or can it appear in multiple Categories?

---

### Gap 3.3 — Availability / Status Field Undefined

- **Missing Information:** No status, availability, or 86'd field is defined for `menu_items`. `Architecture.md §11.2` mentions: _"The POS UI evaluates 86'd status from a high-speed Redis cache."_ The persistence layer for this status is not defined.
- **Why Implementation Cannot Proceed:** If the 86'd status is persisted to the database (and not Redis-only), a field is required on the model. If it is Redis-only, no field is needed. The source of truth is ambiguous.
- **Impact If Left Undefined:** If omitted from the schema and later needed, an `ALTER TABLE` is required in production.
- **Clarification Question:** Is the item availability / 86'd status persisted as a database column on `menu_items`, or is it managed exclusively in the Redis cache?

---

## 4. Modifier

### Gap 4.1 — Structural Model Undefined (Blocking)

- **Missing Information:** `DatabaseSchema.md §25.2` states: _"Modifiers carry min/max selection logic."_ The document does not define whether "Modifier" refers to a Modifier Group (a logical container with min/max rules) or individual Modifier Options (selectable items within a group).
- **Why Implementation Cannot Proceed:** The industry-standard structure is: `ModifierGroup` (name, min_selections, max_selections) → `ModifierOption` (name, price_delta). A flat single-table model would not support this. These are two entirely different schema designs.
- **Impact If Left Undefined:** An incorrect single-table model cannot represent "choose 1–2 from sauces" without conflating grouping rules with individual options.
- **Clarification Question:** Is "Modifier" a Modifier Group (the container with min/max rules), or a single selectable option? Are there two separate tables — one for groups and one for options?

---

### Gap 4.2 — MenuItem Relationship Undefined

- **Missing Information:** No join table or FK is defined between `menu_items` and modifier entities.
- **Why Implementation Cannot Proceed:** The join table name, its fields, and whether a modifier group can be shared across multiple menu items (reusable) or belongs exclusively to one item — none are defined.
- **Impact If Left Undefined:** A reusable modifier group requires a join table (`menu_item_modifier_groups`). An exclusive one uses a `menu_item_id` FK directly.
- **Clarification Question:** Can a Modifier Group be shared across multiple Menu Items (reusable), or does it belong exclusively to one Menu Item?

---

### Gap 4.3 — Inventory Link Undefined

- **Missing Information:** `DatabaseSchema.md §25.2` states modifiers "directly link to ingredient/inventory deduction logic." No FK or intermediary table linking a modifier option to an inventory ingredient is defined.
- **Why Implementation Cannot Proceed:** The link may be a direct `ingredient_id` FK, an intermediary recipe table, or a deduction rule table. The structure is undefined.
- **Impact If Left Undefined:** Without this link, modifier-driven inventory deductions cannot be implemented in Phase 7 (Inventory).
- **Clarification Question:** Is the modifier-to-ingredient link a direct FK on the modifier option, or is it handled by a separate modifier recipe/deduction rule table?

---

## 5. Combo

### Gap 5.1 — Field List Undefined

- **Missing Information:** No fields are defined for the `combos` table (name, bundle price, etc.).
- **Why Implementation Cannot Proceed:** A Prisma model cannot be created without a field list.
- **Impact If Left Undefined:** Any field added is an undocumented engineering assumption.
- **Clarification Question:** What fields does the `combos` table require?

---

### Gap 5.2 — Constituent Item Join Table Undefined (Blocking)

- **Missing Information:** `DatabaseSchema.md §25.2` states: _"Must physically decompose into constituent items."_ No join table for Combo → MenuItem is named or defined.
- **Why Implementation Cannot Proceed:** The join table (e.g., `combo_items`) is essential to decomposition. Its name, fields (quantity, overrideable price), and FK strategy are undefined.
- **Impact If Left Undefined:** Without the join table, the financial COGS decomposition rule stated in the documentation cannot be persisted.
- **Clarification Question:** What is the name and field list of the join table connecting a Combo to its constituent Menu Items? Does each constituent item carry a quantity and/or a price override?

---

### Gap 5.3 — Menu Ownership Undefined

- **Missing Information:** No FK from `combos` to `menus` is defined. It is unclear whether a Combo belongs to a Menu or is a tenant-level construct.
- **Why Implementation Cannot Proceed:** Adding a `menu_id` FK is an assumption if not documented.
- **Impact If Left Undefined:** Tenant-level combos vs. menu-specific combos have different query patterns and isolation requirements.
- **Clarification Question:** Does a Combo belong to a specific Menu, or is it a tenant-level catalog item that can appear across menus?

---

## 6. Order

### Gap 6.1 — Status Enum Name Undefined

- **Missing Information:** `Architecture.md §13.1` defines the Order state machine values (`Draft`, `Placed`, `InPrep`, `Ready`, `Served`, `Paid`, `Closed`, `Voided`, `Cancelled`). The Prisma enum name for this status is not defined in any document.
- **Why Implementation Cannot Proceed:** Minor issue — the states themselves are fully documented. Only the enum name requires confirmation.
- **Impact If Left Undefined:** Low — naming can be derived as `OrderStatus`. Documented here for completeness.
- **Clarification Question:** What is the canonical name for the Order status enum (e.g., `OrderStatus`)?

---

### Gap 6.2 — Idempotency Key Uniqueness Scope Undefined

- **Missing Information:** `DatabaseSchema.md §13` requires an `idempotency_key` column for offline POS sync. The uniqueness scope is not defined: is the key unique globally, per-tenant, or per-branch?
- **Why Implementation Cannot Proceed:** The partial unique index definition depends on this scope. An incorrectly scoped index allows duplicate order processing across tenants or blocks legitimate same-key usage in different tenants.
- **Impact If Left Undefined:** Financial data integrity risk — a cross-tenant idempotency collision could reject a legitimate order or process a duplicate.
- **Clarification Question:** Is the `idempotency_key` unique globally (`UNIQUE(idempotency_key)`), per-tenant (`UNIQUE(tenant_id, idempotency_key)`), or per-branch?

---

### Gap 6.3 — Order Channel / Type Undefined

- **Missing Information:** No field is defined to distinguish order types (Dine-In, Takeaway, Delivery). The Architecture references POS and multiple order channels but no column is defined.
- **Why Implementation Cannot Proceed:** Minor — this could be deferred. Included here because its absence may affect the `status` state machine transitions and DiningTable FK (a Takeaway order has no table).
- **Impact If Left Undefined:** A `table_id` FK on `orders` would need to be nullable for non-dine-in orders, but the conditions under which it is required vs. optional cannot be enforced.
- **Clarification Question:** Does the `orders` table require an order type/channel field (e.g., `DineIn`, `Takeaway`, `Delivery`)? Is `table_id` optional or conditional?

---

## 7. OrderItem

### Gap 7.1 — Recipe Snapshot Storage Mechanism Undefined (Blocking)

- **Missing Information:** `DatabaseSchema.md §18` states: _"the price, tax rate, and recipe snapshot are copied to the `order_items` table."_ The physical storage mechanism for the recipe snapshot is undefined.
- **Why Implementation Cannot Proceed:** Three incompatible mechanisms exist: (a) a `recipe_snapshot JSONB` column on `order_items`, (b) a FK to a separate `recipe_snapshots` table, or (c) a set of denormalized ingredient columns. These cannot be chosen without documentation.
- **Impact If Left Undefined:** The recipe snapshot is a financial and inventory audit record. An incorrect implementation cannot be changed without migrating historical order data, which is prohibited by the immutability rules in `DatabaseSchema.md §3`.
- **Clarification Question:** Is the recipe snapshot stored as a JSONB column on `order_items`, or as a FK to a separate `recipe_snapshots` table?

---

### Gap 7.2 — Modifier Selections Storage Undefined

- **Missing Information:** No field, table, or FK is defined for storing the modifier selections applied to an OrderItem (e.g., "extra cheese" applied to a burger order).
- **Why Implementation Cannot Proceed:** Without a defined location, modifier selection data cannot be persisted. This is a join table (`order_item_modifiers`) that must be named and defined.
- **Impact If Left Undefined:** Modifier-level selections cannot be stored, making the receipt, kitchen ticket, and inventory deduction incomplete.
- **Clarification Question:** How are modifier selections for an OrderItem persisted? Is there an `order_item_modifiers` join table? What does it contain?

---

### Gap 7.3 — Individual Item Status Undefined

- **Missing Information:** `DatabaseSchema.md §25.4` states: _"Items cannot be billed if in 'In Prep' state unless explicitly split."_ This implies individual OrderItems may carry a status. No status enum or field is defined for `order_items`.
- **Why Implementation Cannot Proceed:** If `order_items` needs its own status (separate from the parent `orders.status`), a field and enum are required. If item status is tracked exclusively on `KitchenTicket`, no field is needed on `order_items`.
- **Impact If Left Undefined:** Split-billing logic in Phase 5 cannot be built without knowing which entity tracks individual item preparation state.
- **Clarification Question:** Does `order_items` carry its own status field, or is item-level preparation state tracked exclusively on the `KitchenTicket` entity?

---

## 8. DiningTable

### Gap 8.1 — Field List Undefined

- **Missing Information:** No field list is defined for `dining_tables` beyond the 3 status values (`Available`, `Seated`, `Billed`). No capacity, section, number, or display fields are defined.
- **Why Implementation Cannot Proceed:** A Prisma model cannot be created without a field list.
- **Impact If Left Undefined:** Any field added is an undocumented engineering assumption.
- **Clarification Question:** What fields does `dining_tables` require (e.g., `table_number`, `capacity`, `section`)?

---

### Gap 8.2 — Table Merge / Split Tables Undefined (Blocking)

- **Missing Information:** `DatabaseSchema.md §25.4` states: _"Supports Table Merging and Splitting via associative transaction tables."_ Neither the name nor the schema of these tables is defined.
- **Why Implementation Cannot Proceed:** The merge/split associative tables are explicitly required by the documentation but completely undefined. They cannot be implemented without their names, fields, FK strategy, and lifecycle.
- **Impact If Left Undefined:** Phase 5 POS operations cannot implement table splitting or merging, which are documented features.
- **Clarification Question:** What are the names and field lists of the associative tables for Table Merging and Table Splitting?

---

### Gap 8.3 — Status Enum Incomplete

- **Missing Information:** `DatabaseSchema.md §25.4` defines 3 states: `Available`, `Seated`, `Billed`. `Architecture.md §13.3` implies a `Reserved` state (Reservation lifecycle ends with a table being `Seated`). The complete set of valid table states is not consolidated in one place.
- **Why Implementation Cannot Proceed:** A partial enum risks requiring an `ALTER TYPE` migration when the missing state is discovered during Phase 5.
- **Impact If Left Undefined:** An `ALTER TYPE` on an enum in production PostgreSQL requires a table lock.
- **Clarification Question:** Is the complete set of `DiningTable` status values `Available`, `Reserved`, `Seated`, `Billed`? Are there additional states?

---

## 9. Reservation

### Gap 9.1 — Field List Undefined

- **Missing Information:** No field list is defined for the `reservations` table beyond the state machine values.
- **Why Implementation Cannot Proceed:** A Prisma model cannot be created without documented fields (e.g., `party_size`, `reserved_at`, `notes`).
- **Impact If Left Undefined:** Any field added is an undocumented engineering assumption.
- **Clarification Question:** What fields does `reservations` require (e.g., party size, date/time, special requests)?

---

### Gap 9.2 — DiningTable Foreign Key Undefined

- **Missing Information:** No FK from `reservations` to `dining_tables` is defined. The document implies tables are reserved, but the persistence of the table assignment is undefined.
- **Why Implementation Cannot Proceed:** Without a documented FK, adding `table_id` to `reservations` is an assumption.
- **Impact If Left Undefined:** A reservation without a table assignment has no physical persistence and cannot drive the Seating workflow.
- **Clarification Question:** Does a Reservation have a `table_id` FK? Is the table assignment made at booking time or at seating time?

---

### Gap 9.3 — Customer / Guest Link Undefined

- **Missing Information:** No FK to a Customer (CRM) record is defined for `reservations`. It is unclear whether a reservation links to a `customers` table row or stores standalone guest contact information (name, phone).
- **Why Implementation Cannot Proceed:** Linking to a CRM Customer (Phase 9) vs. storing guest info directly are structurally different. A CRM FK that is added later requires a migration that may not be possible without disrupting historical reservation data.
- **Impact If Left Undefined:** Contact information required for SMS/email confirmation (`Architecture.md §14`) has no defined storage location.
- **Clarification Question:** Does `reservations` store guest contact information as standalone fields (name, phone, email), or does it reference a `customers` table FK?

---

### Gap 9.4 — User (Took Reservation) FK Undefined

- **Missing Information:** No FK to the `users` table is defined for who created or manages the reservation.
- **Why Implementation Cannot Proceed:** Minor — `created_by` audit field partially covers this, but if a specific staff FK is required for assignment or ownership, it is not documented.
- **Impact If Left Undefined:** Reservation ownership for RBAC enforcement (e.g., only the host who created the reservation can modify it) cannot be implemented.
- **Clarification Question:** Does `reservations` require a dedicated `user_id` (host/staff) FK beyond the standard `created_by` audit field?

---

## Blocking Issues

These gaps prevent the Prisma models from being created at all. Implementation cannot begin until these are resolved.

| #   | Entity      | Gap                                             | Reason                                                                                                         |
| --- | ----------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| B1  | Menu        | Versioning mechanism (Gap 1.2)                  | Three mutually exclusive schema designs — wrong choice requires destructive migration                          |
| B2  | Menu        | Branch assignment strategy (Gap 1.3)            | Single `branch_id` FK vs. join table — structurally incompatible; cannot be changed without breaking migration |
| B3  | Modifier    | Structural model undefined (Gap 4.1)            | Modifier Group vs. Modifier Option is a fundamental two-table vs. one-table decision                           |
| B4  | Modifier    | MenuItem relationship undefined (Gap 4.2)       | Shared vs. exclusive modifier groups result in incompatible FK strategies                                      |
| B5  | Combo       | Constituent item join table undefined (Gap 5.2) | COGS decomposition cannot be persisted without the join table                                                  |
| B6  | OrderItem   | Recipe snapshot mechanism (Gap 7.1)             | Immutability rules prohibit migrating historical order data — wrong choice is permanently wrong                |
| B7  | OrderItem   | Modifier selections storage (Gap 7.2)           | Kitchen tickets and inventory deductions are incomplete without this                                           |
| B8  | DiningTable | Merge/Split tables undefined (Gap 8.2)          | Explicitly documented features with zero schema definition                                                     |

---

## Non-Blocking Issues

These ambiguities can be resolved after implementation begins, or can be deferred to the phase where they are first required. Implementing without them requires documenting the engineering decision explicitly.

| #    | Entity      | Gap                                    | Deferral Justification                                                                                                             |
| ---- | ----------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| NB1  | Menu        | Status/lifecycle undefined (Gap 1.4)   | Can default to published; lifecycle states can be added via migration before Phase 4 Admin UI                                      |
| NB2  | Category    | Field list undefined (Gap 2.1)         | Basic fields (`name`, `display_order`) are safe to derive; no financial consequence                                                |
| NB3  | Category    | Hierarchical FK confirmation (Gap 2.2) | `parent_id` self-reference is the only viable hierarchy model; safe to assume with explicit documentation in engineering decisions |
| NB4  | Category    | Menu FK undefined (Gap 2.3)            | Can safely assume `menu_id` FK; can be dropped if categories are tenant-level                                                      |
| NB5  | MenuItem    | Field list undefined (Gap 3.1)         | Basic fields derivable; **price data type must be confirmed before Phase 5**                                                       |
| NB6  | MenuItem    | Category relationship (Gap 3.2)        | One-to-many is safe default; join table can be added later if many-to-many required                                                |
| NB7  | MenuItem    | Availability/status field (Gap 3.3)    | Can be deferred to Phase 7 (Inventory) when 86'd logic is implemented                                                              |
| NB8  | Modifier    | Inventory link (Gap 4.3)               | Needed in Phase 7; can be added via migration when Supply Chain is implemented                                                     |
| NB9  | Combo       | Field list (Gap 5.1)                   | Basic fields derivable; no financial consequence until Phase 5                                                                     |
| NB10 | Combo       | Menu ownership (Gap 5.3)               | Safe to assume `menu_id` FK; can be revisited before Phase 4                                                                       |
| NB11 | Order       | Status enum name (Gap 6.1)             | Trivially derived as `OrderStatus` from Architecture.md §13.1                                                                      |
| NB12 | Order       | Idempotency key scope (Gap 6.2)        | **Must be resolved before Phase 5 POS implementation** — deferred here but not to Phase 5                                          |
| NB13 | Order       | Order channel/type (Gap 6.3)           | Can be added via migration before Phase 5; table_id can be nullable in interim                                                     |
| NB14 | OrderItem   | Individual item status (Gap 7.3)       | Defer to Phase 5 when split-billing logic is designed                                                                              |
| NB15 | DiningTable | Field list (Gap 8.1)                   | Basic fields (`table_number`, `capacity`) derivable; no financial consequence                                                      |
| NB16 | DiningTable | Status enum completeness (Gap 8.3)     | Deferring risks ALTER TYPE in production; recommended to resolve before Phase 5                                                    |
| NB17 | Reservation | Field list (Gap 9.1)                   | Basic fields derivable; no financial consequence                                                                                   |
| NB18 | Reservation | DiningTable FK (Gap 9.2)               | Can be nullable initially; must be confirmed before Phase 5 seating workflow                                                       |
| NB19 | Reservation | Customer/Guest link (Gap 9.3)          | Defer to Phase 9 CRM — standalone guest fields safe interim approach                                                               |
| NB20 | Reservation | User FK for host assignment (Gap 9.4)  | `created_by` audit field covers minimum requirement; can be expanded in Phase 4                                                    |

---

---

_End of Revision Report._

---

# Architecture Decisions

The following Architecture Decision Records (ADRs) document the open design questions identified during the documentation gap analysis and triage. Each record presents the decision space without recommending or selecting an option. The **Project Owner Decision** field in each record is intentionally left blank and must be completed before implementation of Task 1.2 begins.

---

## AD-001 — Menu Versioning

### Background

`DatabaseSchema.md §25.2` states: _"Versioned. Price changes create new versions to protect past operational reporting."_

`DatabaseSchema.md §18` states: _"When an order is placed, the price, tax rate, and recipe snapshot are copied to the `order_items` table. The order does not join back to the live `menu_items` table for its price. If a burger's price changes tomorrow, yesterday's sales reporting must remain unaffected."_

`DatabaseSchema.md §3` states: _"Immutability of Financial Records: Paid bills, closed shifts, and posted ledgers are immutable."_

The documentation establishes that past operational reporting must be protected from current price changes. It also establishes that price protection at the order level is achieved by snapshotting on `order_items`. What remains undefined is the versioning mechanism applied to the `menus` entity itself.

### Available Design Options

**Option 1 — Version Integer Column**
A `version` integer column exists on the `menus` row. When a menu is updated, the version number increments in place. No history of prior states is retained in the database.

**Option 2 — Immutable Row Per Version**
Each structural change to a menu creates a new `menus` row with an incremented version. The previous row is soft-deleted or marked as superseded. Historical menu states remain queryable.

**Option 3 — Separate Menu History Table**
A `menu_versions` table exists alongside `menus`. Each change to a menu appends a new row to `menu_versions`, preserving the full historical state at every point in time. The `menus` table always represents the current state.

**Option 4 — No Schema-Level Versioning**
The `menus` table carries no version field. Versioning is handled entirely at the application layer via the audit log (`audit_logs` table, `DatabaseSchema.md §25.8`). Historical menu states are reconstructed from the audit trail rather than stored directly.

### Advantages

| Option       | Key Advantages                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| **Option 1** | Simplest schema; low storage overhead; version acts as an optimistic concurrency control signal          |
| **Option 2** | Full history is queryable via standard SQL; no separate history table to join                            |
| **Option 3** | Cleanest separation of current state vs. historical state; minimal impact on live menu queries           |
| **Option 4** | No schema changes required; audit log already mandated for critical tables; eliminates redundant storage |

### Disadvantages

| Option       | Key Disadvantages                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| **Option 1** | No historical state recoverable; "version N" of a menu cannot be reconstructed after further edits            |
| **Option 2** | Requires careful FK management — all branch assignments, category FKs, and item FKs must be version-aware     |
| **Option 3** | Additional write on every menu mutation; history table grows unbounded; queries must join to history to audit |
| **Option 4** | Reconstructing menu state from audit logs is operationally complex; not queryable with standard ORM patterns  |

### Impacted Components

- `menus` table (primary schema impact)
- `menu_items` table (if versioning makes items version-specific, item FKs must include a version dimension)
- Admin ERP UI (Phase 4) — must display version history or changelog
- Reporting queries — must know which menu version was active during a given time window
- Redis cache invalidation strategy (`Architecture.md §11.3`) — cache key must include version context if queried by version

### Future Migration Risk

| Option       | Migration Risk                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Option 1** | Low — adding a history table later is additive                                                                                   |
| **Option 2** | High — changing from immutable rows to a history table requires restructuring all FK references                                  |
| **Option 3** | Low — history table can be introduced without affecting the core `menus` table                                                   |
| **Option 4** | Medium — if audit-log-based reconstruction proves insufficient, adding versioning later requires migrating historical audit data |

### Project Owner Decision

> **Decision:** Resolved
>
> **Selected Option:** Option 3 — Separate Menu History Table
>
> **Rationale:**
>
> - The live `menus` table always represents the current state.
> - Historical versions are stored in a dedicated append-only `menu_versions` table.
> - Foreign-key relationships continue referencing `menus.id` only.
> - Operational queries never require version filtering.
> - Historical reconstruction is supported through `menu_versions`.
> - This aligns with the history-table strategy documented elsewhere in the project (`DatabaseSchema.md §16`).

---

## AD-002 — Modifier Domain Model

### Background

`DatabaseSchema.md §25.2` states: _"Hierarchical grouping and customization of items. Modifiers carry min/max selection logic and directly link to ingredient/inventory deduction logic."_

`Architecture.md §6` classifies Modifiers within the **Catalog bounded context**, alongside Menus and Categories.

The documentation confirms two behavioral facts: (1) modifiers carry `min_selections` and `max_selections` logic, and (2) modifiers link to inventory deductions. What is not defined is the physical table structure representing a "modifier" — specifically whether the entity represents a grouping rule (a container) or a selectable item (an option).

### Available Design Options

**Option 1 — Single Flat `modifiers` Table**
One table contains both the grouping rules (`min_selections`, `max_selections`) and the individual selectable options (name, price delta). Parent-child relationships within the table use a `parent_id` self-reference. A "group" row has no `parent_id`; an "option" row has a `parent_id` pointing to its group.

**Option 2 — Two-Table Model: `modifier_groups` + `modifier_options`**
Two separate tables exist. `modifier_groups` stores the grouping rule (name, `min_selections`, `max_selections`). `modifier_options` stores individual selectable items (name, price delta, ingredient link) with a `group_id` FK to `modifier_groups`. No self-referencing.

**Option 3 — Three-Table Model: `modifier_groups` + `modifier_options` + `modifier_option_ingredients`**
Extends Option 2. A third table (`modifier_option_ingredients`) resolves the modifier-to-ingredient link documented in `DatabaseSchema.md §25.2`, rather than a direct `ingredient_id` FK on `modifier_options`.

### Advantages

| Option       | Key Advantages                                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **Option 1** | Single table; fewer joins; simpler migration history                                                                         |
| **Option 2** | Clear semantic separation of rule (group) vs. choice (option); standard industry pattern; enforces type safety               |
| **Option 3** | Supports multi-ingredient modifiers (e.g., "add avocado" deducts avocado + 5g lime); maximum fidelity to inventory deduction |

### Disadvantages

| Option       | Key Disadvantages                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Option 1** | Type ambiguity — rows represent two different things; `min_selections` is null on option rows; self-referencing adds query complexity |
| **Option 2** | Additional table to manage; direct `ingredient_id` FK on `modifier_options` limits to single-ingredient deductions                    |
| **Option 3** | Three-table join for every modifier query; adds Phase 7 dependency to the Catalog schema                                              |

### Impacted Components

- POS cart rendering (Phase 5) — modifier selection UI is driven directly by this model
- Kitchen Ticket (Phase 6) — modifier selections appear on kitchen tickets
- Inventory deduction (Phase 7) — modifier-to-ingredient link is required for recipe explosion
- OrderItem modifier selections storage (`AD-007 / B7`) — the join table for selected modifiers references whichever "option" entity this decision creates

### Future Migration Risk

| Option       | Migration Risk                                                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option 1** | High — migrating from flat self-reference to two-table model requires splitting rows and rewiring all FK references in `order_item_modifiers` |
| **Option 2** | Low — adding a third `modifier_option_ingredients` table later is purely additive                                                             |
| **Option 3** | Low — no further structural changes anticipated                                                                                               |

### Project Owner Decision

> **Decision:** Resolved
>
> **Selected Option:** Option 2 — Modifier Groups + Modifier Options
>
> **Rationale:**
>
> - Modifier groups and modifier options are separate domain concepts.
> - Catalog remains independent from Supply Chain.
> - Ingredient relationships are intentionally deferred to the Supply Chain bounded context.
> - Future support for multi-ingredient deduction will be introduced through an additive `modifier_option_ingredients` table.
> - This decision minimizes coupling while preserving future extensibility.

---

## AD-003 — Modifier Reuse Strategy

### Background

`DatabaseSchema.md §25.2` states that modifiers "directly link to ingredient/inventory deduction logic" and carry `min/max selection logic`. The documentation does not specify whether a Modifier Group is defined once and reused across multiple Menu Items, or whether each Menu Item exclusively owns its own set of modifier definitions.

`DatabaseSchema.md §8` states: _"Many-to-Many: Resolved exclusively through explicit associative (join) tables."_

This decision determines whether a many-to-many join table (`menu_item_modifier_groups`) is required between `menu_items` and `modifier_groups`, or whether a direct one-to-many FK (`menu_item_id` on `modifier_groups`) is sufficient.

### Available Design Options

**Option 1 — Exclusive Ownership (One-to-Many)**
Each Modifier Group belongs to exactly one Menu Item. A `menu_item_id` FK column exists on `modifier_groups`. A modifier group cannot be shared across items.

**Option 2 — Reusable (Many-to-Many via Join Table)**
Modifier Groups are tenant-level reusable catalog entities. A `menu_item_modifier_groups` join table links Menu Items to Modifier Groups. The same "Sauce Choice" group can apply to any number of menu items without duplication.

**Option 3 — Hybrid (Reusable Templates + Item-Level Overrides)**
A base Modifier Group can be defined as a tenant-level template and then linked to a Menu Item with optional item-level overrides (e.g., "Sauce Choice" globally has 5 options, but for the Kids Burger, only 3 options are exposed). Requires an additional override layer.

### Advantages

| Option       | Key Advantages                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option 1** | Simplest join structure; each item's modifiers are fully independent; no shared-state side effects                                           |
| **Option 2** | Eliminates duplication for chains with standardized modifier groups; consistent modifier updates propagate to all linked items automatically |
| **Option 3** | Maximum operational flexibility; supports chain-wide standards with branch-level customization                                               |

### Disadvantages

| Option       | Key Disadvantages                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option 1** | Modifier groups duplicated across every item that shares the same options; updating a common modifier (e.g., "add sauce") requires updating every item's copy individually |
| **Option 2** | A shared modifier group update propagates to all linked items — an unintended consequence if updating only one item's modifiers was intended                               |
| **Option 3** | Most complex schema; override layer adds significant query complexity                                                                                                      |

### Impacted Components

- `modifier_groups` table structure (FK vs. no FK to `menu_items`)
- `menu_item_modifier_groups` join table (exists only in Options 2 and 3)
- Admin ERP UI (Phase 4) — determines whether modifiers are managed globally or per-item
- POS menu data cache (Redis) — reusable groups require different cache key design than per-item groups

### Future Migration Risk

| Option       | Migration Risk                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| **Option 1** | Medium — migrating to reusable groups later requires deduplication logic across all existing modifier rows |
| **Option 2** | Low — adding item-level overrides later is additive                                                        |
| **Option 3** | Low — already the most flexible structure                                                                  |

### Project Owner Decision

> **Decision:** Resolved
>
> **Selected Option:** Option 2 — Reusable Modifier Groups via Join Table
>
> **Rationale:**
>
> - Modifier Groups are reusable tenant-level catalog resources.
> - Menu Items are associated with Modifier Groups through an explicit many-to-many join table.
> - This follows the documented relationship strategy of explicit associative tables (`DatabaseSchema.md §8`).
> - The design minimizes catalog duplication while maintaining normalization.
> - Enterprise menu management requires centralized modifier definitions that can be reused across multiple menu items.
> - Branch-specific override behavior is intentionally NOT implemented because it is not required by the frozen documentation.
> - If future requirements introduce branch-level customization, an additive override layer may be implemented without breaking the existing model.
> - This decision aligns with the project's multi-tenant architecture and preserves clean bounded contexts.

---

## AD-004 — Recipe Snapshot Strategy

### Background

`DatabaseSchema.md §18` states: _"When an order is placed, the price, tax rate, and recipe snapshot are copied to the `order_items` table. The order does not join back to the live `menu_items` table for its price. If a burger's price changes tomorrow, yesterday's sales reporting must remain unaffected."_

`DatabaseSchema.md §3` states: _"Immutability of Financial Records: Paid bills, closed shifts, and posted ledgers are immutable. Corrections require explicit, audited counter-transactions."_

`DatabaseSchema.md §17` states: _"Physical `DELETE` statements are prohibited for master and operational data."_

The documentation mandates that recipe information is copied (snapshotted) at order time and must never be mutated retroactively. The physical mechanism for storing this snapshot is not defined.

### Available Design Options

**Option 1 — JSONB Column on `order_items`**
A `recipe_snapshot` column of type `JSONB` is added to the `order_items` table. At order creation, the full recipe (ingredients, quantities, yield factors) is serialized into this column as a JSON object. No additional table is required.

**Option 2 — Separate `order_item_recipe_snapshots` Table**
A dedicated table stores the recipe snapshot with normalized rows (one row per ingredient line in the snapshot). A FK on `order_items` references this table. The snapshot is relational and queryable without JSON parsing.

**Option 3 — FK to a Versioned `recipe_versions` Table (Shared Snapshots)**
Recipes are versioned in a `recipe_versions` table. At order time, `order_items` stores a `recipe_version_id` FK pointing to the specific version of the recipe that was active at that moment. The snapshot is shared — multiple orders referencing the same recipe version point to the same row.

**Option 4 — Combined: JSONB Snapshot + Recipe Version Reference**
`order_items` stores both a `recipe_version_id` FK (for traceability back to the source recipe) and a `recipe_snapshot JSONB` column (for immutable self-contained storage). The JSONB is the authoritative financial record; the FK is for audit provenance.

### Advantages

| Option       | Key Advantages                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Option 1** | No additional table; fully self-contained; zero join overhead for reading the snapshot; simple write path                        |
| **Option 2** | Snapshot data is queryable with standard SQL (`WHERE ingredient_id = ?`); supports aggregate COGS reporting without JSON parsing |
| **Option 3** | Minimal storage — many orders share the same recipe version row; supports COGS reporting on a version basis                      |
| **Option 4** | Best of both: immutability via JSONB + traceability via FK; survives source recipe deletion without data loss                    |

### Disadvantages

| Option       | Key Disadvantages                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option 1** | Snapshot is opaque to relational queries; COGS aggregations require application-layer JSON parsing or PostgreSQL JSONB operators                        |
| **Option 2** | Additional table with potentially millions of rows at scale; high write volume at peak order times                                                      |
| **Option 3** | Not a true snapshot — if a `recipe_versions` row is ever mutated (even accidentally), historical orders are affected; violates the immutability mandate |
| **Option 4** | Highest storage cost; two writes per order item; most complex implementation                                                                            |

### Impacted Components

- `order_items` table (column structure depends entirely on this decision)
- COGS reporting queries (Phase 8 Finance) — aggregation complexity varies by option
- Inventory deduction workers (`Architecture.md §11.4`) — workers process order items to calculate depletion; their query pattern depends on snapshot structure
- `recipe_versions` or `recipes` table in Task 1.3 (Supply Chain) — Option 3 creates a cross-task dependency

### Future Migration Risk

| Option       | Migration Risk                                                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option 1** | High — migrating from JSONB to a relational structure requires parsing and re-inserting millions of historical JSON records; violates immutability mandate |
| **Option 2** | Medium — restructuring the snapshot table's schema after orders exist is difficult                                                                         |
| **Option 3** | Very High — discovering Option 3 does not meet immutability requirements after production orders exist has no clean resolution                             |
| **Option 4** | Low — already the most complete structure; future changes are additive                                                                                     |

### Project Owner Decision

> **Decision:** Resolved
>
> **Selected Option:** Option 2 — Separate `order_item_recipe_snapshots` Table
>
> **Rationale:**
>
> - Preserves immutable historical financial records.
> - Provides the strongest support for historical inventory reconciliation.
> - Enables efficient relational SQL queries for COGS, auditing, reporting, and analytics.
> - Aligns with the project's normalized relational database philosophy.
> - Keeps historical recipe data independent of future recipe modifications.
> - Supports enterprise-grade auditability and financial traceability.
> - Avoids JSON parsing for operational and reporting queries.
> - Accepts higher write overhead as a deliberate trade-off for long-term data integrity and maintainability.

---

## AD-005 — Dining Table Merge / Split Model

### Background

`DatabaseSchema.md §25.4` states: _"Supports Table Merging and Splitting via associative transaction tables. Overbooking allowed based on tenant policy threshold."_

`Architecture.md §13.1` defines the Order lifecycle: `Draft → Placed → InPrep → Ready → Served → Paid → Closed`. It defines valid exceptions: `Voided`, `Cancelled`.

`Architecture.md §6.1` states the Ordering context _"Owns: Orders, line items, split bills, POS active sessions, table states."_

The documentation confirms that table merge and split operations are a required feature and that they are persisted via "associative transaction tables." Neither the operational behavior of a merge/split (what happens to the associated Orders) nor the schema of the associative tables is defined.

### Available Design Options

**Option A — Merge/Split as Table Relationship Records Only**
The associative tables record only the physical table grouping (`table_merge_groups`: which `dining_table` rows are currently merged). Orders are not structurally linked by the merge — a single new Order is created manually by the cashier spanning the merged group. The associative table is a display-layer concern only.

**Option B — Merge Creates a Parent Order**
When tables are merged, a new parent `order` row is created. The existing per-table orders become child orders linked to the parent via a `order_merges` join table. Billing operates on the parent order. Splitting removes the parent and restores the individual child orders.

**Option C — Merge Reassigns Order Items**
When tables are merged, all `order_items` from the source table's order are physically reassigned (their `order_id` FK updated) to the target table's order. Splitting reverses this by moving items back. No join table for orders — the merge is expressed entirely by item-level reassignment.

**Option D — Merge/Split as an Audit-Only Event**
The associative tables are append-only event log tables (`table_merge_events`, `table_split_events`) recording what was merged/split, when, and by whom. The operational effect (combined billing) is handled at the application layer without structural schema changes to `orders` or `order_items`.

### Advantages

| Option       | Key Advantages                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| **Option A** | Simplest schema impact; merge is a display concern only; no structural changes to orders                            |
| **Option B** | Clean parent-child order hierarchy; billing naturally operates on the parent; full audit trail via order hierarchy  |
| **Option C** | No new tables for orders; merge is expressed through existing FK relationships                                      |
| **Option D** | Schema impact is minimal; merge/split history is permanently auditable; no structural mutation of financial records |

### Disadvantages

| Option       | Key Disadvantages                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Option A** | Does not support automatic bill consolidation; requires cashier to manually re-create an order spanning the merged tables                          |
| **Option B** | Parent order concept is not defined in the Order lifecycle state machine (`Architecture.md §13.1`); requires extending the state machine           |
| **Option C** | Mutating `order_id` FKs on `order_items` violates the spirit of the immutability principle for operational records; creates complex rollback logic |
| **Option D** | Application layer bears full responsibility for interpreting merge/split state; risk of divergence between event log and actual order state        |

### Impacted Components

- `dining_tables` table
- `orders` table (Options B and C require structural changes or new FKs)
- `order_items` table (Option C requires mutable `order_id` FK)
- POS Table Map UI (Phase 5) — visual representation of merged tables
- Billing / Invoice engine (Phase 8 Finance) — consolidated bill generation depends on this model
- `Architecture.md §13.1` Order Lifecycle — Options B and C may require state machine extension

### Future Migration Risk

| Option       | Migration Risk                                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| **Option A** | Medium — if automatic consolidation is later required, orders must be restructured                                   |
| **Option B** | Medium — extending a parent-child order hierarchy into an existing orders table requires careful migration           |
| **Option C** | High — if immutability requirements are later applied to `order_id`, all historical merge operations are invalidated |
| **Option D** | Low — event log is additive; application logic changes do not require schema migration                               |

### Project Owner Decision

> **Decision:** Resolved
>
> **Selected Option:** Option B — Merge Creates a Parent Order
>
> **Rationale:**
>
> - Provides first-class support for enterprise restaurant table merges.
> - Enables automated consolidated billing while preserving individual table order context.
> - Keeps kitchen operations independent because kitchen tickets continue to originate from child orders.
> - Creates a clear financial hierarchy through parent-child orders.
> - Preserves a complete audit trail of merge operations.
> - Aligns with the project's Ordering bounded context, which owns orders, split bills, and table states.
> - Accepts the additional parent-child relationship as a deliberate trade-off for improved operational workflows and future extensibility.
> - Future implementation must document the parent-order lifecycle extension to remain consistent with the Order state machine.

---

_End of Document._
