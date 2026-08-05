import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput =
  | Prisma.JsonValue
  | null
  | 'JsonNull'
  | 'DbNull'
  | Prisma.NullTypes.DbNull
  | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.NullTypes.DbNull;
  if (v === 'JsonNull') return Prisma.NullTypes.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
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

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
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

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;

// DECIMAL
//------------------------------------------------------

export const DecimalJsLikeSchema: z.ZodType<Prisma.DecimalJsLike> = z.object({
  d: z.array(z.number()),
  e: z.number(),
  s: z.number(),
  toFixed: z.any(),
});

export const DECIMAL_STRING_REGEX =
  /^(?:-?Infinity|NaN|-?(?:0[bB][01]+(?:\.[01]+)?(?:[pP][-+]?\d+)?|0[oO][0-7]+(?:\.[0-7]+)?(?:[pP][-+]?\d+)?|0[xX][\da-fA-F]+(?:\.[\da-fA-F]+)?(?:[pP][-+]?\d+)?|(?:\d+|\d*\.\d+)(?:[eE][-+]?\d+)?))$/;

export const isValidDecimalInput = (
  v?: null | string | number | Prisma.DecimalJsLike,
): v is string | number | Prisma.DecimalJsLike => {
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
]);

export const PaymentScalarFieldEnumSchema = z.enum([
  'id',
  'tenantId',
  'invoiceId',
  'status',
  'method',
  'amount',
  'referenceCode',
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

export const SortOrderSchema = z.enum(['asc', 'desc']);

export const NullableJsonNullValueInputSchema: z.ZodType<Prisma.NullableJsonNullValueInput> = z
  .enum(['DbNull', 'JsonNull'])
  .transform((value) =>
    value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value,
  );

export const JsonNullValueInputSchema: z.ZodType<Prisma.JsonNullValueInput> = z
  .enum(['JsonNull'])
  .transform((value) => (value === 'JsonNull' ? Prisma.JsonNull : value));

export const QueryModeSchema = z.enum(['default', 'insensitive']);

export const NullsOrderSchema = z.enum(['first', 'last']);

export const JsonNullValueFilterSchema: z.ZodType<Prisma.JsonNullValueFilter> = z
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

export type TenantStatusType = `${z.infer<typeof TenantStatusSchema>}`;

export const PermissionScopeSchema = z.enum(['OWN', 'BRANCH', 'TENANT', 'ANY']);

export type PermissionScopeType = `${z.infer<typeof PermissionScopeSchema>}`;

export const MenuStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);

export type MenuStatusType = `${z.infer<typeof MenuStatusSchema>}`;

export const CategoryStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);

export type CategoryStatusType = `${z.infer<typeof CategoryStatusSchema>}`;

export const MenuItemStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']);

export type MenuItemStatusType = `${z.infer<typeof MenuItemStatusSchema>}`;

export const ComboStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);

export type ComboStatusType = `${z.infer<typeof ComboStatusSchema>}`;

export const TableStatusSchema = z.enum(['AVAILABLE', 'SEATED', 'BILLED', 'RESERVED']);

export type TableStatusType = `${z.infer<typeof TableStatusSchema>}`;

export const ReservationStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'SEATED',
  'CANCELLED',
  'NO_SHOW',
]);

export type ReservationStatusType = `${z.infer<typeof ReservationStatusSchema>}`;

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

export type OrderStatusType = `${z.infer<typeof OrderStatusSchema>}`;

export const OrderTypeSchema = z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY']);

export type OrderTypeType = `${z.infer<typeof OrderTypeSchema>}`;

export const OrderItemStatusSchema = z.enum(['PENDING', 'IN_PREP', 'READY', 'SERVED', 'VOIDED']);

export type OrderItemStatusType = `${z.infer<typeof OrderItemStatusSchema>}`;

export const SupplierStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'BLACKLISTED']);

export type SupplierStatusType = `${z.infer<typeof SupplierStatusSchema>}`;

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

export type IngredientUnitType = `${z.infer<typeof IngredientUnitSchema>}`;

export const StockMovementTypeSchema = z.enum([
  'PURCHASE',
  'CONSUMPTION',
  'SPOILAGE',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'ADJUSTMENT',
  'RETURN',
]);

export type StockMovementTypeType = `${z.infer<typeof StockMovementTypeSchema>}`;

export const PurchaseOrderStatusSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'APPROVED',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CANCELLED',
]);

export type PurchaseOrderStatusType = `${z.infer<typeof PurchaseOrderStatusSchema>}`;

export const GoodsReceiptStatusSchema = z.enum(['PENDING', 'COMPLETED', 'REJECTED']);

export type GoodsReceiptStatusType = `${z.infer<typeof GoodsReceiptStatusSchema>}`;

export const InvoiceStatusSchema = z.enum([
  'DRAFT',
  'ISSUED',
  'PARTIALLY_PAID',
  'PAID',
  'VOIDED',
  'REFUNDED',
]);

