import express from 'express';
import cors from 'cors';
import { loggerMiddleware } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';
import { branchRouter } from './modules/branch/branch.router';
import { staffRouter } from './modules/staff/staff.router';
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
import { ledgerRouter } from './modules/finance/ledger.router';
import { supplierRouter } from './modules/inventory/supplier.router';
import { ingredientRouter } from './modules/inventory/ingredient.router';
import { inventoryItemRouter } from './modules/inventory/inventory-item.router';
import { initEventBus, closeEventBus } from './lib/eventBus';

const app = express();
const port = process.env.PORT || 3001;

import { idempotencyMiddleware } from './middleware/idempotency.middleware';

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// V1 API Routes
app.use('/api/v1/auth', authRouter);

// Global authenticated middleware for V1 routes
import { authMiddleware } from './middleware/auth.middleware';
app.use('/api/v1', authMiddleware);
app.use('/api/v1', idempotencyMiddleware);

app.use('/api/v1/branches', branchRouter);
app.use('/api/v1/staff', staffRouter);
app.use('/api/v1/roles', roleRouter);
app.use('/api/v1/settings', settingsRouter);

// Catalog Routes
app.use('/api/v1/menus', menuRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/menu-items', itemRouter);
app.use('/api/v1/modifiers', modifierGroupRouter);
app.use('/api/v1/modifier-options', modifierOptionRouter);
app.use('/api/v1/combos', comboRouter);

// Order Routes
app.use('/api/v1/orders', orderRouter);

// Finance Routes
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/ledger', ledgerRouter);

// Supply Chain / Inventory Routes
app.use('/api/v1/suppliers', supplierRouter);
app.use('/api/v1/ingredients', ingredientRouter);
app.use('/api/v1/inventory-items', inventoryItemRouter);

// Global Error Handler (must be after routes)
app.use(errorHandler);

async function startServer() {
  await initEventBus();

  const server = app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });

  const shutdown = async () => {
    console.log('Shutting down API server...');
    server.close();
    await closeEventBus();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
