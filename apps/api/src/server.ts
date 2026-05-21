import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/error-handler';
import { authRoutes } from './modules/auth/auth.routes';
import { patientRoutes } from './modules/patients/patients.routes';
import { visitRoutes } from './modules/visits/visits.routes';
import { triageRoutes } from './modules/triage/triage.routes';
import { nursingRoutes } from './modules/nursing/nursing.routes';
import { opdRoutes } from './modules/opd/opd.routes';
import { laboratoryRoutes } from './modules/laboratory/laboratory.routes';
import { pharmacyRoutes } from './modules/pharmacy/pharmacy.routes';
import { billingRoutes } from './modules/billing/billing.routes';
import { mpesaRoutes } from './modules/mpesa/mpesa.routes';
import { procurementRoutes } from './modules/procurement/procurement.routes';
import { inventoryRoutes } from './modules/inventory/inventory.routes';
import { accountsRoutes } from './modules/accounts/accounts.routes';

export const app = express();

app.use(helmet());

// Hardcoded safe origins ensuring both local development and Vercel production work flawlessly
app.use(cors({ 
  origin: [
    'http://localhost:3000', 
    'https://clinic-lite.vercel.app'
  ], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/vitals', triageRoutes);
app.use('/api/nursing-notes', nursingRoutes);
app.use('/api/opd', opdRoutes);
app.use('/api/laboratory', laboratoryRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/accounts', accountsRoutes);

app.use(errorHandler);
