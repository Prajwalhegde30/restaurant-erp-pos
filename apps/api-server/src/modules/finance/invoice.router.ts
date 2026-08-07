import { Router } from 'express';
import { InvoiceController } from './invoice.controller';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

// Only authenticated endpoints

router.get('/', requirePermission('invoices.manage.view'), InvoiceController.getInvoices);

router.get('/:id', requirePermission('invoices.manage.view'), InvoiceController.getInvoiceById);

export { router as invoiceRouter };
