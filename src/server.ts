import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import psnRoutes from './routes/psnRoutes';
import { getNPSSO } from './utils/npsso';

// Load environment variables from .env file
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Allow all origins by default, or set specific origin via env
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-id', 'x-client-secret', 'x-npsso'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/psn', psnRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'PSN API Server is running' });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'PSN API Express Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      npsso: 'GET /api/psn/npsso',
      token: 'GET /api/psn/token',
      profile: 'GET /api/psn/profile/:name?',
      friends: 'GET /api/psn/friends',
      deleteFriend: 'DELETE /api/psn/friends/:name',
      search: 'POST /api/psn/search',
      createGroup: 'POST /api/psn/groups',
      getGroups: 'GET /api/psn/groups',
      getMessages: 'GET /api/psn/messages/:groupId/:threadId?',
      sendMessage: 'POST /api/psn/messages',
      addResource: 'POST /api/psn/resources',
      sendResource: 'POST /api/psn/resources/send'
    }
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, async () => {
  console.log(`PSN API Server is running on port ${PORT}`);
  console.log(`Environment variables: CLIENT_ID (required), NPSSO (optional - will be fetched automatically), CLIENT_SECRET (optional)`);
  
  // Try to fetch NPSSO on startup if not set
  if (!process.env.NPSSO) {
    const [success, npsso] = await getNPSSO();
    if (success) {
      console.log(`NPSSO fetched automatically: ${npsso.substring(0, 20)}...`);
      process.env.NPSSO = npsso;
    } else {
      console.warn('Warning: Could not fetch NPSSO automatically. Some endpoints may require manual NPSSO configuration.');
    }
  }
});

export default app;