export type InvoiceStatusType = `${z.infer<typeof InvoiceStatusSchema>}`;

export const PaymentStatusSchema = z.enum([
  'INITIATED',
  'AUTHORIZED',
  'CAPTURED',
  'FAILED',
  'VOIDED',
  'REFUNDED',
]);

export type PaymentStatusType = `${z.infer<typeof PaymentStatusSchema>}`;

export const PaymentMethodSchema = z.enum([
  'CASH',
  'CARD',
  'MOBILE',
  'GIFT_CARD',
  'LOYALTY',
  'SPLIT',
]);

export type PaymentMethodType = `${z.infer<typeof PaymentMethodSchema>}`;

export const RefundStatusSchema = z.enum(['PENDING', 'APPROVED', 'PROCESSED', 'REJECTED']);

export type RefundStatusType = `${z.infer<typeof RefundStatusSchema>}`;

export const JournalEntryTypeSchema = z.enum(['DEBIT', 'CREDIT']);

export type JournalEntryTypeType = `${z.infer<typeof JournalEntryTypeSchema>}`;

export const LedgerAccountTypeSchema = z.enum([
  'ASSET',
  'LIABILITY',
  'EQUITY',
  'REVENUE',
  'EXPENSE',
]);

export type LedgerAccountTypeType = `${z.infer<typeof LedgerAccountTypeSchema>}`;

export const ShiftStatusSchema = z.enum(['OPEN', 'CLOSED']);

export type ShiftStatusType = `${z.infer<typeof ShiftStatusSchema>}`;

export const DailyClosingStatusSchema = z.enum(['PENDING', 'RECONCILED', 'LOCKED']);

export type DailyClosingStatusType = `${z.infer<typeof DailyClosingStatusSchema>}`;

export const ConfigurationLevelSchema = z.enum(['GLOBAL', 'TENANT', 'BRANCH', 'STATION']);

export type ConfigurationLevelType = `${z.infer<typeof ConfigurationLevelSchema>}`;

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

export type Tenant = z.infer<typeof TenantSchema>;

// TENANT RELATION SCHEMA
//------------------------------------------------------

export type TenantRelations = {
  branches: BranchWithRelations[];
  users: UserWithRelations[];
  roles: RoleWithRelations[];
  permissions: PermissionWithRelations[];
  userRoles: UserRoleWithRelations[];
  branchAssignments: BranchAssignmentWithRelations[];
  menus: MenuWithRelations[];
  categories: CategoryWithRelations[];
  menuItems: MenuItemWithRelations[];
  modifierGroups: ModifierGroupWithRelations[];
  modifierOptions: ModifierOptionWithRelations[];
  menuItemModifierGroups: MenuItemModifierGroupWithRelations[];
  combos: ComboWithRelations[];
  comboItems: ComboItemWithRelations[];
  diningTables: DiningTableWithRelations[];
  reservations: ReservationWithRelations[];
  orders: OrderWithRelations[];
  orderItems: OrderItemWithRelations[];
  orderMerges: OrderMergeWithRelations[];
  suppliers: SupplierWithRelations[];
  ingredients: IngredientWithRelations[];
  inventoryItems: InventoryItemWithRelations[];
  inventoryBatches: InventoryBatchWithRelations[];
  stockMovements: StockMovementWithRelations[];
  recipes: RecipeWithRelations[];
  recipeIngredients: RecipeIngredientWithRelations[];
  purchaseOrders: PurchaseOrderWithRelations[];
  goodsReceipts: GoodsReceiptWithRelations[];
  invoices: InvoiceWithRelations[];
  payments: PaymentWithRelations[];
  refunds: RefundWithRelations[];
  ledgerAccounts: LedgerAccountWithRelations[];
  journals: JournalWithRelations[];
  journalEntries: JournalEntryWithRelations[];
  shifts: ShiftWithRelations[];
  cashDrawers: CashDrawerWithRelations[];
  dailyClosings: DailyClosingWithRelations[];
  auditLogs: AuditLogWithRelations[];
  configurations: ConfigurationWithRelations[];
  fiscalPeriods: FiscalPeriodWithRelations[];
  costCenters: CostCenterWithRelations[];
  supplierInvoices: SupplierInvoiceWithRelations[];
};

export type TenantWithRelations = z.infer<typeof TenantSchema> & TenantRelations;

