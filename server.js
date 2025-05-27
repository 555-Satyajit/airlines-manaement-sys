//server.js - OPTIMIZED VERSION
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
require('dotenv').config();
const Booking = require('./models/Booking');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const flightRoutes = require('./routes/flightRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const airportRoutes = require('./routes/airportRoutes');
const aircraftRoutes = require('./routes/aircraftRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const authMiddleware = require('./middleware/authMiddleware');

// Initialize Express app
const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// OPTIMIZED: Set up static file serving FIRST with proper caching
const staticPath = path.join(__dirname, 'public');
console.log(`📁 Serving static files from: ${staticPath}`);

// Configure static file serving with caching
app.use(express.static(staticPath, {
  // Enable caching for better performance
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '1h', // Cache for 1 day in prod, 1 hour in dev
  etag: true,
  lastModified: true,
  // Set proper headers for different file types
  setHeaders: (res, filePath) => {
    // Cache images longer
    if (filePath.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    }
    // Cache CSS/JS files
    else if (filePath.match(/\.(css|js)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
    }
    // Cache fonts
    else if (filePath.match(/\.(woff|woff2|ttf|eot)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week
    }
  }
}));

// Serve uploads with caching
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true
}));

// SIMPLIFIED: Security middleware with optimized CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://cdn.tailwindcss.com", 
        "https://cdnjs.cloudflare.com",
        "https://fonts.googleapis.com"
      ],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://cdn.tailwindcss.com", 
        "https://cdnjs.cloudflare.com"
      ],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: [
        "'self'", 
        "https://cdnjs.cloudflare.com",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com"
      ],
      connectSrc: [
        "'self'",
        "http://localhost:5000",
        "ws://localhost:5000"
      ],
      mediaSrc: [
        "'self'",
        "https://videos.pexels.com"
      ],
    }
  }
}));

// REMOVED: The problematic form handling middleware that was causing redirects

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later.' }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Logging middleware (reduced in production)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'skyline-airlines-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/skyline-airlines'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes (these should come before catch-all)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/aircraft', aircraftRoutes);
app.use('/api/admin', adminRoutes);

// Booking routes
app.post('/api/bookings', async (req, res) => {
    try {
        const bookingData = req.body;
        
        if (!bookingData.passenger || !bookingData.flightDetails) {
            return res.status(400).json({ error: 'Invalid booking data' });
        }
        
        const booking = new Booking(bookingData);
        const savedBooking = await booking.save();
        
        res.status(201).json({
            success: true,
            booking: savedBooking,
            confirmationNumber: savedBooking.confirmationNumber
        });
        
    } catch (error) {
        console.error('Booking save error:', error);
        res.status(500).json({ 
            error: 'Failed to save booking',
            message: error.message 
        });
    }
});

app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings: bookings
        });
        
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch bookings',
            message: error.message 
        });
    }
});

app.patch('/api/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const booking = await Booking.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.status(200).json({
            success: true,
            booking: booking
        });
        
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ 
            error: 'Failed to update booking',
            message: error.message 
        });
    }
});

// SIMPLIFIED: Specific HTML routes (optional - static middleware should handle these)
app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(staticPath, 'login.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(staticPath, 'dashboard.html'));
});

// REMOVED: The problematic catch-all route that was causing issues

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/skyline-airlines',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  const server = app.listen(PORT, () => {
    console.log(`
🛫 SkyLine Airlines Server Running!
🌐 Environment: ${process.env.NODE_ENV || 'development'}
🚀 Port: ${PORT}
📊 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Local MongoDB'}
📁 Static files: ${staticPath}
⏰ Started at: ${new Date().toLocaleString()}
    `);
  });

  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    switch (error.code) {
      case 'EACCES':
        console.error(`Port ${PORT} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;