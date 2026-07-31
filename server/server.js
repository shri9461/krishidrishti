import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import { Admin, Notification, Scheme, MarketPrice } from './models/schemas.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import mainRoutes from './routes/mainRoutes.js';

// Load config
dotenv.config();

// Initialize App
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Attach Socket.io instance to Express App
app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Resolve dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api', mainRoutes);

// Serve React Frontend (production)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// Root Endpoint -> serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Fallback: serve frontend for any non-API route (React Router)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Endpoint not found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Socket.io Real-time Connection Handler
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Seed database on startup
const seedDatabase = async () => {
  try {
    // 1. Seed Admin
    const adminCount = await Admin.countDocuments({});
    if (adminCount === 0) {
      await Admin.create({
        name: 'System Admin',
        email: 'admin@agrismart.com',
        password: 'adminpassword',
      });
      console.log('====================================');
      console.log('[SEED] Default Admin Account Created!');
      console.log('Email: admin@agrismart.com');
      console.log('Password: adminpassword');
      console.log('====================================');
    }    // 2. Seed Market Prices
    const priceCount = await MarketPrice.countDocuments({});
    if (priceCount === 0) {
      const defaultPrices = [
        { cropName: 'Wheat (गेहूं)', market: 'Khanna', state: 'Punjab', price: 2350, unit: 'Quintal', trend: 'up' },
        { cropName: 'Wheat (गेहूं)', market: 'Karnal', state: 'Haryana', price: 2320, unit: 'Quintal', trend: 'stable' },
        { cropName: 'Wheat (गेहूं)', market: 'Hapur', state: 'Uttar Pradesh', price: 2400, unit: 'Quintal', trend: 'up' },
        { cropName: 'Paddy/Rice (धान)', market: 'Kurukshetra', state: 'Haryana', price: 2183, unit: 'Quintal', trend: 'stable' },
        { cropName: 'Paddy/Rice (धान)', market: 'Burdwan', state: 'West Bengal', price: 2200, unit: 'Quintal', trend: 'up' },
        { cropName: 'Onion (प्याज)', market: 'Lasalgaon', state: 'Maharashtra', price: 2450, unit: 'Quintal', trend: 'down' },
        { cropName: 'Onion (प्याज)', market: 'Pimpalgaon', state: 'Maharashtra', price: 2500, unit: 'Quintal', trend: 'stable' },
        { cropName: 'Onion (प्याज)', market: 'Yeshwanthpur', state: 'Karnataka', price: 2600, unit: 'Quintal', trend: 'up' },
        { cropName: 'Tomato (टमाटर)', market: 'Kolar', state: 'Karnataka', price: 3200, unit: 'Quintal', trend: 'down' },
        { cropName: 'Tomato (टमाटर)', market: 'Nashik', state: 'Maharashtra', price: 2800, unit: 'Quintal', trend: 'down' },
        { cropName: 'Cotton (कपास)', market: 'Rajkot', state: 'Gujarat', price: 7100, unit: 'Quintal', trend: 'up' },
        { cropName: 'Cotton (कपास)', market: 'Abohar', state: 'Punjab', price: 6900, unit: 'Quintal', trend: 'stable' },
        { cropName: 'Potato (आलू)', market: 'Agra', state: 'Uttar Pradesh', price: 1650, unit: 'Quintal', trend: 'stable' },
        { cropName: 'Potato (आलू)', market: 'Hooghly', state: 'West Bengal', price: 1800, unit: 'Quintal', trend: 'up' },
        { cropName: 'Mustard (सरसों)', market: 'Jaipur', state: 'Rajasthan', price: 5450, unit: 'Quintal', trend: 'up' },
        { cropName: 'Mustard (सरसों)', market: 'Bhiwani', state: 'Haryana', price: 5300, unit: 'Quintal', trend: 'stable' },
        { cropName: 'Soyabean (सोयाबीन)', market: 'Indore', state: 'Madhya Pradesh', price: 4600, unit: 'Quintal', trend: 'down' },
        { cropName: 'Soyabean (सोयाबीन)', market: 'Latur', state: 'Maharashtra', price: 4750, unit: 'Quintal', trend: 'stable' }
      ];
      await MarketPrice.insertMany(defaultPrices);
      console.log('[SEED] Market Prices Seeded Successfully!');
    }
    // 3. Seed Notifications
    const notifCount = await Notification.countDocuments({});
    if (notifCount === 0) {
      const defaultNotifications = [
        { type: 'weather', title: 'Extreme Weather Alert', message: 'Heavy rain forecast for northern region in the next 24 hours. Secure harvested crops.', isRead: false },
        { type: 'scheme', title: 'New Government Subsidy', message: 'Register for solar pump subsidy under PM-KUSUM scheme. Portal open till next month.', isRead: false },
        { type: 'price', title: 'Market Advisory', message: 'Wheat prices showing strong upwards momentum due to supply constraints.', isRead: false }
      ];
      await Notification.insertMany(defaultNotifications);
      console.log('[SEED] Notifications Seeded Successfully!');
    }

    // 4. Seed Government Schemes
    const schemeCount = await Scheme.countDocuments({});
    if (schemeCount === 0) {
      const defaultSchemes = [
        {
          title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
          description: 'An initiative by the Government of India that provides up to ₹6,000 per year in minimum income support to all small and marginal farmers.',
          eligibility: 'All landholding farmers families who have cultivable landholding in their names.',
          benefits: 'Direct cash transfer of ₹6,000 per year in three equal installments of ₹2,000 directly into bank accounts.',
          applyLink: 'https://pmkisan.gov.in/',
          category: 'Financial Support'
        },
        {
          title: 'PM-KUSUM (Kisan Urja Suraksha evam Utthaan Mahabhiyan)',
          description: 'A scheme aimed at providing clean energy to farmers by subsidizing the installation of solar agricultural pumps and solarizing grid-connected agricultural pumps.',
          eligibility: 'Individual farmers, cooperatives, Panchayats, and Farmer Producer Organizations (FPOs).',
          benefits: 'Up to 60% subsidy on solar pump installation, with an additional 30% bank loan option, leaving only 10% for the farmer to pay.',
          applyLink: 'https://pmkusum.mnre.gov.in/',
          category: 'Irrigation & Power'
        },
        {
          title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
          description: 'A government-sponsored crop insurance scheme that integrates multiple stakeholders to protect farmers against crop losses from natural calamities, pests, or diseases.',
          eligibility: 'All farmers growing notified crops in notified areas, including sharecroppers and tenant farmers.',
          benefits: 'Financial support for crop losses. Uniform low premium rates of 2% for Kharif, 1.5% for Rabi, and 5% for commercial/horticultural crops.',
          applyLink: 'https://pmfby.gov.in/',
          category: 'Crop Insurance'
        },
        {
          title: 'Soil Health Card Scheme (SHC)',
          description: 'A scheme to assist state governments in issuing soil health cards to all farmers in the country, detailing the nutrient status of their soil.',
          eligibility: 'All farmers owning agricultural land in India.',
          benefits: 'Free soil testing and customized recommendations for organic, bio-fertilizer, and chemical fertilizer usage to optimize crop yield.',
          applyLink: 'https://soilhealth.dac.gov.in/',
          category: 'Subsidies & Inputs'
        },
        {
          title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
          description: 'A sub-component of Soil Health Management under National Mission of Sustainable Agriculture (NMSA) that promotes organic farming through cluster approach.',
          eligibility: 'Farmers willing to form organic clusters of minimum 20 hectares (approx 50 acres).',
          benefits: 'Financial assistance of ₹50,000 per hectare for 3 years, with 62% of the amount provided as subsidy for organic inputs.',
          applyLink: 'https://dapgh.dac.gov.in/',
          category: 'Subsidies & Inputs'
        }
      ];
      await Scheme.insertMany(defaultSchemes);
      console.log('[SEED] Government Schemes Seeded Successfully!');
    }
  } catch (error) {
    console.error('Database seeding failed:', error.message);
  }
};

// Start Server
const PORT = process.env.PORT || 5000;
connectDB().then(async () => {
  await seedDatabase();
  server.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
  });
});
