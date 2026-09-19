import mongoose from 'mongoose';
import { seedData } from './seedDb.js';

console.log('[RESET] Initiating full database reset (wipe & reseed)...');

seedData({ clean: true })
  .then(async () => {
    await mongoose.disconnect();
    console.log('[RESET] Database reset and reseed complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[RESET FAILED]:', err.message);
    process.exit(1);
  });
