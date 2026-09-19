import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server .env or fallback to root .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import {
  User,
  Admin,
  MarketPrice,
  Scheme,
  WeatherHistory,
  Notification,
  CropDiagnosis
} from '../models/schemas.js';

const testDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krishdrishti';
  const isAtlas = uri.includes('mongodb+srv://') || uri.includes('.mongodb.net');

  console.log('\n======================================================');
  console.log('       KrishiDrishti - MongoDB Diagnostics Test       ');
  console.log('======================================================\n');
  console.log(`[TARGET URI]  : ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
  console.log(`[TYPE]        : ${isAtlas ? 'MongoDB Atlas (Cloud Cluster)' : 'Local / Custom MongoDB'}`);

  const startTime = Date.now();

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    const pingTime = Date.now() - startTime;
    console.log(`[STATUS]      : CONNECTED (Latency: ${pingTime}ms)`);
    console.log(`[HOST]        : ${conn.connection.host}`);
    console.log(`[PORT]        : ${conn.connection.port || 'Default'}`);
    console.log(`[DATABASE]    : ${conn.connection.name}`);

    // Ping Admin
    const pingResult = await conn.connection.db.admin().ping();
    console.log(`[PING RESULT] : ${JSON.stringify(pingResult)}`);

    // Check collections
    console.log('\n--- Collection Record Counts ---');
    const [
      userCount,
      adminCount,
      priceCount,
      schemeCount,
      weatherCount,
      notifCount,
      diagCount
    ] = await Promise.all([
      User.countDocuments({}),
      Admin.countDocuments({}),
      MarketPrice.countDocuments({}),
      Scheme.countDocuments({}),
      WeatherHistory.countDocuments({}),
      Notification.countDocuments({}),
      CropDiagnosis.countDocuments({})
    ]);

    const stats = [
      { Collection: 'Users (Farmers)', Count: userCount },
      { Collection: 'Admins', Count: adminCount },
      { Collection: 'Market Prices (Mandis)', Count: priceCount },
      { Collection: 'Government Schemes', Count: schemeCount },
      { Collection: 'Weather History', Count: weatherCount },
      { Collection: 'Notifications', Count: notifCount },
      { Collection: 'Crop Diagnoses', Count: diagCount }
    ];

    console.table(stats);

    const totalDocs = userCount + adminCount + priceCount + schemeCount + weatherCount + notifCount + diagCount;
    console.log(`Total Documents in Database: ${totalDocs}`);

    if (totalDocs === 0) {
      console.log('\n[TIP] Database is currently empty. Run `npm run db:seed` to populate sample data.');
    } else {
      console.log('\n[SUCCESS] Database is populated and ready for production/development usage!');
    }

    await mongoose.disconnect();
    console.log('\nDatabase connection closed gracefully.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n[CONNECTION ERROR] Failed to connect to MongoDB:');
    console.error(`Message: ${error.message}\n`);
    console.log('--- Troubleshooting Steps ---');
    console.log('1. If using MongoDB Atlas (Cloud):');
    console.log('   - Ensure your IP address is whitelisted in Atlas (Network Access -> Add 0.0.0.0/0 or Current IP).');
    console.log('   - Check your username and password in server/.env MONGODB_URI.');
    console.log('2. If using Local MongoDB:');
    console.log('   - Ensure MongoDB service is running: Open PowerShell as Admin and run:');
    console.log('     net start MongoDB');
    console.log('   - Or install it via: winget install MongoDB.Server');
    console.log('3. See MONGODB_SETUP.md for full guide.\n');
    process.exit(1);
  }
};

testDatabase();
