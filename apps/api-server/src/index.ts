import express from 'express';
import cors from 'cors';
import { loggerMiddleware } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';
import { branchRouter } from './modules/branch/branch.router';
import { staffRouter } from './modules/staff/staff.router';
import { customerRouter } from './modules/customer/customer.router';
import { roleRouter } from './modules/role/role.router';
import { settingsRouter } from './modules/settings/settings.router';
import { menuRouter } from './modules/catalog/menu.router';
import { categoryRouter } from './modules/catalog/category.router';
import { itemRouter } from './modules/catalog/item.router';
import { modifierGroupRouter } from './modules/catalog/modifier-group.router';
import { modifierOptionRouter } from './modules/catalog/modifier-option.router';
import { comboRouter } from './modules/catalog/combo.router';
import { authRouter } from './modules/auth/auth.router';
import { orderRouter } from './modules/order/order.router';
import { paymentRouter } from './modules/finance/payment.router';
import { invoiceRouter } from './modules/finance/invoice.router';
import { ledgerRouter } from './modules/finance/ledger.router';
import { supplierRouter } from './modules/inventory/supplier.router';
import { ingredientRouter } from './modules/inventory/ingredient.router';
import { inventoryItemRouter } from './modules/inventory/inventory-item.router';
import { purchaseOrderRouter } from './modules/inventory/purchase-order.router';
import { goodsReceiptRouter } from './modules/inventory/goods-receipt.router';
// import { approvalRouter } from './modules/approval/approval.router';
import { shiftRouter } from './modules/finance/shift.router';
import { dailyClosingRouter } from './modules/finance/daily-closing.router';
import { analyticsRouter } from './modules/analytics/analytics.router';
import { auditRouter } from './modules/audit/audit.router';
import { initEventBus, closeEventBus } from './lib/eventBus';
import { startDepletionWorker } from './modules/inventory/workers/depletion.worker';

import { Worker } from 'bullmq';
import { DepletionJobPayload } from './modules/inventory/workers/depletion.producer';

// Worker reference
let depletionWorker: Worker<DepletionJobPayload> | undefined;

const app = express();
const port = process.env.PORT || 3001;

import { idempotencyMiddleware } from './middleware/idempotency.middleware';

// Global Middlewares
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('Not allowed by CORS'));
      }
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(loggerMiddleware as unknown as express.RequestHandler);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// V1 API Routes
app.use('/api/v1/auth', authRouter);

// Global authenticated middleware for V1 routes
import { authMiddleware } from './middleware/auth.middleware';
app.use('/api/v1', authMiddleware as unknown as express.RequestHandler);
app.use('/api/v1', idempotencyMiddleware);

app.use('/api/v1/branches', branchRouter);
app.use('/api/v1/staff', staffRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/roles', roleRouter);
app.use('/api/v1/settings', settingsRouter);

// Catalog Routes
app.use('/api/v1/menus', menuRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/menu-items', itemRouter);
app.use('/api/v1/modifiers', modifierGroupRouter);
app.use('/api/v1/modifier-options', modifierOptionRouter);
app.use('/api/v1/combos', comboRouter);

app.use('/api/v1/orders', orderRouter);

// Finance Routes
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/invoices', invoiceRouter);
app.use('/api/v1/ledger', ledgerRouter);
// app.use('/api/v1/approvals', approvalRouter);
app.use('/api/v1/shifts', shiftRouter);
app.use('/api/v1/daily-closings', dailyClosingRouter);

// Supply Chain / Inventory Routes
app.use('/api/v1/suppliers', supplierRouter);
app.use('/api/v1/ingredients', ingredientRouter);
app.use('/api/v1/inventory-items', inventoryItemRouter);
app.use('/api/v1/purchase-orders', purchaseOrderRouter);
app.use('/api/v1/goods-receipts', goodsReceiptRouter);

// Analytics / Reports
app.use('/api/v1/reports', analyticsRouter);

// Audit
app.use('/api/v1/audit-logs', auditRouter);

// Global Error Handler (must be after routes)
app.use(errorHandler as unknown as express.ErrorRequestHandler);

async function startServer() {
  await initEventBus();

  // Start background workers
  depletionWorker = startDepletionWorker();

  const server = app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });

  const shutdown = async () => {
    console.log('Shutting down API server...');
    server.close();
    await closeEventBus();
    if (depletionWorker) {
      await depletionWorker.close();
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
