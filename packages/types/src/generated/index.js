import { z } from 'zod';
import { Prisma } from '@prisma/client';
export const transformJsonNull = (v) => {
  if (!v || v === 'DbNull') return Prisma.NullTypes.DbNull;
  if (v === 'JsonNull') return Prisma.NullTypes.JsonNull;
  return v;
};
export const JsonValueSchema = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(
      z.string(),
      z.lazy(() => JsonValueSchema.optional()),
    ),
    z.array(z.lazy(() => JsonValueSchema)),
  ]),
);
export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));
export const InputJsonValueSchema = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.any() }),
    z.record(
      z.string(),
      z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)])),
    ),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ]),
);
// DECIMAL
//------------------------------------------------------
export const DecimalJsLikeSchema = z.object({
  d: z.array(z.number()),
  e: z.number(),
  s: z.number(),
  toFixed: z.any(),
});
export const DECIMAL_STRING_REGEX =
  /^(?:-?Infinity|NaN|-?(?:0[bB][01]+(?:\.[01]+)?(?:[pP][-+]?\d+)?|0[oO][0-7]+(?:\.[0-7]+)?(?:[pP][-+]?\d+)?|0[xX][\da-fA-F]+(?:\.[\da-fA-F]+)?(?:[pP][-+]?\d+)?|(?:\d+|\d*\.\d+)(?:[eE][-+]?\d+)?))$/;
export const isValidDecimalInput = (v) => {
  if (v === undefined || v === null) return false;
  return (
    (typeof v === 'object' && 'd' in v && 'e' in v && 's' in v && 'toFixed' in v) ||
    (typeof v === 'string' && DECIMAL_STRING_REGEX.test(v)) ||
    typeof v === 'number'
  );
};
/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////
export const TransactionIsolationLevelSchema = z.enum([
  'ReadUncommitted',
  'ReadCommitted',
  'RepeatableRead',
  'Serializable',
]);
export const TenantScalarFieldEnumSchema = z.enum([
  'id',
  'name',
  'status',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const BranchScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'name',
  'taxConfig',
  'timezone',
  'currency',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const UserScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'email',
  'firstName',
  'lastName',
  'pin',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const RoleScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'parentId',
  'name',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const PermissionScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'roleId',
  'module',
  'resource',
  'action',
  'scope',
  'thresholdKey',
  'isDeny',
  'effectiveFrom',
  'effectiveUntil',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const UserRoleScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'userId',
  'roleId',
  'branchId',
  'effectiveFrom',
  'effectiveUntil',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const BranchAssignmentScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'userId',
  'branchId',
  'effectiveFrom',
  'effectiveUntil',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const MenuScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'name',
  'description',
  'status',
  'version',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const MenuVersionScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'menuId',
  'name',
  'description',
  'status',
  'version',
  'recordedAt',
  'recordedBy',
]);
export const MenuBranchScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'menuId',
  'branchId',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const CategoryScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'menuId',
  'parentId',
  'name',
  'description',
  'sortOrder',
  'status',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const MenuItemScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'categoryId',
  'name',
  'description',
  'price',
  'taxRate',
  'sortOrder',
  'status',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const ModifierGroupScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'name',
  'minSelections',
  'maxSelections',
  'isRequired',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const ModifierOptionScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'modifierGroupId',
  'name',
  'priceDelta',
  'sortOrder',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const MenuItemModifierGroupScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'menuItemId',
  'modifierGroupId',
  'sortOrder',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const ComboScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'name',
  'description',
  'price',
  'taxRate',
  'status',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const ComboItemScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'comboId',
  'menuItemId',
  'quantity',
  'sortOrder',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const DiningTableScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'tableNumber',
  'capacity',
  'status',
  'floorSection',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const ReservationScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'diningTableId',
  'userId',
  'guestName',
  'guestPhone',
  'partySize',
  'scheduledAt',
  'status',
  'notes',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const OrderScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'diningTableId',
  'userId',
  'status',
  'orderType',
  'parentOrderId',
  'idempotencyKey',
  'version',
  'subtotal',
  'taxAmount',
  'totalAmount',
  'notes',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
  'customerId',
  'couponId',
]);
export const OrderMergeScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'parentOrderId',
  'childOrderId',
  'mergedAt',
  'mergedBy',
  'resolvedAt',
  'resolvedBy',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const OrderItemScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'orderId',
  'menuItemId',
  'status',
  'quantity',
  'unitPrice',
  'taxRate',
  'totalPrice',
  'notes',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const OrderItemModifierSelectionScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'orderItemId',
  'modifierOptionId',
  'priceDeltaSnapshot',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const OrderItemRecipeSnapshotScalarFieldEnumSchema = z.enum([
  'id',
  'orderItemId',
  'recipeId',
  'recipeName',
  'ingredientId',
  'ingredientName',
  'quantity',
  'unit',
  'yieldLossPct',
  'spoilagePct',
  'capturedAt',
]);
export const SupplierScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'name',
  'code',
  'status',
  'contactName',
  'contactEmail',
  'contactPhone',
  'address',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const IngredientScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'name',
  'unit',
  'unitCost',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const InventoryItemScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'ingredientId',
  'theoreticalQty',
  'actualQty',
  'reorderLevel',
  'reorderQty',
  'version',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const InventoryBatchScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'ingredientId',
  'batchNumber',
  'receivedQty',
  'remainingQty',
  'unitCost',
  'expiresAt',
  'receivedAt',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const StockMovementScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'ingredientId',
  'movementType',
  'quantityDelta',
  'unitCost',
  'referenceId',
  'referenceType',
  'notes',
  'createdAt',
  'createdBy',
]);
export const RecipeScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'menuItemId',
  'name',
  'description',
  'version',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const RecipeIngredientScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'recipeId',
  'ingredientId',
  'branchId',
  'quantity',
  'unit',
  'yieldLossPct',
  'spoilagePct',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const PurchaseOrderScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'supplierId',
  'status',
  'poNumber',
  'subtotal',
  'taxAmount',
  'total',
  'orderedAt',
  'expectedAt',
  'notes',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const PurchaseOrderItemScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'purchaseOrderId',
  'ingredientId',
  'orderedQty',
  'unit',
  'unitCost',
  'totalCost',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const GoodsReceiptScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'purchaseOrderId',
  'status',
  'grnNumber',
  'receivedAt',
  'notes',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const GoodsReceiptItemScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'goodsReceiptId',
  'ingredientId',
  'receivedQty',
  'acceptedQty',
  'rejectedQty',
  'unit',
  'unitCost',
  'notes',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const LedgerAccountScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'parentId',
  'code',
  'name',
  'type',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const ShiftScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'userId',
  'status',
  'openedAt',
  'closedAt',
  'openingFloat',
  'closingFloat',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const CashDrawerScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'shiftId',
  'name',
  'openingBalance',
  'closingBalance',
  'isOpen',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const DailyClosingScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'closingDate',
  'status',
  'expectedCash',
  'actualCash',
  'variance',
  'totalRevenue',
  'notes',
  'lockedAt',
  'lockedBy',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const InvoiceScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'orderId',
  'status',
  'subtotal',
  'taxAmount',
  'total',
  'issuedAt',
  'dueAt',
  'notes',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
  'customerId',
]);
export const PaymentScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'invoiceId',
  'status',
  'method',
  'amount',
  'referenceCode',
  'giftCardId',
  'gatewayPayload',
  'idempotencyKey',
  'capturedAt',
  'notes',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const RefundScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'invoiceId',
  'paymentId',
  'status',
  'amount',
  'reason',
  'notes',
  'approvedBy',
  'approvedAt',
  'idempotencyKey',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const JournalScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'shiftId',
  'description',
  'referenceId',
  'referenceType',
  'isPosted',
  'postedAt',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const JournalEntryScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'journalId',
  'ledgerAccountId',
  'entryType',
  'amount',
  'description',
  'createdAt',
  'createdBy',
]);
export const AuditLogScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'userId',
  'entityType',
  'entityId',
  'action',
  'beforeState',
  'afterState',
  'reason',
  'ipAddress',
  'userAgent',
  'correlationId',
  'createdAt',
]);
export const ConfigurationScalarFieldEnumSchema = z.enum([
  'id',
  'level',
  'key',
  'value',
  'tenantId',
  'branchId',
  'stationId',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const FiscalPeriodScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'name',
  'startDate',
  'endDate',
  'isClosed',
  'closedAt',
  'closedBy',
  'createdAt',
  'updatedAt',
  'isDeleted',
]);
export const CostCenterScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'code',
  'name',
  'description',
  'createdAt',
  'updatedAt',
  'isDeleted',
]);
export const SupplierInvoiceScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'supplierId',
  'purchaseOrderId',
  'invoiceNumber',
  'invoiceDate',
  'dueDate',
  'totalAmount',
  'taxAmount',
  'status',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
]);
export const CustomerScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'firstName',
  'lastName',
  'email',
  'phone',
  'status',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const MembershipScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'customerId',
  'tier',
  'joinedAt',
  'expiresAt',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const LoyaltyLedgerScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'customerId',
  'orderId',
  'points',
  'type',
  'reason',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const CouponScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'code',
  'type',
  'value',
  'minOrderValue',
  'status',
  'validFrom',
  'validUntil',
  'maxUses',
  'currentUses',
  'maxDiscountValue',
  'isStackable',
  'maxUsesPerCustomer',
  'applicableCategoryIds',
  'applicableItemIds',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
]);
export const CouponCustomerUsageScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'couponId',
  'customerId',
  'orderId',
  'usedAt',
]);
export const GiftCardScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'code',
  'initialValue',
  'currentBalance',
  'status',
  'expiresAt',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'isDeleted',
  'deletedAt',
  'customerId',
]);
export const GiftCardTransactionScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'giftCardId',
  'orderId',
  'paymentId',
  'type',
  'amount',
  'balanceAfter',
  'notes',
  'createdAt',
]);
export const AnalyticsSnapshotScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'branchId',
  'type',
  'data',
  'periodStart',
  'periodEnd',
  'capturedAt',
]);
export const SortOrderSchema = z.enum(['asc', 'desc']);
export const NullableJsonNullValueInputSchema = z
  .enum(['DbNull', 'JsonNull'])
  .transform((value) =>
    value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value,
  );