export const TenantWithRelationsSchema: z.ZodType<TenantWithRelations> = TenantSchema.merge(
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

export type Branch = z.infer<typeof BranchSchema>;

// BRANCH RELATION SCHEMA
//------------------------------------------------------

export type BranchRelations = {
  tenant: TenantWithRelations;
  userRoles: UserRoleWithRelations[];
  branchAssignments: BranchAssignmentWithRelations[];
  menuBranches: MenuBranchWithRelations[];
  diningTables: DiningTableWithRelations[];
  reservations: ReservationWithRelations[];
  orders: OrderWithRelations[];
  suppliers: SupplierWithRelations[];
  inventoryItems: InventoryItemWithRelations[];
  inventoryBatches: InventoryBatchWithRelations[];
  stockMovements: StockMovementWithRelations[];
  purchaseOrders: PurchaseOrderWithRelations[];
  goodsReceipts: GoodsReceiptWithRelations[];
  invoices: InvoiceWithRelations[];
  costCenters: CostCenterWithRelations[];
  supplierInvoices: SupplierInvoiceWithRelations[];
  shifts: ShiftWithRelations[];
  cashDrawers: CashDrawerWithRelations[];
  dailyClosings: DailyClosingWithRelations[];
  configurations: ConfigurationWithRelations[];
};

export type BranchWithRelations = Omit<z.infer<typeof BranchSchema>, 'taxConfig'> & {
  taxConfig?: JsonValueType | null;
} & BranchRelations;

export const BranchWithRelationsSchema: z.ZodType<BranchWithRelations> = BranchSchema.merge(
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

export type User = z.infer<typeof UserSchema>;

// USER RELATION SCHEMA
//------------------------------------------------------

export type UserRelations = {
  tenant: TenantWithRelations;
  userRoles: UserRoleWithRelations[];
  branchAssignments: BranchAssignmentWithRelations[];
  orders: OrderWithRelations[];
  reservations: ReservationWithRelations[];
  shifts: ShiftWithRelations[];
  auditLogs: AuditLogWithRelations[];
};

export type UserWithRelations = z.infer<typeof UserSchema> & UserRelations;

export const UserWithRelationsSchema: z.ZodType<UserWithRelations> = UserSchema.merge(
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

export type Role = z.infer<typeof RoleSchema>;

// ROLE RELATION SCHEMA
//------------------------------------------------------

export type RoleRelations = {
  tenant: TenantWithRelations;
  parent?: RoleWithRelations | null;
  children: RoleWithRelations[];
  permissions: PermissionWithRelations[];
  userRoles: UserRoleWithRelations[];
};

export type RoleWithRelations = z.infer<typeof RoleSchema> & RoleRelations;

export const RoleWithRelationsSchema: z.ZodType<RoleWithRelations> = RoleSchema.merge(
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

export type Permission = z.infer<typeof PermissionSchema>;

// PERMISSION RELATION SCHEMA
//------------------------------------------------------

export type PermissionRelations = {
  tenant: TenantWithRelations;
  role: RoleWithRelations;
};

export type PermissionWithRelations = z.infer<typeof PermissionSchema> & PermissionRelations;

export const PermissionWithRelationsSchema: z.ZodType<PermissionWithRelations> =
  PermissionSchema.merge(
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

export type UserRole = z.infer<typeof UserRoleSchema>;

// USER ROLE RELATION SCHEMA
//------------------------------------------------------

export type UserRoleRelations = {
  tenant: TenantWithRelations;
  user: UserWithRelations;
  role: RoleWithRelations;
  branch?: BranchWithRelations | null;
};

export type UserRoleWithRelations = z.infer<typeof UserRoleSchema> & UserRoleRelations;

export const UserRoleWithRelationsSchema: z.ZodType<UserRoleWithRelations> = UserRoleSchema.merge(
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

export type BranchAssignment = z.infer<typeof BranchAssignmentSchema>;

// BRANCH ASSIGNMENT RELATION SCHEMA
//------------------------------------------------------

export type BranchAssignmentRelations = {
  tenant: TenantWithRelations;
  user: UserWithRelations;
  branch: BranchWithRelations;
};

export type BranchAssignmentWithRelations = z.infer<typeof BranchAssignmentSchema> &
  BranchAssignmentRelations;

export const BranchAssignmentWithRelationsSchema: z.ZodType<BranchAssignmentWithRelations> =
  BranchAssignmentSchema.merge(
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

export type Menu = z.infer<typeof MenuSchema>;

// MENU RELATION SCHEMA
//------------------------------------------------------

export type MenuRelations = {
  tenant: TenantWithRelations;
  menuVersions: MenuVersionWithRelations[];
  menuBranches: MenuBranchWithRelations[];
  categories: CategoryWithRelations[];
};

export type MenuWithRelations = z.infer<typeof MenuSchema> & MenuRelations;

export const MenuWithRelationsSchema: z.ZodType<MenuWithRelations> = MenuSchema.merge(
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

export type MenuVersion = z.infer<typeof MenuVersionSchema>;

// MENU VERSION RELATION SCHEMA
//------------------------------------------------------

export type MenuVersionRelations = {
  menu: MenuWithRelations;
};

export type MenuVersionWithRelations = z.infer<typeof MenuVersionSchema> & MenuVersionRelations;

export const MenuVersionWithRelationsSchema: z.ZodType<MenuVersionWithRelations> =
  MenuVersionSchema.merge(
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

export type MenuBranch = z.infer<typeof MenuBranchSchema>;

// MENU BRANCH RELATION SCHEMA
//------------------------------------------------------

export type MenuBranchRelations = {
  menu: MenuWithRelations;
  branch: BranchWithRelations;
};

export type MenuBranchWithRelations = z.infer<typeof MenuBranchSchema> & MenuBranchRelations;

export const MenuBranchWithRelationsSchema: z.ZodType<MenuBranchWithRelations> =
  MenuBranchSchema.merge(
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

export type Category = z.infer<typeof CategorySchema>;

// CATEGORY RELATION SCHEMA
//------------------------------------------------------

export type CategoryRelations = {
  tenant: TenantWithRelations;
  menu: MenuWithRelations;
  parent?: CategoryWithRelations | null;
  children: CategoryWithRelations[];
  menuItems: MenuItemWithRelations[];
};

export type CategoryWithRelations = z.infer<typeof CategorySchema> & CategoryRelations;

export const CategoryWithRelationsSchema: z.ZodType<CategoryWithRelations> = CategorySchema.merge(
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

export type MenuItem = z.infer<typeof MenuItemSchema>;

// MENU ITEM RELATION SCHEMA
//------------------------------------------------------

export type MenuItemRelations = {
  tenant: TenantWithRelations;
  category: CategoryWithRelations;
  menuItemModifierGroups: MenuItemModifierGroupWithRelations[];
  comboItems: ComboItemWithRelations[];
  orderItems: OrderItemWithRelations[];
};

export type MenuItemWithRelations = z.infer<typeof MenuItemSchema> & MenuItemRelations;

export const MenuItemWithRelationsSchema: z.ZodType<MenuItemWithRelations> = MenuItemSchema.merge(
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

export type ModifierGroup = z.infer<typeof ModifierGroupSchema>;

// MODIFIER GROUP RELATION SCHEMA
//------------------------------------------------------

export type ModifierGroupRelations = {
  tenant: TenantWithRelations;
  modifierOptions: ModifierOptionWithRelations[];
  menuItemModifierGroups: MenuItemModifierGroupWithRelations[];
};

export type ModifierGroupWithRelations = z.infer<typeof ModifierGroupSchema> &
  ModifierGroupRelations;

export const ModifierGroupWithRelationsSchema: z.ZodType<ModifierGroupWithRelations> =
  ModifierGroupSchema.merge(
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

export type ModifierOption = z.infer<typeof ModifierOptionSchema>;

// MODIFIER OPTION RELATION SCHEMA
//------------------------------------------------------

export type ModifierOptionRelations = {
  tenant: TenantWithRelations;
  modifierGroup: ModifierGroupWithRelations;
  orderItemModifierSelections: OrderItemModifierSelectionWithRelations[];
};

export type ModifierOptionWithRelations = z.infer<typeof ModifierOptionSchema> &
  ModifierOptionRelations;

export const ModifierOptionWithRelationsSchema: z.ZodType<ModifierOptionWithRelations> =
  ModifierOptionSchema.merge(
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

export type MenuItemModifierGroup = z.infer<typeof MenuItemModifierGroupSchema>;

// MENU ITEM MODIFIER GROUP RELATION SCHEMA
//------------------------------------------------------

export type MenuItemModifierGroupRelations = {
  tenant: TenantWithRelations;
  menuItem: MenuItemWithRelations;
  modifierGroup: ModifierGroupWithRelations;
};

export type MenuItemModifierGroupWithRelations = z.infer<typeof MenuItemModifierGroupSchema> &
  MenuItemModifierGroupRelations;

export const MenuItemModifierGroupWithRelationsSchema: z.ZodType<MenuItemModifierGroupWithRelations> =
  MenuItemModifierGroupSchema.merge(
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

export type Combo = z.infer<typeof ComboSchema>;

// COMBO RELATION SCHEMA
//------------------------------------------------------

export type ComboRelations = {
  tenant: TenantWithRelations;
  comboItems: ComboItemWithRelations[];
};

export type ComboWithRelations = z.infer<typeof ComboSchema> & ComboRelations;

export const ComboWithRelationsSchema: z.ZodType<ComboWithRelations> = ComboSchema.merge(
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

export type ComboItem = z.infer<typeof ComboItemSchema>;

// COMBO ITEM RELATION SCHEMA
//------------------------------------------------------

export type ComboItemRelations = {
  tenant: TenantWithRelations;
  combo: ComboWithRelations;
  menuItem: MenuItemWithRelations;
};

export type ComboItemWithRelations = z.infer<typeof ComboItemSchema> & ComboItemRelations;

export const ComboItemWithRelationsSchema: z.ZodType<ComboItemWithRelations> =
  ComboItemSchema.merge(
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

export type DiningTable = z.infer<typeof DiningTableSchema>;

// DINING TABLE RELATION SCHEMA
//------------------------------------------------------

export type DiningTableRelations = {
  tenant: TenantWithRelations;
  branch: BranchWithRelations;
  reservations: ReservationWithRelations[];
  orders: OrderWithRelations[];
};

export type DiningTableWithRelations = z.infer<typeof DiningTableSchema> & DiningTableRelations;

export const DiningTableWithRelationsSchema: z.ZodType<DiningTableWithRelations> =
  DiningTableSchema.merge(
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

export type Reservation = z.infer<typeof ReservationSchema>;

// RESERVATION RELATION SCHEMA
//------------------------------------------------------

export type ReservationRelations = {
  tenant: TenantWithRelations;
  branch: BranchWithRelations;
  diningTable?: DiningTableWithRelations | null;
  user?: UserWithRelations | null;
};

export type ReservationWithRelations = z.infer<typeof ReservationSchema> & ReservationRelations;

export const ReservationWithRelationsSchema: z.ZodType<ReservationWithRelations> =
  ReservationSchema.merge(
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
});

export type Order = z.infer<typeof OrderSchema>;

// ORDER RELATION SCHEMA
//------------------------------------------------------

export type OrderRelations = {
  tenant: TenantWithRelations;
  branch: BranchWithRelations;
  diningTable?: DiningTableWithRelations | null;
  user?: UserWithRelations | null;
  parentOrder?: OrderWithRelations | null;
  childOrders: OrderWithRelations[];
  orderItems: OrderItemWithRelations[];
  orderMergesAsParent: OrderMergeWithRelations[];
  orderMergesAsChild: OrderMergeWithRelations[];
};

export type OrderWithRelations = z.infer<typeof OrderSchema> & OrderRelations;

export const OrderWithRelationsSchema: z.ZodType<OrderWithRelations> = OrderSchema.merge(
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

export type OrderMerge = z.infer<typeof OrderMergeSchema>;

// ORDER MERGE RELATION SCHEMA
//------------------------------------------------------

export type OrderMergeRelations = {
  tenant: TenantWithRelations;
  parentOrder: OrderWithRelations;
  childOrder: OrderWithRelations;
};

export type OrderMergeWithRelations = z.infer<typeof OrderMergeSchema> & OrderMergeRelations;

export const OrderMergeWithRelationsSchema: z.ZodType<OrderMergeWithRelations> =
  OrderMergeSchema.merge(
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

export type OrderItem = z.infer<typeof OrderItemSchema>;

// ORDER ITEM RELATION SCHEMA
//------------------------------------------------------

export type OrderItemRelations = {
  tenant: TenantWithRelations;
  order: OrderWithRelations;
  menuItem: MenuItemWithRelations;
  orderItemModifierSelections: OrderItemModifierSelectionWithRelations[];
  orderItemRecipeSnapshots: OrderItemRecipeSnapshotWithRelations[];
};

export type OrderItemWithRelations = z.infer<typeof OrderItemSchema> & OrderItemRelations;

export const OrderItemWithRelationsSchema: z.ZodType<OrderItemWithRelations> =
  OrderItemSchema.merge(
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

export type OrderItemModifierSelection = z.infer<typeof OrderItemModifierSelectionSchema>;

// ORDER ITEM MODIFIER SELECTION RELATION SCHEMA
//------------------------------------------------------

export type OrderItemModifierSelectionRelations = {
  orderItem: OrderItemWithRelations;
  modifierOption: ModifierOptionWithRelations;
};

export type OrderItemModifierSelectionWithRelations = z.infer<
  typeof OrderItemModifierSelectionSchema
> &
  OrderItemModifierSelectionRelations;

export const OrderItemModifierSelectionWithRelationsSchema: z.ZodType<OrderItemModifierSelectionWithRelations> =
  OrderItemModifierSelectionSchema.merge(
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

export type OrderItemRecipeSnapshot = z.infer<typeof OrderItemRecipeSnapshotSchema>;

// ORDER ITEM RECIPE SNAPSHOT RELATION SCHEMA
//------------------------------------------------------

export type OrderItemRecipeSnapshotRelations = {
  orderItem: OrderItemWithRelations;
};

export type OrderItemRecipeSnapshotWithRelations = z.infer<typeof OrderItemRecipeSnapshotSchema> &
  OrderItemRecipeSnapshotRelations;

export const OrderItemRecipeSnapshotWithRelationsSchema: z.ZodType<OrderItemRecipeSnapshotWithRelations> =
  OrderItemRecipeSnapshotSchema.merge(
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

export type Supplier = z.infer<typeof SupplierSchema>;

// SUPPLIER RELATION SCHEMA
//------------------------------------------------------

export type SupplierRelations = {
  tenant: TenantWithRelations;
  branch?: BranchWithRelations | null;
  purchaseOrders: PurchaseOrderWithRelations[];
  supplierInvoices: SupplierInvoiceWithRelations[];
};

export type SupplierWithRelations = z.infer<typeof SupplierSchema> & SupplierRelations;

export const SupplierWithRelationsSchema: z.ZodType<SupplierWithRelations> = SupplierSchema.merge(
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

export type Ingredient = z.infer<typeof IngredientSchema>;

// INGREDIENT RELATION SCHEMA
//------------------------------------------------------

export type IngredientRelations = {
  tenant: TenantWithRelations;
  inventoryItems: InventoryItemWithRelations[];
  recipeIngredients: RecipeIngredientWithRelations[];
  inventoryBatches: InventoryBatchWithRelations[];
  stockMovements: StockMovementWithRelations[];
  goodsReceiptItems: GoodsReceiptItemWithRelations[];
};

export type IngredientWithRelations = z.infer<typeof IngredientSchema> & IngredientRelations;

export const IngredientWithRelationsSchema: z.ZodType<IngredientWithRelations> =
  IngredientSchema.merge(
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

export type InventoryItem = z.infer<typeof InventoryItemSchema>;

// INVENTORY ITEM RELATION SCHEMA
//------------------------------------------------------

export type InventoryItemRelations = {
  tenant: TenantWithRelations;
  branch: BranchWithRelations;
  ingredient: IngredientWithRelations;
};

export type InventoryItemWithRelations = z.infer<typeof InventoryItemSchema> &
  InventoryItemRelations;

export const InventoryItemWithRelationsSchema: z.ZodType<InventoryItemWithRelations> =
  InventoryItemSchema.merge(
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

export type InventoryBatch = z.infer<typeof InventoryBatchSchema>;

// INVENTORY BATCH RELATION SCHEMA
//------------------------------------------------------

export type InventoryBatchRelations = {
  tenant: TenantWithRelations;
  branch: BranchWithRelations;
  ingredient: IngredientWithRelations;
};

export type InventoryBatchWithRelations = z.infer<typeof InventoryBatchSchema> &
  InventoryBatchRelations;

export const InventoryBatchWithRelationsSchema: z.ZodType<InventoryBatchWithRelations> =
  InventoryBatchSchema.merge(
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

export type StockMovement = z.infer<typeof StockMovementSchema>;

// STOCK MOVEMENT RELATION SCHEMA
//------------------------------------------------------

export type StockMovementRelations = {
  tenant: TenantWithRelations;
  branch: BranchWithRelations;
  ingredient: IngredientWithRelations;
};

export type StockMovementWithRelations = z.infer<typeof StockMovementSchema> &
  StockMovementRelations;

export const StockMovementWithRelationsSchema: z.ZodType<StockMovementWithRelations> =
  StockMovementSchema.merge(
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

export type Recipe = z.infer<typeof RecipeSchema>;

// RECIPE RELATION SCHEMA
//------------------------------------------------------

export type RecipeRelations = {
  tenant: TenantWithRelations;
  recipeIngredients: RecipeIngredientWithRelations[];
};

export type RecipeWithRelations = z.infer<typeof RecipeSchema> & RecipeRelations;

export const RecipeWithRelationsSchema: z.ZodType<RecipeWithRelations> = RecipeSchema.merge(
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

export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;

// RECIPE INGREDIENT RELATION SCHEMA
//------------------------------------------------------

export type RecipeIngredientRelations = {
  tenant: TenantWithRelations;
  recipe: RecipeWithRelations;
  ingredient: IngredientWithRelations;
};

export type RecipeIngredientWithRelations = z.infer<typeof RecipeIngredientSchema> &
  RecipeIngredientRelations;

export const RecipeIngredientWithRelationsSchema: z.ZodType<RecipeIngredientWithRelations> =
  RecipeIngredientSchema.merge(
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

export type PurchaseOrder = z.infer<typeof PurchaseOrderSchema>;

// PURCHASE ORDER RELATION SCHEMA
//------------------------------------------------------

export type PurchaseOrderRelations = {
  tenant: TenantWithRelations;
  branch: BranchWithRelations;
  supplier: SupplierWithRelations;
  purchaseOrderItems: PurchaseOrderItemWithRelations[];
  goodsReceipts: GoodsReceiptWithRelations[];
  supplierInvoice?: SupplierInvoiceWithRelations | null;
};

export type PurchaseOrderWithRelations = z.infer<typeof PurchaseOrderSchema> &
  PurchaseOrderRelations;

export const PurchaseOrderWithRelationsSchema: z.ZodType<PurchaseOrderWithRelations> =
  PurchaseOrderSchema.merge(
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

export type PurchaseOrderItem = z.infer<typeof PurchaseOrderItemSchema>;

// PURCHASE ORDER ITEM RELATION SCHEMA
//------------------------------------------------------

export type PurchaseOrderItemRelations = {
  purchaseOrder: PurchaseOrderWithRelations;
};

export type PurchaseOrderItemWithRelations = z.infer<typeof PurchaseOrderItemSchema> &
  PurchaseOrderItemRelations;

export const PurchaseOrderItemWithRelationsSchema: z.ZodType<PurchaseOrderItemWithRelations> =
  PurchaseOrderItemSchema.merge(
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

export type GoodsReceipt = z.infer<typeof GoodsReceiptSchema>;

// GOODS RECEIPT RELATION SCHEMA
//------------------------------------------------------

export type GoodsReceiptRelations = {
  tenant: TenantWithRelations;
  branch: BranchWithRelations;
  purchaseOrder: PurchaseOrderWithRelations;
  goodsReceiptItems: GoodsReceiptItemWithRelations[];
};

export type GoodsReceiptWithRelations = z.infer<typeof GoodsReceiptSchema> & GoodsReceiptRelations;

export const GoodsReceiptWithRelationsSchema: z.ZodType<GoodsReceiptWithRelations> =
  GoodsReceiptSchema.merge(
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

export type GoodsReceiptItem = z.infer<typeof GoodsReceiptItemSchema>;

// GOODS RECEIPT ITEM RELATION SCHEMA
//------------------------------------------------------

export type GoodsReceiptItemRelations = {
  goodsReceipt: GoodsReceiptWithRelations;
  ingredient: IngredientWithRelations;
};

export type GoodsReceiptItemWithRelations = z.infer<typeof GoodsReceiptItemSchema> &
  GoodsReceiptItemRelations;

export const GoodsReceiptItemWithRelationsSchema: z.ZodType<GoodsReceiptItemWithRelations> =
  GoodsReceiptItemSchema.merge(
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

export type LedgerAccount = z.infer<typeof LedgerAccountSchema>;

// LEDGER ACCOUNT RELATION SCHEMA
//------------------------------------------------------

export type LedgerAccountRelations = {
  tenant: TenantWithRelations;
  parent?: LedgerAccountWithRelations | null;
  children: LedgerAccountWithRelations[];
  journalEntries: JournalEntryWithRelations[];
};

export type LedgerAccountWithRelations = z.infer<typeof LedgerAccountSchema> &
  LedgerAccountRelations;

export const LedgerAccountWithRelationsSchema: z.ZodType<LedgerAccountWithRelations> =
  LedgerAccountSchema.merge(
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

export type Shift = z.infer<typeof ShiftSchema>;

// SHIFT RELATION SCHEMA
//------------------------------------------------------

export type ShiftRelations = {
  tenant: TenantWithRelations;
  branch: BranchWithRelations;
  user: UserWithRelations;
  cashDrawers: CashDrawerWithRelations[];
  journals: JournalWithRelations[];
};

export type ShiftWithRelations = z.infer<typeof ShiftSchema> & ShiftRelations;

export const ShiftWithRelationsSchema: z.ZodType<ShiftWithRelations> = ShiftSchema.merge(
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

export type CashDrawer = z.infer<typeof CashDrawerSchema>;

// CASH DRAWER RELATION SCHEMA
//------------------------------------------------------

export type CashDrawerRelations = {
  tenant: TenantWithRelations;
  branch: BranchWithRelations;
  shift: ShiftWithRelations;
};

export type CashDrawerWithRelations = z.infer<typeof CashDrawerSchema> & CashDrawerRelations;

export const CashDrawerWithRelationsSchema: z.ZodType<CashDrawerWithRelations> =
  CashDrawerSchema.merge(
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

export type DailyClosing = z.infer<typeof DailyClosingSchema>;

// DAILY CLOSING RELATION SCHEMA
//------------------------------------------------------

export type DailyClosingRelations = {
  tenant: TenantWithRelations;
  branch: BranchWithRelations;
};

export type DailyClosingWithRelations = z.infer<typeof DailyClosingSchema> & DailyClosingRelations;

export const DailyClosingWithRelationsSchema: z.ZodType<DailyClosingWithRelations> =
  DailyClosingSchema.merge(
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
});

export type Invoice = z.infer<typeof InvoiceSchema>;

// INVOICE RELATION SCHEMA
//------------------------------------------------------

export type InvoiceRelations = {
  tenant: TenantWithRelations;
  branch: BranchWithRelations;
  payments: PaymentWithRelations[];
  refunds: RefundWithRelations[];
};

export type InvoiceWithRelations = z.infer<typeof InvoiceSchema> & InvoiceRelations;

export const InvoiceWithRelationsSchema: z.ZodType<InvoiceWithRelations> = InvoiceSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
    branch: z.lazy(() => BranchWithRelationsSchema),
    payments: z.lazy(() => PaymentWithRelationsSchema).array(),
    refunds: z.lazy(() => RefundWithRelationsSchema).array(),
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

export type Payment = z.infer<typeof PaymentSchema>;

// PAYMENT RELATION SCHEMA
//------------------------------------------------------

export type PaymentRelations = {
  invoice: InvoiceWithRelations;
  refunds: RefundWithRelations[];
  Tenant: TenantWithRelations;
};

export type PaymentWithRelations = Omit<z.infer<typeof PaymentSchema>, 'gatewayPayload'> & {
  gatewayPayload?: JsonValueType | null;
} & PaymentRelations;

export const PaymentWithRelationsSchema: z.ZodType<PaymentWithRelations> = PaymentSchema.merge(
  z.object({
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

export type Refund = z.infer<typeof RefundSchema>;

// REFUND RELATION SCHEMA
//------------------------------------------------------

export type RefundRelations = {
  invoice: InvoiceWithRelations;
  payment: PaymentWithRelations;
  Tenant: TenantWithRelations;
};

export type RefundWithRelations = z.infer<typeof RefundSchema> & RefundRelations;

export const RefundWithRelationsSchema: z.ZodType<RefundWithRelations> = RefundSchema.merge(
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

export type Journal = z.infer<typeof JournalSchema>;

// JOURNAL RELATION SCHEMA
//------------------------------------------------------

export type JournalRelations = {
  tenant: TenantWithRelations;
  shift?: ShiftWithRelations | null;
  journalEntries: JournalEntryWithRelations[];
};

export type JournalWithRelations = z.infer<typeof JournalSchema> & JournalRelations;

export const JournalWithRelationsSchema: z.ZodType<JournalWithRelations> = JournalSchema.merge(
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

export type JournalEntry = z.infer<typeof JournalEntrySchema>;

// JOURNAL ENTRY RELATION SCHEMA
//------------------------------------------------------

export type JournalEntryRelations = {
  tenant: TenantWithRelations;
  journal: JournalWithRelations;
  ledgerAccount: LedgerAccountWithRelations;
};

export type JournalEntryWithRelations = z.infer<typeof JournalEntrySchema> & JournalEntryRelations;

export const JournalEntryWithRelationsSchema: z.ZodType<JournalEntryWithRelations> =
  JournalEntrySchema.merge(
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

export type AuditLog = z.infer<typeof AuditLogSchema>;

// AUDIT LOG RELATION SCHEMA
//------------------------------------------------------

export type AuditLogRelations = {
  tenant: TenantWithRelations;
  user?: UserWithRelations | null;
};

export type AuditLogWithRelations = Omit<
  z.infer<typeof AuditLogSchema>,
  'beforeState' | 'afterState'
> & {
  beforeState?: JsonValueType | null;
  afterState?: JsonValueType | null;
} & AuditLogRelations;

export const AuditLogWithRelationsSchema: z.ZodType<AuditLogWithRelations> = AuditLogSchema.merge(
  z.object({
    tenant: z.lazy(() => TenantWithRelationsSchema),
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

export type Configuration = z.infer<typeof ConfigurationSchema>;

// CONFIGURATION RELATION SCHEMA
//------------------------------------------------------

export type ConfigurationRelations = {
  tenant?: TenantWithRelations | null;
  branch?: BranchWithRelations | null;
};

export type ConfigurationWithRelations = z.infer<typeof ConfigurationSchema> &
  ConfigurationRelations;

export const ConfigurationWithRelationsSchema: z.ZodType<ConfigurationWithRelations> =
  ConfigurationSchema.merge(
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

export type FiscalPeriod = z.infer<typeof FiscalPeriodSchema>;

// FISCAL PERIOD RELATION SCHEMA
//------------------------------------------------------

export type FiscalPeriodRelations = {
  tenant: TenantWithRelations;
};

export type FiscalPeriodWithRelations = z.infer<typeof FiscalPeriodSchema> & FiscalPeriodRelations;

export const FiscalPeriodWithRelationsSchema: z.ZodType<FiscalPeriodWithRelations> =
  FiscalPeriodSchema.merge(
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

export type CostCenter = z.infer<typeof CostCenterSchema>;

// COST CENTER RELATION SCHEMA
//------------------------------------------------------

export type CostCenterRelations = {
  tenant: TenantWithRelations;
  branch?: BranchWithRelations | null;
};

export type CostCenterWithRelations = z.infer<typeof CostCenterSchema> & CostCenterRelations;

export const CostCenterWithRelationsSchema: z.ZodType<CostCenterWithRelations> =
  CostCenterSchema.merge(
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

export type SupplierInvoice = z.infer<typeof SupplierInvoiceSchema>;

// SUPPLIER INVOICE RELATION SCHEMA
//------------------------------------------------------

export type SupplierInvoiceRelations = {
  tenant: TenantWithRelations;
  branch: BranchWithRelations;
  supplier: SupplierWithRelations;
  purchaseOrder?: PurchaseOrderWithRelations | null;
};

export type SupplierInvoiceWithRelations = z.infer<typeof SupplierInvoiceSchema> &
  SupplierInvoiceRelations;

export const SupplierInvoiceWithRelationsSchema: z.ZodType<SupplierInvoiceWithRelations> =
  SupplierInvoiceSchema.merge(
    z.object({
      tenant: z.lazy(() => TenantWithRelationsSchema),
      branch: z.lazy(() => BranchWithRelationsSchema),
      supplier: z.lazy(() => SupplierWithRelationsSchema),
      purchaseOrder: z.lazy(() => PurchaseOrderWithRelationsSchema).nullable(),
    }),
  );
