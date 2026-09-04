import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './modules/auth/auth.routes';
import customerRoutes from './modules/customers/customers.routes';
import supplierRoutes from './modules/suppliers/suppliers.routes';
import invoiceRoutes from './modules/invoices/invoices.routes';
import expenseRoutes from './modules/expenses/expenses.routes';
import paymentRoutes from './modules/payments/payments.routes';
import vatRoutes from './modules/vat/vat.routes';
import hmrcRoutes from './modules/hmrc/hmrc.routes';
import xeroRoutes from './modules/xero/xero.routes';
import reportRoutes from './modules/reports/reports.routes';
import auditRoutes from './modules/audit/audit.routes';
import firmRoutes from './modules/firms/firms.routes';

import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

const envOrigins = [process.env.CORS_ORIGIN, process.env.FRONTEND_URL]
  .filter(Boolean)
  .flatMap((url) => (url as string).split(','))
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envOrigins]));

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(cleanOrigin) || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }

      return callback(new Error(`CORS error: Origin ${origin} not allowed by CORS policy`));
    },
    credentials: true,
  })
);
app.use(express.json());

// API Healthcheck
const healthHandler = (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'finora-api',
    timestamp: new Date().toISOString(),
    integrationMode: process.env.INTEGRATION_MODE || 'sandbox',
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);
app.get('/', healthHandler);

// Modular Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/vat', vatRoutes);
app.use('/api/hmrc', hmrcRoutes);
app.use('/api/xero', xeroRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/firms', firmRoutes);

// Global Error Handling Middleware
app.use(errorHandler);

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Finora V1 API server listening on port ${PORT}`);
  });
}

export default app;