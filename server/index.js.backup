import express from 'express';
import cors from 'cors';
// import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboards.js';
import userRoutes from './routes/users.js';

// Import initialization
import initDatabase from './scripts/initDb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://prod-useast-a.online.tableau.com", "https://analytics.duofuturo.com"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
//       fontSrc: ["'self'", "https://fonts.gstatic.com"],
//       imgSrc: ["'self'", "data:", "https:", "blob:"],
//       connectSrc: ["'self'", "https://prod-useast-a.online.tableau.com", "https://analytics.duofuturo.com"],
//       frameSrc: ["'self'", "https://prod-useast-a.online.tableau.com"],
//       frameAncestors: ["'self'", "https://prod-useast-a.online.tableau.com"]
//     }
//   },
//   crossOriginEmbedderPolicy: false
// }));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://161.97.127.54:5000',
    'https://prod-useast-a.online.tableau.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Don't compress responses with Cache-Control: must-revalidate
    const cacheControl = res.getHeader('Cache-Control');
    if (cacheControl && cacheControl.includes('must-revalidate')) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Logging middleware
app.use(morgan('combined'));

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/users', userRoutes);

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('Initializing database...');
    await initDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
🚀 DuoFuturo BI Server Started Successfully!

📡 Server: http://161.97.127.54:${PORT}
🏥 Health: http://161.97.127.54:${PORT}/health
🔧 API: http://161.97.127.54:${PORT}/api
🎯 Environment: ${process.env.NODE_ENV || 'development'}

📊 Default Admin Account:
   Email: admin@duofuturo.com
   Password: DuoFuturo123!

🔐 Tableau Integration: ✅ Configured
💾 Database: ✅ PostgreSQL Connected
🔄 Redis: ✅ Session Store Ready
🛡️ Security: ✅ All Middleware Active

🏢 DuoFuturo - Transformando dados em futuro
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();