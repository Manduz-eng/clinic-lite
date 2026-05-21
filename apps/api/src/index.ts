import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import appRouter from './routes';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://clinic-lite.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api', appRouter);

const httpServer = createServer(app);

export default httpServer;
