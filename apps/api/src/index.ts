import cors from 'cors';
import { app } from './server';
import { env } from './config/env';

const PORT = env.PORT;

// Apply CORS directly to the app instance imported from server.ts
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://clinic-lite.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.listen(PORT, () => {
  console.log(`Clinic-Lite API running on port ${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});