export const JsonNullValueInputSchema = z
  .enum(['JsonNull'])
  .transform((value) => (value === 'JsonNull' ? Prisma.JsonNull : value));
export const QueryModeSchema = z.enum(['default', 'insensitive']);
export const NullsOrderSchema = z.enum(['first', 'last']);
export const JsonNullValueFilterSchema = z
  .enum(['DbNull', 'JsonNull', 'AnyNull'])
  .transform((value) =>
    value === 'JsonNull'
      ? Prisma.JsonNull
      : value === 'DbNull'
        ? Prisma.DbNull
        : value === 'AnyNull'
          ? Prisma.AnyNull
          : value,
  );
export const TenantStatusSchema = z.enum(['CREATED', 'ACTIVE', 'SUSPENDED']);
export const PermissionScopeSchema = z.enum(['OWN', 'BRANCH', 'TENANT', 'ANY']);
export const MenuStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);
export const CategoryStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);
export const MenuItemStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']);
export const ComboStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);
export const TableStatusSchema = z.enum(['AVAILABLE', 'SEATED', 'BILLED', 'RESERVED']);
export const ReservationStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'SEATED',
  'CANCELLED',
  'NO_SHOW',
]);
export const OrderStatusSchema = z.enum([
  'DRAFT',
  'PLACED',
  'IN_PREP',
  'READY',
  'SERVED',
  'PAID',
  'CLOSED',
  'VOIDED',
  'CANCELLED',
]);
export const OrderTypeSchema = z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY']);
export const OrderItemStatusSchema = z.enum(['PENDING', 'IN_PREP', 'READY', 'SERVED', 'VOIDED']);
export const SupplierStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'BLACKLISTED']);
export const IngredientUnitSchema = z.enum([
  'KG',
  'G',
  'L',
  'ML',
  'PIECE',
  'PORTION',
  'BOX',
  'PACK',
]);
export const StockMovementTypeSchema = z.enum([
  'PURCHASE',
  'CONSUMPTION',
  'SPOILAGE',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'ADJUSTMENT',
  'RETURN',
]);
export const PurchaseOrderStatusSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CANCELLED',
]);
export const GoodsReceiptStatusSchema = z.enum(['PENDING', 'COMPLETED', 'REJECTED']);
export const InvoiceStatusSchema = z.enum([
  'DRAFT',
  'ISSUED',
  'PARTIALLY_PAID',
  'PAID',
  'VOIDED',
  'REFUNDED',
]);
export const PaymentStatusSchema = z.enum([
  'INITIATED',
  'AUTHORIZED',
  'CAPTURED',
  'FAILED',
  'VOIDED',
  'REFUNDED',
]);
export const PaymentMethodSchema = z.enum([
  'CASH',
  'CARD',
  'MOBILE',
  'GIFT_CARD',
  'LOYALTY',
  'SPLIT',
]);
export const RefundStatusSchema = z.enum(['PENDING', 'APPROVED', 'PROCESSED', 'REJECTED']);
export const JournalEntryTypeSchema = z.enum(['DEBIT', 'CREDIT']);
export const LedgerAccountTypeSchema = z.enum([
  'ASSET',
  'LIABILITY',
  'EQUITY',
  'REVENUE',
  'EXPENSE',
]);
export const ShiftStatusSchema = z.enum(['OPEN', 'CLOSED']);
export const DailyClosingStatusSchema = z.enum(['PENDING', 'RECONCILED', 'LOCKED']);
export const ConfigurationLevelSchema = z.enum(['GLOBAL', 'TENANT', 'BRANCH', 'STATION']);
export const CustomerStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'BLACKLISTED']);
export const CouponTypeSchema = z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'BOGO']);
export const CouponStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED']);
export const GiftCardStatusSchema = z.enum(['ACTIVE', 'EXPIRED', 'DEPLETED', 'BLOCKED']);
export const GiftCardTransactionTypeSchema = z.enum([
  'ACTIVATION',
  'REDEMPTION',
  'REFUND',
  'ADJUSTMENT',
]);
export const LoyaltyTransactionTypeSchema = z.enum(['EARNED', 'REDEEMED', 'EXPIRED', 'ADJUSTED']);
export const MembershipTierSchema = z.enum(['BASIC', 'SILVER', 'GOLD', 'PLATINUM']);
export const AnalyticsSnapshotTypeSchema = z.enum(['PMIX', 'LABOR_TO_SALES']);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////
/////////////////////////////////////////
// TENANT SCHEMA
/////////////////////////////////////////
export const TenantSchema = z.object({
  status: TenantStatusSchema,
  id: z.uuid(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const TenantWithRelationsSchema = TenantSchema.merge(
  z.object({
    branches: z.lazy(() => BranchWithRelationsSchema).array(),
    users: z.lazy(() => UserWithRelationsSchema).array(),
    roles: z.lazy(() => RoleWithRelationsSchema).array(),
    permissions: z.lazy(() => PermissionWithRelationsSchema).array(),
    userRoles: z.lazy(() => UserRoleWithRelationsSchema).array(),
    branchAssignments: z.lazy(() => BranchAssignmentWithRelationsSchema).array(),
    menus: z.lazy(() => MenuWithRelationsSchema).array(),
    categories: z.lazy(() => CategoryWithRelationsSchema).array(),
    menuItems: z.lazy(() => MenuItemWithRelationsSchema).array(),
    modifierGroups: z.lazy(() => ModifierGroupWithRelationsSchema).array(),
    modifierOptions: z.lazy(() => ModifierOptionWithRelationsSchema).array(),
    menuItemModifierGroups: z.lazy(() => MenuItemModifierGroupWithRelationsSchema).array(),
    combos: z.lazy(() => ComboWithRelationsSchema).array(),
    comboItems: z.lazy(() => ComboItemWithRelationsSchema).array(),
    diningTables: z.lazy(() => DiningTableWithRelationsSchema).array(),
    reservations: z.lazy(() => ReservationWithRelationsSchema).array(),
    orders: z.lazy(() => OrderWithRelationsSchema).array(),
    orderItems: z.lazy(() => OrderItemWithRelationsSchema).array(),
    orderMerges: z.lazy(() => OrderMergeWithRelationsSchema).array(),
    suppliers: z.lazy(() => SupplierWithRelationsSchema).array(),
    ingredients: z.lazy(() => IngredientWithRelationsSchema).array(),
    inventoryItems: z.lazy(() => InventoryItemWithRelationsSchema).array(),
    inventoryBatches: z.lazy(() => InventoryBatchWithRelationsSchema).array(),
    stockMovements: z.lazy(() => StockMovementWithRelationsSchema).array(),
    recipes: z.lazy(() => RecipeWithRelationsSchema).array(),
    recipeIngredients: z.lazy(() => RecipeIngredientWithRelationsSchema).array(),
    purchaseOrders: z.lazy(() => PurchaseOrderWithRelationsSchema).array(),
    goodsReceipts: z.lazy(() => GoodsReceiptWithRelationsSchema).array(),
    invoices: z.lazy(() => InvoiceWithRelationsSchema).array(),
    payments: z.lazy(() => PaymentWithRelationsSchema).array(),
    refunds: z.lazy(() => RefundWithRelationsSchema).array(),
    ledgerAccounts: z.lazy(() => LedgerAccountWithRelationsSchema).array(),
    journals: z.lazy(() => JournalWithRelationsSchema).array(),
    journalEntries: z.lazy(() => JournalEntryWithRelationsSchema).array(),
    shifts: z.lazy(() => ShiftWithRelationsSchema).array(),
    cashDrawers: z.lazy(() => CashDrawerWithRelationsSchema).array(),
    dailyClosings: z.lazy(() => DailyClosingWithRelationsSchema).array(),
    auditLogs: z.lazy(() => AuditLogWithRelationsSchema).array(),
    configurations: z.lazy(() => ConfigurationWithRelationsSchema).array(),
    fiscalPeriods: z.lazy(() => FiscalPeriodWithRelationsSchema).array(),
    costCenters: z.lazy(() => CostCenterWithRelationsSchema).array(),
    supplierInvoices: z.lazy(() => SupplierInvoiceWithRelationsSchema).array(),
    Customer: z.lazy(() => CustomerWithRelationsSchema).array(),
    Membership: z.lazy(() => MembershipWithRelationsSchema).array(),
    LoyaltyLedger: z.lazy(() => LoyaltyLedgerWithRelationsSchema).array(),
    Coupon: z.lazy(() => CouponWithRelationsSchema).array(),
    GiftCard: z.lazy(() => GiftCardWithRelationsSchema).array(),
    CouponCustomerUsage: z.lazy(() => CouponCustomerUsageWithRelationsSchema).array(),
    GiftCardTransaction: z.lazy(() => GiftCardTransactionWithRelationsSchema).array(),
    analyticsSnapshots: z.lazy(() => AnalyticsSnapshotWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// BRANCH SCHEMA
/////////////////////////////////////////
export const BranchSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  name: z.string(),
  taxConfig: JsonValueSchema.nullable(),
  timezone: z.string(),
  currency: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const BranchWithRelationsSchema = BranchSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    userRoles: z.lazy(() => UserRoleWithRelationsSchema).array(),
    branchAssignments: z.lazy(() => BranchAssignmentWithRelationsSchema).array(),
    menuBranches: z.lazy(() => MenuBranchWithRelationsSchema).array(),
    diningTables: z.lazy(() => DiningTableWithRelationsSchema).array(),
    reservations: z.lazy(() => ReservationWithRelationsSchema).array(),
    orders: z.lazy(() => OrderWithRelationsSchema).array(),
    suppliers: z.lazy(() => SupplierWithRelationsSchema).array(),
    inventoryItems: z.lazy(() => InventoryItemWithRelationsSchema).array(),
    inventoryBatches: z.lazy(() => InventoryBatchWithRelationsSchema).array(),
    stockMovements: z.lazy(() => StockMovementWithRelationsSchema).array(),
    purchaseOrders: z.lazy(() => PurchaseOrderWithRelationsSchema).array(),
    goodsReceipts: z.lazy(() => GoodsReceiptWithRelationsSchema).array(),
    invoices: z.lazy(() => InvoiceWithRelationsSchema).array(),
    costCenters: z.lazy(() => CostCenterWithRelationsSchema).array(),
    supplierInvoices: z.lazy(() => SupplierInvoiceWithRelationsSchema).array(),
    shifts: z.lazy(() => ShiftWithRelationsSchema).array(),
    cashDrawers: z.lazy(() => CashDrawerWithRelationsSchema).array(),
    dailyClosings: z.lazy(() => DailyClosingWithRelationsSchema).array(),
    configurations: z.lazy(() => ConfigurationWithRelationsSchema).array(),
    analyticsSnapshots: z.lazy(() => AnalyticsSnapshotWithRelationsSchema).array(),
    auditLogs: z.lazy(() => AuditLogWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////
export const UserSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  pin: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const UserWithRelationsSchema = UserSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    userRoles: z.lazy(() => UserRoleWithRelationsSchema).array(),
    branchAssignments: z.lazy(() => BranchAssignmentWithRelationsSchema).array(),
    orders: z.lazy(() => OrderWithRelationsSchema).array(),
    reservations: z.lazy(() => ReservationWithRelationsSchema).array(),
    shifts: z.lazy(() => ShiftWithRelationsSchema).array(),
    auditLogs: z.lazy(() => AuditLogWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// ROLE SCHEMA
/////////////////////////////////////////
export const RoleSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  parentId: z.string().nullable(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const RoleWithRelationsSchema = RoleSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    parent: z.lazy(() => RoleWithRelationsSchema).nullable(),
    children: z.lazy(() => RoleWithRelationsSchema).array(),
    permissions: z.lazy(() => PermissionWithRelationsSchema).array(),
    userRoles: z.lazy(() => UserRoleWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// PERMISSION SCHEMA
/////////////////////////////////////////
export const PermissionSchema = z.object({
  scope: PermissionScopeSchema,
  id: z.uuid(),
  tenantId: z.string(),
  roleId: z.string(),
  module: z.string(),
  resource: z.string(),
  action: z.string(),
  thresholdKey: z.string().nullable(),
  isDeny: z.boolean(),
  effectiveFrom: z.coerce.date().nullable(),
  effectiveUntil: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const PermissionWithRelationsSchema = PermissionSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    role: z.lazy(() => RoleWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// USER ROLE SCHEMA
/////////////////////////////////////////
export const UserRoleSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  userId: z.string(),
  roleId: z.string(),
  branchId: z.string().nullable(),
  effectiveFrom: z.coerce.date().nullable(),
  effectiveUntil: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const UserRoleWithRelationsSchema = UserRoleSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    user: z.lazy(() => UserWithRelationsSchema),
    role: z.lazy(() => RoleWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema).nullable(),
  }),
);
/////////////////////////////////////////
// BRANCH ASSIGNMENT SCHEMA
/////////////////////////////////////////
export const BranchAssignmentSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  userId: z.string(),
  branchId: z.string(),
  effectiveFrom: z.coerce.date().nullable(),
  effectiveUntil: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const BranchAssignmentWithRelationsSchema = BranchAssignmentSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    user: z.lazy(() => UserWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// MENU SCHEMA
/////////////////////////////////////////
export const MenuSchema = z.object({
  status: MenuStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  version: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const MenuWithRelationsSchema = MenuSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    menuVersions: z.lazy(() => MenuVersionWithRelationsSchema).array(),
    menuBranches: z.lazy(() => MenuBranchWithRelationsSchema).array(),
    categories: z.lazy(() => CategoryWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// MENU VERSION SCHEMA
/////////////////////////////////////////
export const MenuVersionSchema = z.object({
  status: MenuStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  menuId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  version: z.number().int(),
  recordedAt: z.coerce.date(),
  recordedBy: z.string().nullable(),
});
export const MenuVersionWithRelationsSchema = MenuVersionSchema.merge(
  z.object({
    menu: z.lazy(() => MenuWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// MENU BRANCH SCHEMA
/////////////////////////////////////////
export const MenuBranchSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  menuId: z.string(),
  branchId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const MenuBranchWithRelationsSchema = MenuBranchSchema.merge(
  z.object({
    menu: z.lazy(() => MenuWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// CATEGORY SCHEMA
/////////////////////////////////////////
export const CategorySchema = z.object({
  status: CategoryStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  menuId: z.string(),
  parentId: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const CategoryWithRelationsSchema = CategorySchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    menu: z.lazy(() => MenuWithRelationsSchema),
    parent: z.lazy(() => CategoryWithRelationsSchema).nullable(),
    children: z.lazy(() => CategoryWithRelationsSchema).array(),
    menuItems: z.lazy(() => MenuItemWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// MENU ITEM SCHEMA
/////////////////////////////////////////
export const MenuItemSchema = z.object({
  status: MenuItemStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  categoryId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.instanceof(Prisma.Decimal, {
    message: "Field 'price' must be a Decimal. Location: ['Models', 'MenuItem']",
  }),
  taxRate: z.instanceof(Prisma.Decimal, {
    message: "Field 'taxRate' must be a Decimal. Location: ['Models', 'MenuItem']",
  }),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const MenuItemWithRelationsSchema = MenuItemSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    category: z.lazy(() => CategoryWithRelationsSchema),
    menuItemModifierGroups: z.lazy(() => MenuItemModifierGroupWithRelationsSchema).array(),
    comboItems: z.lazy(() => ComboItemWithRelationsSchema).array(),
    orderItems: z.lazy(() => OrderItemWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// MODIFIER GROUP SCHEMA
/////////////////////////////////////////
export const ModifierGroupSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  name: z.string(),
  minSelections: z.number().int(),
  maxSelections: z.number().int(),
  isRequired: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const ModifierGroupWithRelationsSchema = ModifierGroupSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    modifierOptions: z.lazy(() => ModifierOptionWithRelationsSchema).array(),
    menuItemModifierGroups: z.lazy(() => MenuItemModifierGroupWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// MODIFIER OPTION SCHEMA
/////////////////////////////////////////
export const ModifierOptionSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  modifierGroupId: z.string(),
  name: z.string(),
  priceDelta: z.instanceof(Prisma.Decimal, {
    message: "Field 'priceDelta' must be a Decimal. Location: ['Models', 'ModifierOption']",
  }),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const ModifierOptionWithRelationsSchema = ModifierOptionSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    modifierGroup: z.lazy(() => ModifierGroupWithRelationsSchema),
    orderItemModifierSelections: z
      .lazy(() => OrderItemModifierSelectionWithRelationsSchema)
      .array(),
  }),
);
/////////////////////////////////////////
// MENU ITEM MODIFIER GROUP SCHEMA
/////////////////////////////////////////
export const MenuItemModifierGroupSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  menuItemId: z.string(),
  modifierGroupId: z.string(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const MenuItemModifierGroupWithRelationsSchema = MenuItemModifierGroupSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    menuItem: z.lazy(() => MenuItemWithRelationsSchema),
    modifierGroup: z.lazy(() => ModifierGroupWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// COMBO SCHEMA
/////////////////////////////////////////
export const ComboSchema = z.object({
  status: ComboStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.instanceof(Prisma.Decimal, {
    message: "Field 'price' must be a Decimal. Location: ['Models', 'Combo']",
  }),
  taxRate: z.instanceof(Prisma.Decimal, {
    message: "Field 'taxRate' must be a Decimal. Location: ['Models', 'Combo']",
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const ComboWithRelationsSchema = ComboSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    comboItems: z.lazy(() => ComboItemWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// COMBO ITEM SCHEMA
/////////////////////////////////////////
export const ComboItemSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  comboId: z.string(),
  menuItemId: z.string(),
  quantity: z.number().int(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const ComboItemWithRelationsSchema = ComboItemSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    combo: z.lazy(() => ComboWithRelationsSchema),
    menuItem: z.lazy(() => MenuItemWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// DINING TABLE SCHEMA
/////////////////////////////////////////
export const DiningTableSchema = z.object({
  status: TableStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string(),
  tableNumber: z.string(),
  capacity: z.number().int(),
  floorSection: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const DiningTableWithRelationsSchema = DiningTableSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema),
    reservations: z.lazy(() => ReservationWithRelationsSchema).array(),
    orders: z.lazy(() => OrderWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// RESERVATION SCHEMA
/////////////////////////////////////////
export const ReservationSchema = z.object({
  status: ReservationStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string(),
  diningTableId: z.string().nullable(),
  userId: z.string().nullable(),
  guestName: z.string(),
  guestPhone: z.string().nullable(),
  partySize: z.number().int(),
  scheduledAt: z.coerce.date(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const ReservationWithRelationsSchema = ReservationSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema),
    diningTable: z.lazy(() => DiningTableWithRelationsSchema).nullable(),
    user: z.lazy(() => UserWithRelationsSchema).nullable(),
  }),
);
/////////////////////////////////////////
// ORDER SCHEMA
/////////////////////////////////////////
export const OrderSchema = z.object({
  status: OrderStatusSchema,
  orderType: OrderTypeSchema,
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string(),
  diningTableId: z.string().nullable(),
  userId: z.string().nullable(),
  parentOrderId: z.string().nullable(),
  idempotencyKey: z.string(),
  version: z.number().int(),
  subtotal: z.instanceof(Prisma.Decimal, {
    message: "Field 'subtotal' must be a Decimal. Location: ['Models', 'Order']",
  }),
  taxAmount: z.instanceof(Prisma.Decimal, {
    message: "Field 'taxAmount' must be a Decimal. Location: ['Models', 'Order']",
  }),
  totalAmount: z.instanceof(Prisma.Decimal, {
    message: "Field 'totalAmount' must be a Decimal. Location: ['Models', 'Order']",
  }),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
  customerId: z.string().nullable(),
  couponId: z.string().nullable(),
});
export const OrderWithRelationsSchema = OrderSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema),
    diningTable: z.lazy(() => DiningTableWithRelationsSchema).nullable(),
    user: z.lazy(() => UserWithRelationsSchema).nullable(),
    parentOrder: z.lazy(() => OrderWithRelationsSchema).nullable(),
    childOrders: z.lazy(() => OrderWithRelationsSchema).array(),
    orderItems: z.lazy(() => OrderItemWithRelationsSchema).array(),
    orderMergesAsParent: z.lazy(() => OrderMergeWithRelationsSchema).array(),
    orderMergesAsChild: z.lazy(() => OrderMergeWithRelationsSchema).array(),
    Customer: z.lazy(() => CustomerWithRelationsSchema).nullable(),
    LoyaltyLedger: z.lazy(() => LoyaltyLedgerWithRelationsSchema).array(),
    Coupon: z.lazy(() => CouponWithRelationsSchema).nullable(),
    CouponCustomerUsage: z.lazy(() => CouponCustomerUsageWithRelationsSchema).array(),
    GiftCardTransaction: z.lazy(() => GiftCardTransactionWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// ORDER MERGE SCHEMA
/////////////////////////////////////////
export const OrderMergeSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  parentOrderId: z.string(),
  childOrderId: z.string(),
  mergedAt: z.coerce.date(),
  mergedBy: z.string().nullable(),
  resolvedAt: z.coerce.date().nullable(),
  resolvedBy: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const OrderMergeWithRelationsSchema = OrderMergeSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    parentOrder: z.lazy(() => OrderWithRelationsSchema),
    childOrder: z.lazy(() => OrderWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// ORDER ITEM SCHEMA
/////////////////////////////////////////
export const OrderItemSchema = z.object({
  status: OrderItemStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  orderId: z.string(),
  menuItemId: z.string(),
  quantity: z.number().int(),
  unitPrice: z.instanceof(Prisma.Decimal, {
    message: "Field 'unitPrice' must be a Decimal. Location: ['Models', 'OrderItem']",
  }),
  taxRate: z.instanceof(Prisma.Decimal, {
    message: "Field 'taxRate' must be a Decimal. Location: ['Models', 'OrderItem']",
  }),
  totalPrice: z.instanceof(Prisma.Decimal, {
    message: "Field 'totalPrice' must be a Decimal. Location: ['Models', 'OrderItem']",
  }),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const OrderItemWithRelationsSchema = OrderItemSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    order: z.lazy(() => OrderWithRelationsSchema),
    menuItem: z.lazy(() => MenuItemWithRelationsSchema),
    orderItemModifierSelections: z
      .lazy(() => OrderItemModifierSelectionWithRelationsSchema)
      .array(),
    orderItemRecipeSnapshots: z.lazy(() => OrderItemRecipeSnapshotWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// ORDER ITEM MODIFIER SELECTION SCHEMA
/////////////////////////////////////////
export const OrderItemModifierSelectionSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  orderItemId: z.string(),
  modifierOptionId: z.string(),
  priceDeltaSnapshot: z.instanceof(Prisma.Decimal, {
    message:
      "Field 'priceDeltaSnapshot' must be a Decimal. Location: ['Models', 'OrderItemModifierSelection']",
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const OrderItemModifierSelectionWithRelationsSchema = OrderItemModifierSelectionSchema.merge(
  z.object({
    orderItem: z.lazy(() => OrderItemWithRelationsSchema),
    modifierOption: z.lazy(() => ModifierOptionWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// ORDER ITEM RECIPE SNAPSHOT SCHEMA
/////////////////////////////////////////
export const OrderItemRecipeSnapshotSchema = z.object({
  id: z.uuid(),
  orderItemId: z.string(),
  recipeId: z.string().nullable(),
  recipeName: z.string(),
  ingredientId: z.string(),
  ingredientName: z.string(),
  quantity: z.instanceof(Prisma.Decimal, {
    message: "Field 'quantity' must be a Decimal. Location: ['Models', 'OrderItemRecipeSnapshot']",
  }),
  unit: z.string(),
  yieldLossPct: z.instanceof(Prisma.Decimal, {
    message:
      "Field 'yieldLossPct' must be a Decimal. Location: ['Models', 'OrderItemRecipeSnapshot']",
  }),
  spoilagePct: z.instanceof(Prisma.Decimal, {
    message:
      "Field 'spoilagePct' must be a Decimal. Location: ['Models', 'OrderItemRecipeSnapshot']",
  }),
  capturedAt: z.coerce.date(),
});
export const OrderItemRecipeSnapshotWithRelationsSchema = OrderItemRecipeSnapshotSchema.merge(
  z.object({
    orderItem: z.lazy(() => OrderItemWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// SUPPLIER SCHEMA
/////////////////////////////////////////
export const SupplierSchema = z.object({
  status: SupplierStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string().nullable(),
  name: z.string(),
  code: z.string(),
  contactName: z.string().nullable(),
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
  address: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const SupplierWithRelationsSchema = SupplierSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema).nullable(),
    purchaseOrders: z.lazy(() => PurchaseOrderWithRelationsSchema).array(),
    supplierInvoices: z.lazy(() => SupplierInvoiceWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// INGREDIENT SCHEMA
/////////////////////////////////////////
export const IngredientSchema = z.object({
  unit: IngredientUnitSchema,
  id: z.uuid(),
  tenantId: z.string(),
  name: z.string(),
  unitCost: z.instanceof(Prisma.Decimal, {
    message: "Field 'unitCost' must be a Decimal. Location: ['Models', 'Ingredient']",
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const IngredientWithRelationsSchema = IngredientSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    inventoryItems: z.lazy(() => InventoryItemWithRelationsSchema).array(),
    recipeIngredients: z.lazy(() => RecipeIngredientWithRelationsSchema).array(),
    inventoryBatches: z.lazy(() => InventoryBatchWithRelationsSchema).array(),
    stockMovements: z.lazy(() => StockMovementWithRelationsSchema).array(),
    goodsReceiptItems: z.lazy(() => GoodsReceiptItemWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// INVENTORY ITEM SCHEMA
/////////////////////////////////////////
export const InventoryItemSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string(),
  ingredientId: z.string(),
  theoreticalQty: z.instanceof(Prisma.Decimal, {
    message: "Field 'theoreticalQty' must be a Decimal. Location: ['Models', 'InventoryItem']",
  }),
  actualQty: z.instanceof(Prisma.Decimal, {
    message: "Field 'actualQty' must be a Decimal. Location: ['Models', 'InventoryItem']",
  }),
  reorderLevel: z
    .instanceof(Prisma.Decimal, {
      message: "Field 'reorderLevel' must be a Decimal. Location: ['Models', 'InventoryItem']",
    })
    .nullable(),
  reorderQty: z
    .instanceof(Prisma.Decimal, {
      message: "Field 'reorderQty' must be a Decimal. Location: ['Models', 'InventoryItem']",
    })
    .nullable(),
  version: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const InventoryItemWithRelationsSchema = InventoryItemSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema),
    ingredient: z.lazy(() => IngredientWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// INVENTORY BATCH SCHEMA
/////////////////////////////////////////
export const InventoryBatchSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string(),
  ingredientId: z.string(),
  batchNumber: z.string(),
  receivedQty: z.instanceof(Prisma.Decimal, {
    message: "Field 'receivedQty' must be a Decimal. Location: ['Models', 'InventoryBatch']",
  }),
  remainingQty: z.instanceof(Prisma.Decimal, {
    message: "Field 'remainingQty' must be a Decimal. Location: ['Models', 'InventoryBatch']",
  }),
  unitCost: z.instanceof(Prisma.Decimal, {
    message: "Field 'unitCost' must be a Decimal. Location: ['Models', 'InventoryBatch']",
  }),
  expiresAt: z.coerce.date().nullable(),
  receivedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const InventoryBatchWithRelationsSchema = InventoryBatchSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema),
    ingredient: z.lazy(() => IngredientWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// STOCK MOVEMENT SCHEMA
/////////////////////////////////////////
export const StockMovementSchema = z.object({
  movementType: StockMovementTypeSchema,
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string(),
  ingredientId: z.string(),
  quantityDelta: z.instanceof(Prisma.Decimal, {
    message: "Field 'quantityDelta' must be a Decimal. Location: ['Models', 'StockMovement']",
  }),
  unitCost: z.instanceof(Prisma.Decimal, {
    message: "Field 'unitCost' must be a Decimal. Location: ['Models', 'StockMovement']",
  }),
  referenceId: z.string().nullable(),
  referenceType: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  createdBy: z.string().nullable(),
});
export const StockMovementWithRelationsSchema = StockMovementSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema),
    ingredient: z.lazy(() => IngredientWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// RECIPE SCHEMA
/////////////////////////////////////////
export const RecipeSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  menuItemId: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  version: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const RecipeWithRelationsSchema = RecipeSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    recipeIngredients: z.lazy(() => RecipeIngredientWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// RECIPE INGREDIENT SCHEMA
/////////////////////////////////////////
export const RecipeIngredientSchema = z.object({
  unit: IngredientUnitSchema,
  id: z.uuid(),
  tenantId: z.string(),
  recipeId: z.string(),
  ingredientId: z.string(),
  branchId: z.string().nullable(),
  quantity: z.instanceof(Prisma.Decimal, {
    message: "Field 'quantity' must be a Decimal. Location: ['Models', 'RecipeIngredient']",
  }),
  yieldLossPct: z.instanceof(Prisma.Decimal, {
    message: "Field 'yieldLossPct' must be a Decimal. Location: ['Models', 'RecipeIngredient']",
  }),
  spoilagePct: z.instanceof(Prisma.Decimal, {
    message: "Field 'spoilagePct' must be a Decimal. Location: ['Models', 'RecipeIngredient']",
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const RecipeIngredientWithRelationsSchema = RecipeIngredientSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    recipe: z.lazy(() => RecipeWithRelationsSchema),
    ingredient: z.lazy(() => IngredientWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// PURCHASE ORDER SCHEMA
/////////////////////////////////////////
export const PurchaseOrderSchema = z.object({
  status: PurchaseOrderStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string(),
  supplierId: z.string(),
  poNumber: z.string(),
  subtotal: z.instanceof(Prisma.Decimal, {
    message: "Field 'subtotal' must be a Decimal. Location: ['Models', 'PurchaseOrder']",
  }),
  taxAmount: z.instanceof(Prisma.Decimal, {
    message: "Field 'taxAmount' must be a Decimal. Location: ['Models', 'PurchaseOrder']",
  }),
  total: z.instanceof(Prisma.Decimal, {
    message: "Field 'total' must be a Decimal. Location: ['Models', 'PurchaseOrder']",
  }),
  orderedAt: z.coerce.date().nullable(),
  expectedAt: z.coerce.date().nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const PurchaseOrderWithRelationsSchema = PurchaseOrderSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema),
    supplier: z.lazy(() => SupplierWithRelationsSchema),
    purchaseOrderItems: z.lazy(() => PurchaseOrderItemWithRelationsSchema).array(),
    goodsReceipts: z.lazy(() => GoodsReceiptWithRelationsSchema).array(),
    supplierInvoice: z.lazy(() => SupplierInvoiceWithRelationsSchema).nullable(),
  }),
);
/////////////////////////////////////////
// PURCHASE ORDER ITEM SCHEMA
/////////////////////////////////////////
export const PurchaseOrderItemSchema = z.object({
  unit: IngredientUnitSchema,
  id: z.uuid(),
  tenantId: z.string(),
  purchaseOrderId: z.string(),
  ingredientId: z.string(),
  orderedQty: z.instanceof(Prisma.Decimal, {
    message: "Field 'orderedQty' must be a Decimal. Location: ['Models', 'PurchaseOrderItem']",
  }),
  unitCost: z.instanceof(Prisma.Decimal, {
    message: "Field 'unitCost' must be a Decimal. Location: ['Models', 'PurchaseOrderItem']",
  }),
  totalCost: z.instanceof(Prisma.Decimal, {
    message: "Field 'totalCost' must be a Decimal. Location: ['Models', 'PurchaseOrderItem']",
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const PurchaseOrderItemWithRelationsSchema = PurchaseOrderItemSchema.merge(
  z.object({
    purchaseOrder: z.lazy(() => PurchaseOrderWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// GOODS RECEIPT SCHEMA
/////////////////////////////////////////
export const GoodsReceiptSchema = z.object({
  status: GoodsReceiptStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string(),
  purchaseOrderId: z.string(),
  grnNumber: z.string(),
  receivedAt: z.coerce.date(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const GoodsReceiptWithRelationsSchema = GoodsReceiptSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema),
    purchaseOrder: z.lazy(() => PurchaseOrderWithRelationsSchema),
    goodsReceiptItems: z.lazy(() => GoodsReceiptItemWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// GOODS RECEIPT ITEM SCHEMA
/////////////////////////////////////////
export const GoodsReceiptItemSchema = z.object({
  unit: IngredientUnitSchema,
  id: z.uuid(),
  tenantId: z.string(),
  goodsReceiptId: z.string(),
  ingredientId: z.string(),
  receivedQty: z.instanceof(Prisma.Decimal, {
    message: "Field 'receivedQty' must be a Decimal. Location: ['Models', 'GoodsReceiptItem']",
  }),
  acceptedQty: z.instanceof(Prisma.Decimal, {
    message: "Field 'acceptedQty' must be a Decimal. Location: ['Models', 'GoodsReceiptItem']",
  }),
  rejectedQty: z.instanceof(Prisma.Decimal, {
    message: "Field 'rejectedQty' must be a Decimal. Location: ['Models', 'GoodsReceiptItem']",
  }),
  unitCost: z.instanceof(Prisma.Decimal, {
    message: "Field 'unitCost' must be a Decimal. Location: ['Models', 'GoodsReceiptItem']",
  }),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const GoodsReceiptItemWithRelationsSchema = GoodsReceiptItemSchema.merge(
  z.object({
    goodsReceipt: z.lazy(() => GoodsReceiptWithRelationsSchema),
    ingredient: z.lazy(() => IngredientWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// LEDGER ACCOUNT SCHEMA
/////////////////////////////////////////
export const LedgerAccountSchema = z.object({
  type: LedgerAccountTypeSchema,
  id: z.uuid(),
  tenantId: z.string(),
  parentId: z.string().nullable(),
  code: z.string(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const LedgerAccountWithRelationsSchema = LedgerAccountSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    parent: z.lazy(() => LedgerAccountWithRelationsSchema).nullable(),
    children: z.lazy(() => LedgerAccountWithRelationsSchema).array(),
    journalEntries: z.lazy(() => JournalEntryWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// SHIFT SCHEMA
/////////////////////////////////////////
export const ShiftSchema = z.object({
  status: ShiftStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string(),
  userId: z.string(),
  openedAt: z.coerce.date(),
  closedAt: z.coerce.date().nullable(),
  openingFloat: z.instanceof(Prisma.Decimal, {
    message: "Field 'openingFloat' must be a Decimal. Location: ['Models', 'Shift']",
  }),
  closingFloat: z
    .instanceof(Prisma.Decimal, {
      message: "Field 'closingFloat' must be a Decimal. Location: ['Models', 'Shift']",
    })
    .nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const ShiftWithRelationsSchema = ShiftSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema),
    user: z.lazy(() => UserWithRelationsSchema),
    cashDrawers: z.lazy(() => CashDrawerWithRelationsSchema).array(),
    journals: z.lazy(() => JournalWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// CASH DRAWER SCHEMA
/////////////////////////////////////////
export const CashDrawerSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string(),
  shiftId: z.string(),
  name: z.string(),
  openingBalance: z.instanceof(Prisma.Decimal, {
    message: "Field 'openingBalance' must be a Decimal. Location: ['Models', 'CashDrawer']",
  }),
  closingBalance: z
    .instanceof(Prisma.Decimal, {
      message: "Field 'closingBalance' must be a Decimal. Location: ['Models', 'CashDrawer']",
    })
    .nullable(),
  isOpen: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const CashDrawerWithRelationsSchema = CashDrawerSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema),
    shift: z.lazy(() => ShiftWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// DAILY CLOSING SCHEMA
/////////////////////////////////////////
export const DailyClosingSchema = z.object({
  status: DailyClosingStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string(),
  closingDate: z.coerce.date(),
  expectedCash: z.instanceof(Prisma.Decimal, {
    message: "Field 'expectedCash' must be a Decimal. Location: ['Models', 'DailyClosing']",
  }),
  actualCash: z.instanceof(Prisma.Decimal, {
    message: "Field 'actualCash' must be a Decimal. Location: ['Models', 'DailyClosing']",
  }),
  variance: z.instanceof(Prisma.Decimal, {
    message: "Field 'variance' must be a Decimal. Location: ['Models', 'DailyClosing']",
  }),
  totalRevenue: z.instanceof(Prisma.Decimal, {
    message: "Field 'totalRevenue' must be a Decimal. Location: ['Models', 'DailyClosing']",
  }),
  notes: z.string().nullable(),
  lockedAt: z.coerce.date().nullable(),
  lockedBy: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const DailyClosingWithRelationsSchema = DailyClosingSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// INVOICE SCHEMA
/////////////////////////////////////////
export const InvoiceSchema = z.object({
  status: InvoiceStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string(),
  orderId: z.string(),
  subtotal: z.instanceof(Prisma.Decimal, {
    message: "Field 'subtotal' must be a Decimal. Location: ['Models', 'Invoice']",
  }),
  taxAmount: z.instanceof(Prisma.Decimal, {
    message: "Field 'taxAmount' must be a Decimal. Location: ['Models', 'Invoice']",
  }),
  total: z.instanceof(Prisma.Decimal, {
    message: "Field 'total' must be a Decimal. Location: ['Models', 'Invoice']",
  }),
  issuedAt: z.coerce.date().nullable(),
  dueAt: z.coerce.date().nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
  customerId: z.string().nullable(),
});
export const InvoiceWithRelationsSchema = InvoiceSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema),
    payments: z.lazy(() => PaymentWithRelationsSchema).array(),
    refunds: z.lazy(() => RefundWithRelationsSchema).array(),
    Customer: z.lazy(() => CustomerWithRelationsSchema).nullable(),
  }),
);
/////////////////////////////////////////
// PAYMENT SCHEMA
/////////////////////////////////////////
export const PaymentSchema = z.object({
  status: PaymentStatusSchema,
  method: PaymentMethodSchema,
  id: z.uuid(),
  tenantId: z.string(),
  invoiceId: z.string(),
  amount: z.instanceof(Prisma.Decimal, {
    message: "Field 'amount' must be a Decimal. Location: ['Models', 'Payment']",
  }),
  referenceCode: z.string().nullable(),
  giftCardId: z.string().nullable(),
  gatewayPayload: JsonValueSchema.nullable(),
  idempotencyKey: z.string(),
  capturedAt: z.coerce.date().nullable(),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const PaymentWithRelationsSchema = PaymentSchema.merge(
  z.object({
    GiftCard: z.lazy(() => GiftCardWithRelationsSchema).nullable(),
    GiftCardTransaction: z.lazy(() => GiftCardTransactionWithRelationsSchema).array(),
    invoice: z.lazy(() => InvoiceWithRelationsSchema),
    refunds: z.lazy(() => RefundWithRelationsSchema).array(),
    Tenant: z.lazy(() => TenantWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// REFUND SCHEMA
/////////////////////////////////////////
export const RefundSchema = z.object({
  status: RefundStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  invoiceId: z.string(),
  paymentId: z.string(),
  amount: z.instanceof(Prisma.Decimal, {
    message: "Field 'amount' must be a Decimal. Location: ['Models', 'Refund']",
  }),
  reason: z.string(),
  notes: z.string().nullable(),
  approvedBy: z.string().nullable(),
  approvedAt: z.coerce.date().nullable(),
  idempotencyKey: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const RefundWithRelationsSchema = RefundSchema.merge(
  z.object({
    invoice: z.lazy(() => InvoiceWithRelationsSchema),
    payment: z.lazy(() => PaymentWithRelationsSchema),
    Tenant: z.lazy(() => TenantWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// JOURNAL SCHEMA
/////////////////////////////////////////
export const JournalSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  shiftId: z.string().nullable(),
  description: z.string(),
  referenceId: z.string().nullable(),
  referenceType: z.string().nullable(),
  isPosted: z.boolean(),
  postedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const JournalWithRelationsSchema = JournalSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    shift: z.lazy(() => ShiftWithRelationsSchema).nullable(),
    journalEntries: z.lazy(() => JournalEntryWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// JOURNAL ENTRY SCHEMA
/////////////////////////////////////////
export const JournalEntrySchema = z.object({
  entryType: JournalEntryTypeSchema,
  id: z.uuid(),
  tenantId: z.string(),
  journalId: z.string(),
  ledgerAccountId: z.string(),
  amount: z.instanceof(Prisma.Decimal, {
    message: "Field 'amount' must be a Decimal. Location: ['Models', 'JournalEntry']",
  }),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  createdBy: z.string().nullable(),
});
export const JournalEntryWithRelationsSchema = JournalEntrySchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    journal: z.lazy(() => JournalWithRelationsSchema),
    ledgerAccount: z.lazy(() => LedgerAccountWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// AUDIT LOG SCHEMA
/////////////////////////////////////////
export const AuditLogSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string().nullable(),
  userId: z.string().nullable(),
  entityType: z.string(),
  entityId: z.string(),
  action: z.string(),
  beforeState: JsonValueSchema.nullable(),
  afterState: JsonValueSchema.nullable(),
  reason: z.string().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  correlationId: z.string().nullable(),
  createdAt: z.coerce.date(),
});
export const AuditLogWithRelationsSchema = AuditLogSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema).nullable(),
    user: z.lazy(() => UserWithRelationsSchema).nullable(),
  }),
);
/////////////////////////////////////////
// CONFIGURATION SCHEMA
/////////////////////////////////////////
export const ConfigurationSchema = z.object({
  level: ConfigurationLevelSchema,
  id: z.uuid(),
  key: z.string(),
  value: JsonValueSchema,
  tenantId: z.string().nullable(),
  branchId: z.string().nullable(),
  stationId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const ConfigurationWithRelationsSchema = ConfigurationSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema).nullable(),
    branch: z.lazy(() => BranchWithRelationsSchema).nullable(),
  }),
);
/////////////////////////////////////////
// FISCAL PERIOD SCHEMA
/////////////////////////////////////////
export const FiscalPeriodSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  name: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isClosed: z.boolean(),
  closedAt: z.coerce.date().nullable(),
  closedBy: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  isDeleted: z.boolean(),
});
export const FiscalPeriodWithRelationsSchema = FiscalPeriodSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// COST CENTER SCHEMA
/////////////////////////////////////////
export const CostCenterSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string().nullable(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  isDeleted: z.boolean(),
});
export const CostCenterWithRelationsSchema = CostCenterSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema).nullable(),
  }),
);
/////////////////////////////////////////
// SUPPLIER INVOICE SCHEMA
/////////////////////////////////////////
export const SupplierInvoiceSchema = z.object({
  status: InvoiceStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string(),
  supplierId: z.string(),
  purchaseOrderId: z.string().nullable(),
  invoiceNumber: z.string(),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date().nullable(),
  totalAmount: z.instanceof(Prisma.Decimal, {
    message: "Field 'totalAmount' must be a Decimal. Location: ['Models', 'SupplierInvoice']",
  }),
  taxAmount: z.instanceof(Prisma.Decimal, {
    message: "Field 'taxAmount' must be a Decimal. Location: ['Models', 'SupplierInvoice']",
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
});
export const SupplierInvoiceWithRelationsSchema = SupplierInvoiceSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema),
    supplier: z.lazy(() => SupplierWithRelationsSchema),
    purchaseOrder: z.lazy(() => PurchaseOrderWithRelationsSchema).nullable(),
  }),
);
/////////////////////////////////////////
// CUSTOMER SCHEMA
/////////////////////////////////////////
export const CustomerSchema = z.object({
  status: CustomerStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const CustomerWithRelationsSchema = CustomerSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    memberships: z.lazy(() => MembershipWithRelationsSchema).array(),
    loyaltyLedgers: z.lazy(() => LoyaltyLedgerWithRelationsSchema).array(),
    orders: z.lazy(() => OrderWithRelationsSchema).array(),
    invoices: z.lazy(() => InvoiceWithRelationsSchema).array(),
    couponUsages: z.lazy(() => CouponCustomerUsageWithRelationsSchema).array(),
    giftCards: z.lazy(() => GiftCardWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// MEMBERSHIP SCHEMA
/////////////////////////////////////////
export const MembershipSchema = z.object({
  tier: MembershipTierSchema,
  id: z.uuid(),
  tenantId: z.string(),
  customerId: z.string(),
  joinedAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const MembershipWithRelationsSchema = MembershipSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    customer: z.lazy(() => CustomerWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// LOYALTY LEDGER SCHEMA
/////////////////////////////////////////
export const LoyaltyLedgerSchema = z.object({
  type: LoyaltyTransactionTypeSchema,
  id: z.uuid(),
  tenantId: z.string(),
  customerId: z.string(),
  orderId: z.string().nullable(),
  points: z.number().int(),
  reason: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const LoyaltyLedgerWithRelationsSchema = LoyaltyLedgerSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    customer: z.lazy(() => CustomerWithRelationsSchema),
    order: z.lazy(() => OrderWithRelationsSchema).nullable(),
  }),
);
/////////////////////////////////////////
// COUPON SCHEMA
/////////////////////////////////////////
export const CouponSchema = z.object({
  type: CouponTypeSchema,
  status: CouponStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  code: z.string(),
  value: z.instanceof(Prisma.Decimal, {
    message: "Field 'value' must be a Decimal. Location: ['Models', 'Coupon']",
  }),
  minOrderValue: z
    .instanceof(Prisma.Decimal, {
      message: "Field 'minOrderValue' must be a Decimal. Location: ['Models', 'Coupon']",
    })
    .nullable(),
  validFrom: z.coerce.date().nullable(),
  validUntil: z.coerce.date().nullable(),
  maxUses: z.number().int().nullable(),
  currentUses: z.number().int(),
  maxDiscountValue: z
    .instanceof(Prisma.Decimal, {
      message: "Field 'maxDiscountValue' must be a Decimal. Location: ['Models', 'Coupon']",
    })
    .nullable(),
  isStackable: z.boolean(),
  maxUsesPerCustomer: z.number().int().nullable(),
  applicableCategoryIds: z.string().array(),
  applicableItemIds: z.string().array(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
});
export const CouponWithRelationsSchema = CouponSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    orders: z.lazy(() => OrderWithRelationsSchema).array(),
    usages: z.lazy(() => CouponCustomerUsageWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// COUPON CUSTOMER USAGE SCHEMA
/////////////////////////////////////////
export const CouponCustomerUsageSchema = z.object({
  id: z.uuid(),
  tenantId: z.string(),
  couponId: z.string(),
  customerId: z.string(),
  orderId: z.string(),
  usedAt: z.coerce.date(),
});
export const CouponCustomerUsageWithRelationsSchema = CouponCustomerUsageSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    coupon: z.lazy(() => CouponWithRelationsSchema),
    customer: z.lazy(() => CustomerWithRelationsSchema),
    order: z.lazy(() => OrderWithRelationsSchema),
  }),
);
/////////////////////////////////////////
// GIFT CARD SCHEMA
/////////////////////////////////////////
export const GiftCardSchema = z.object({
  status: GiftCardStatusSchema,
  id: z.uuid(),
  tenantId: z.string(),
  code: z.string(),
  initialValue: z.instanceof(Prisma.Decimal, {
    message: "Field 'initialValue' must be a Decimal. Location: ['Models', 'GiftCard']",
  }),
  currentBalance: z.instanceof(Prisma.Decimal, {
    message: "Field 'currentBalance' must be a Decimal. Location: ['Models', 'GiftCard']",
  }),
  expiresAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  isDeleted: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
  customerId: z.string().nullable(),
});
export const GiftCardWithRelationsSchema = GiftCardSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    customer: z.lazy(() => CustomerWithRelationsSchema).nullable(),
    transactions: z.lazy(() => GiftCardTransactionWithRelationsSchema).array(),
    payments: z.lazy(() => PaymentWithRelationsSchema).array(),
  }),
);
/////////////////////////////////////////
// GIFT CARD TRANSACTION SCHEMA
/////////////////////////////////////////
export const GiftCardTransactionSchema = z.object({
  type: GiftCardTransactionTypeSchema,
  id: z.uuid(),
  tenantId: z.string(),
  giftCardId: z.string(),
  orderId: z.string().nullable(),
  paymentId: z.string().nullable(),
  amount: z.instanceof(Prisma.Decimal, {
    message: "Field 'amount' must be a Decimal. Location: ['Models', 'GiftCardTransaction']",
  }),
  balanceAfter: z.instanceof(Prisma.Decimal, {
    message: "Field 'balanceAfter' must be a Decimal. Location: ['Models', 'GiftCardTransaction']",
  }),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
});
export const GiftCardTransactionWithRelationsSchema = GiftCardTransactionSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    giftCard: z.lazy(() => GiftCardWithRelationsSchema),
    order: z.lazy(() => OrderWithRelationsSchema).nullable(),
    payment: z.lazy(() => PaymentWithRelationsSchema).nullable(),
  }),
);
/////////////////////////////////////////
// ANALYTICS SNAPSHOT SCHEMA
/////////////////////////////////////////
export const AnalyticsSnapshotSchema = z.object({
  type: AnalyticsSnapshotTypeSchema,
  id: z.uuid(),
  tenantId: z.string(),
  branchId: z.string().nullable(),
  data: JsonValueSchema,
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  capturedAt: z.coerce.date(),
});
export const AnalyticsSnapshotWithRelationsSchema = AnalyticsSnapshotSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema).nullable(),
  }),
);
