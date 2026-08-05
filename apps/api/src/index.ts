import express from 'express';
import cors from 'cors';
import { loggerMiddleware } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';
import { branchRouter } from './modules/branch/branch.router';
import { staffRouter } from './modules/staff/staff.router';
import { roleRouter } from './modules/role/role.router';
import { settingsRouter } from './modules/settings/settings.router';

const app = express();
const port = process.env.PORT || 3001;

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// V1 API Routes
app.use('/api/v1/branches', branchRouter);
app.use('/api/v1/staff', staffRouter);
app.use('/api/v1/roles', roleRouter);
app.use('/api/v1/settings', settingsRouter);

// Global Error Handler (must be after routes)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
