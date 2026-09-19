import mongoose from 'mongoose';

let memoryServerInstance = null;

/**
 * Connects to MongoDB database with connection monitoring and clear error diagnostics.
 */
const connectDB = async () => {
  const targetUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krishdrishti';
  const isAtlas = targetUri.includes('mongodb+srv://') || targetUri.includes('.mongodb.net');
  const useMemoryDb = process.env.USE_MEMORY_DB === 'true';

  // If explicitly requested to use in-memory database
  if (useMemoryDb) {
    try {
      console.log('[MongoDB] Starting in-memory development database (USE_MEMORY_DB=true)...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create({
        instance: { dbName: 'krishdrishti' },
        spawn: { timeout: 60000 },
      });
      const memUri = memoryServerInstance.getUri();
      const memConn = await mongoose.connect(memUri);

      console.log('\n======================================================');
      console.log('       [NOTICE] RUNNING IN-MEMORY MONGODB INSTANCE      ');
      console.log('======================================================');
      console.log(`URI: ${memUri}`);
      console.log('Note: In-memory data resets when the process ends.');
      console.log('To persist data permanently, add your Atlas or local MongoDB URI to server/.env');
      console.log('======================================================\n');
      return memConn;
    } catch (memError) {
      console.error('[MongoDB] In-memory database failed to launch:', memError.message);
    }
  }

  // Connection event listeners
  mongoose.connection.on('connected', () => {
    console.log(`[MongoDB] Connected to database: ${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[MongoDB] Runtime Connection Error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Connection lost. Disconnected from database.');
  });

  // Standard connection
  try {
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Successfully connected to ${isAtlas ? 'MongoDB Atlas (Cloud)' : 'MongoDB Server'} on host: ${conn.connection.host}`);
    return conn;
  } catch (primaryError) {
    console.error('\n======================================================');
    console.error('           DATABASE CONNECTION FAILED                 ');
    console.error('======================================================');
    console.error(`Target URI : ${targetUri}`);
    console.error(`Error      : ${primaryError.message}\n`);
    console.error('HOW TO CONNECT YOUR DATABASE:');
    console.error('------------------------------------------------------');
    console.error('1. RECOMMENDED: Use Free MongoDB Atlas (Cloud)');
    console.error('   - Create a free cluster at: https://www.mongodb.com/atlas/database');
    console.error('   - In Network Access, allow IP 0.0.0.0/0');
    console.error('   - Copy your connection string into server/.env:');
    console.error('     MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/krishdrishti');
    console.error('');
    console.error('2. OR: Run Local MongoDB Community Server:');
    console.error('   - Open PowerShell as Admin and start service:');
    console.error('     net start MongoDB');
    console.error('   - Or install via:');
    console.error('     winget install MongoDB.Server');
    console.error('');
    console.error('3. Full guide: See MONGODB_SETUP.md');
    console.error('======================================================\n');
    process.exit(1);
  }
};

/**
 * Disconnects from MongoDB and stops in-memory server if running.
 */
export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (memoryServerInstance) {
      await memoryServerInstance.stop();
      memoryServerInstance = null;
    }
    console.log('[MongoDB] Disconnected successfully.');
  } catch (error) {
    console.error('[MongoDB] Error during disconnect:', error.message);
  }
};

export const isDatabaseConnected = () => {
  return mongoose.connection.readyState === 1;
};

export default connectDB;
