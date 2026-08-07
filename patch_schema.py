import sys
schema_path = 'packages/database/prisma/schema.prisma'
with open(schema_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add to Tenant
tenant_relations = """
    // Relations — CRM
    customers              Customer[]
    memberships            Membership[]
    loyaltyLedgers         LoyaltyLedger[]
    coupons                Coupon[]
    giftCards              GiftCard[]"""
content = content.replace('    supplierInvoices       SupplierInvoice[]', '    supplierInvoices       SupplierInvoice[]' + tenant_relations)

# Add to Order
order_relations = """
    customerId    String?     @map("customer_id")
    couponId      String?     @map("coupon_id")
    customer      Customer?   @relation(fields: [customerId], references: [id], onDelete: Restrict)
    coupon        Coupon?     @relation(fields: [couponId], references: [id], onDelete: Restrict)
    loyaltyLedgers LoyaltyLedger[]"""
content = content.replace('    orderItems             OrderItem[]', '    orderItems             OrderItem[]' + order_relations)

# Add to Invoice
invoice_relations = """
    customerId    String?     @map("customer_id")
    customer      Customer?   @relation(fields: [customerId], references: [id], onDelete: Restrict)"""
content = content.replace('    refunds  Refund[]', '    refunds  Refund[]' + invoice_relations)

crm_models = """
// ==========================================
// CRM MODELS
// ==========================================

enum CustomerStatus {
  ACTIVE
  INACTIVE
  BLACKLISTED
}

enum CouponType {
  PERCENTAGE
  FIXED_AMOUNT
  BOGO
}

enum CouponStatus {
  ACTIVE
  INACTIVE
  EXPIRED
}

enum GiftCardStatus {
  ACTIVE
  EXPIRED
  DEPLETED
  BLOCKED
}

enum LoyaltyTransactionType {
  EARNED
  REDEEMED
  EXPIRED
  ADJUSTED
}

enum MembershipTier {
  BASIC
  SILVER
  GOLD
  PLATINUM
}

model Customer {
  id        String   @id @default(uuid())
  tenantId  String   @map("tenant_id")
  firstName String   @map("first_name")
  lastName  String   @map("last_name")
  email     String?
  phone     String?
  status    CustomerStatus @default(ACTIVE)

  // Audit Fields
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  createdBy String?  @map("created_by")
  updatedBy String?  @map("updated_by")

  // Soft Delete
  isDeleted Boolean   @default(false) @map("is_deleted")
  deletedAt DateTime? @map("deleted_at")

  // Relations
  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  memberships Membership[]
  loyaltyLedgers LoyaltyLedger[]
  orders Order[]
  invoices Invoice[]

  @@index([tenantId])
  @@index([tenantId, email])
  @@index([tenantId, phone])
  @@map("customers")
}

model Membership {
  id         String   @id @default(uuid())
  tenantId   String   @map("tenant_id")
  customerId String   @map("customer_id")
  tier       MembershipTier @default(BASIC)
  
  joinedAt   DateTime @default(now()) @map("joined_at")
  expiresAt  DateTime? @map("expires_at")

  // Audit Fields
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  createdBy String?  @map("created_by")
  updatedBy String?  @map("updated_by")

  // Soft Delete
  isDeleted Boolean   @default(false) @map("is_deleted")
  deletedAt DateTime? @map("deleted_at")

  // Relations
  tenant   Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  customer Customer @relation(fields: [customerId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([customerId])
  @@map("memberships")
}

model LoyaltyLedger {
  id         String   @id @default(uuid())
  tenantId   String   @map("tenant_id")
  customerId String   @map("customer_id")
  orderId    String?  @map("order_id")
  
  points     Int
  type       LoyaltyTransactionType
  reason     String?

  // Audit Fields
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  createdBy String?  @map("created_by")
  updatedBy String?  @map("updated_by")

  // Soft Delete
  isDeleted Boolean   @default(false) @map("is_deleted")
  deletedAt DateTime? @map("deleted_at")

  // Relations
  tenant   Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  customer Customer @relation(fields: [customerId], references: [id], onDelete: Restrict)
  order    Order?   @relation(fields: [orderId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([customerId])
  @@map("loyalty_ledgers")
}

model Coupon {
  id           String   @id @default(uuid())
  tenantId     String   @map("tenant_id")
  code         String
  type         CouponType
  value        Decimal  @db.Decimal(10, 2)
  minOrderValue Decimal? @map("min_order_value") @db.Decimal(10, 2)
  status       CouponStatus @default(ACTIVE)
  
  validFrom    DateTime? @map("valid_from")
  validUntil   DateTime? @map("valid_until")
  maxUses      Int?      @map("max_uses")
  currentUses  Int       @default(0) @map("current_uses")

  // Audit Fields
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  createdBy String?  @map("created_by")
  updatedBy String?  @map("updated_by")

  // Soft Delete
  isDeleted Boolean   @default(false) @map("is_deleted")
  deletedAt DateTime? @map("deleted_at")

  // Relations
  tenant   Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  orders   Order[]

  @@index([tenantId])
  @@index([tenantId, code])
  @@map("coupons")
}

model GiftCard {
  id           String   @id @default(uuid())
  tenantId     String   @map("tenant_id")
  code         String
  initialValue Decimal  @map("initial_value") @db.Decimal(10, 2)
  currentBalance Decimal @map("current_balance") @db.Decimal(10, 2)
  status       GiftCardStatus @default(ACTIVE)

  expiresAt    DateTime? @map("expires_at")

  // Audit Fields
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  createdBy String?  @map("created_by")
  updatedBy String?  @map("updated_by")

  // Soft Delete
  isDeleted Boolean   @default(false) @map("is_deleted")
  deletedAt DateTime? @map("deleted_at")

  // Relations
  tenant   Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict)

  @@index([tenantId])
  @@index([tenantId, code])
  @@map("gift_cards")
}
"""

with open(schema_path, 'w', encoding='utf-8') as f:
    f.write(content + '\n' + crm_models)
