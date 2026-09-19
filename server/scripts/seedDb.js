import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
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

export const seedData = async (options = { clean: false }) => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krishdrishti';

  console.log('\n======================================================');
  console.log('       KrishiDrishti - Database Seeder Utility        ');
  console.log('======================================================\n');
  console.log(`[TARGET URI] : ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  }

  if (options.clean) {
    console.log('\n[CLEANING] Dropping existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Admin.deleteMany({}),
      MarketPrice.deleteMany({}),
      Scheme.deleteMany({}),
      WeatherHistory.deleteMany({}),
      Notification.deleteMany({}),
      CropDiagnosis.deleteMany({})
    ]);
    console.log('[CLEANING] All collections cleared successfully.');
  }

  // 1. Seed Admin
  console.log('\n--> Seeding Admin Account...');
  const existingAdmin = await Admin.findOne({ email: 'admin@agrismart.com' });
  if (!existingAdmin) {
    await Admin.create({
      name: 'System Admin',
      email: 'admin@agrismart.com',
      password: 'adminpassword',
      role: 'admin',
    });
    console.log('    ✓ Admin created: admin@agrismart.com / adminpassword');
  } else {
    console.log('    - Admin already exists, skipping.');
  }

  // 2. Seed Sample Farmers
  console.log('\n--> Seeding Sample Farmers...');
  const demoFarmers = [
    {
      name: 'Ramesh Patil',
      email: 'ramesh.patil@example.com',
      password: 'farmerpassword123',
      phone: '+91 98220 12345',
      location: 'Lasalgaon, Nashik',
      state: 'Maharashtra',
      preferredLanguage: 'hi',
    },
    {
      name: 'Gurpreet Singh',
      email: 'gurpreet.singh@example.com',
      password: 'farmerpassword123',
      phone: '+91 98140 54321',
      location: 'Khanna, Ludhiana',
      state: 'Punjab',
      preferredLanguage: 'en',
    },
    {
      name: 'Suresh Kumar',
      email: 'suresh.kumar@example.com',
      password: 'farmerpassword123',
      phone: '+91 98960 67890',
      location: 'Karnal',
      state: 'Haryana',
      preferredLanguage: 'hi',
    }
  ];

  let sampleFarmerUser = null;
  for (const farmer of demoFarmers) {
    const exists = await User.findOne({ email: farmer.email });
    if (!exists) {
      const created = await User.create(farmer);
      if (!sampleFarmerUser) sampleFarmerUser = created;
      console.log(`    ✓ Farmer created: ${farmer.name} (${farmer.email})`);
    } else {
      if (!sampleFarmerUser) sampleFarmerUser = exists;
      console.log(`    - Farmer ${farmer.email} already exists, skipping.`);
    }
  }

  // 3. Seed Market Mandi Prices
  console.log('\n--> Seeding Mandi Market Prices...');
  const marketPrices = [
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
    { cropName: 'Soyabean (सोयाबीन)', market: 'Latur', state: 'Maharashtra', price: 4750, unit: 'Quintal', trend: 'stable' },
    { cropName: 'Gram/Chana (चना)', market: 'Bikaner', state: 'Rajasthan', price: 5850, unit: 'Quintal', trend: 'up' },
    { cropName: 'Maize (मक्का)', market: 'Davangere', state: 'Karnataka', price: 2150, unit: 'Quintal', trend: 'stable' },
  ];

  const priceCount = await MarketPrice.countDocuments({});
  if (priceCount === 0 || options.clean) {
    await MarketPrice.insertMany(marketPrices);
    console.log(`    ✓ Inserted ${marketPrices.length} mandi market price records.`);
  } else {
    console.log(`    - Found ${priceCount} existing price records, skipping.`);
  }

  // 4. Seed Government Schemes
  console.log('\n--> Seeding Government Welfare Schemes...');
  const schemes = [
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
      description: 'A comprehensive crop insurance scheme protecting farmers against production risks from natural calamities, pests, and unseasonal weather.',
      eligibility: 'All farmers growing notified crops in notified areas, including sharecroppers and tenant farmers.',
      benefits: 'Full financial indemnity against crop loss. Uniform low premium rates of 2% for Kharif, 1.5% for Rabi, and 5% for commercial/horticultural crops.',
      applyLink: 'https://pmfby.gov.in/',
      category: 'Crop Insurance'
    },
    {
      title: 'Soil Health Card Scheme (SHC)',
      description: 'Assists farmers in receiving tailored Soil Health Cards detailing 12 critical chemical and physical nutrient parameters of their farmland.',
      eligibility: 'All farmers owning agricultural land in India.',
      benefits: 'Free soil testing and customized dosage recommendations for organic, bio-fertilizer, and chemical fertilizers to maximize crop output and reduce waste.',
      applyLink: 'https://soilhealth.dac.gov.in/',
      category: 'Subsidies & Inputs'
    },
    {
      title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
      description: 'Promotes commercial organic agriculture through cluster formation and Participatory Guarantee System (PGS) certification.',
      eligibility: 'Farmers willing to form organic farming clusters of minimum 20 hectares (approx 50 acres).',
      benefits: 'Financial assistance of ₹50,000 per hectare for 3 years, with 62% provided directly as subsidy for organic inputs, composting, and seeds.',
      applyLink: 'https://dapgh.dac.gov.in/',
      category: 'Subsidies & Inputs'
    },
    {
      title: 'Kisan Credit Card (KCC) Scheme',
      description: 'Provides timely and adequate credit to farmers for their cultivation and other needs including purchase of inputs, machinery, and post-harvest expenses.',
      eligibility: 'Small farmers, marginal farmers, sharecroppers, tenant farmers, and self-help groups.',
      benefits: 'Credit limit up to ₹3,00,000 at a concessional interest rate of 4% per annum upon timely repayment.',
      applyLink: 'https://www.myscheme.gov.in/schemes/kcc',
      category: 'Financial Support'
    },
    {
      title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
      description: 'Promotes modern farm machinery and establishment of Custom Hiring Centres (CHCs) to offset high machinery capital costs.',
      eligibility: 'Individual farmers, women farmers, SC/ST farmers, and agricultural cooperatives.',
      benefits: 'Subsidies ranging from 40% to 50% on tractors, power tillers, seeders, and harvesters.',
      applyLink: 'https://agrimachinery.nic.in/',
      category: 'Subsidies & Inputs'
    }
  ];

  const schemeCount = await Scheme.countDocuments({});
  if (schemeCount === 0 || options.clean) {
    await Scheme.insertMany(schemes);
    console.log(`    ✓ Inserted ${schemes.length} welfare schemes.`);
  } else {
    console.log(`    - Found ${schemeCount} existing schemes, skipping.`);
  }

  // 5. Seed Real-time Notifications & Advisories
  console.log('\n--> Seeding Notification Advisories...');
  const notifications = [
    {
      type: 'weather',
      title: 'Heavy Rainfall Warning',
      message: 'IMD predicts active monsoon squalls in Western Maharashtra. Clear field trenches and secure harvested onions.',
      isRead: false
    },
    {
      type: 'scheme',
      title: 'PM-KUSUM Phase 3 Applications Open',
      message: 'State renewable energy portal is accepting solar pump applications with 60% government subsidy until the end of the month.',
      isRead: false
    },
    {
      type: 'price',
      title: 'Mandi Bullish Alert: Wheat & Mustard',
      message: 'Wheat and Mustard spot prices in Khanna and Jaipur mandis rose by ₹50-₹80 per quintal due to strong procurement demand.',
      isRead: false
    },
    {
      type: 'general',
      title: 'Soil Testing Camp Notice',
      message: 'Block Agriculture Department will host free Soil Health Card testing camps at the local Panchayat Bhawan this Thursday.',
      isRead: false
    }
  ];

  const notifCount = await Notification.countDocuments({});
  if (notifCount === 0 || options.clean) {
    await Notification.insertMany(notifications);
    console.log(`    ✓ Inserted ${notifications.length} advisories & notifications.`);
  } else {
    console.log(`    - Found ${notifCount} existing notifications, skipping.`);
  }

  // 6. Seed Weather History
  console.log('\n--> Seeding Weather Telemetry...');
  const weatherRecords = [
    {
      location: 'Lasalgaon',
      temperature: 29,
      humidity: 65,
      rainForecast: 'Partly Cloudy',
      windSpeed: 12.4,
      recommendations: ['Maintain standard drip irrigation schedule.', 'Safe window for pesticide spraying before 10 AM.']
    },
    {
      location: 'Khanna',
      temperature: 32,
      humidity: 58,
      rainForecast: 'Clear Skies',
      windSpeed: 9.8,
      recommendations: ['Ideal temperature for crop weeding.', 'Ensure sufficient moisture in paddy nurseries.']
    },
    {
      location: 'Karnal',
      temperature: 31,
      humidity: 62,
      rainForecast: 'Clear Skies',
      windSpeed: 11.0,
      recommendations: ['Inspect lower leaf canopy for aphid infestations.', 'Apply organic potash supplement.']
    }
  ];

  const weatherCount = await WeatherHistory.countDocuments({});
  if (weatherCount === 0 || options.clean) {
    await WeatherHistory.insertMany(weatherRecords);
    console.log(`    ✓ Inserted ${weatherRecords.length} weather history records.`);
  } else {
    console.log(`    - Found ${weatherCount} existing weather records, skipping.`);
  }

  // 7. Seed Sample Crop Diagnosis (if sample user exists)
  if (sampleFarmerUser) {
    console.log('\n--> Seeding Sample Crop Disease Diagnoses...');
    const sampleDiagnoses = [
      {
        user: sampleFarmerUser._id,
        cropName: 'Tomato',
        diseaseName: 'Tomato Late Blight',
        confidence: 0.94,
        imageUrl: '/uploads/sample_tomato_blight.jpg',
        symptoms: 'Large, irregular water-soaked spots on leaves that turn dark brown with fuzzy white underside growth.',
        treatment: 'Immediately remove infected leaves. Spray copper-based fungicides or biological Bacillus subtilis.',
        prevention: 'Maintain spacing for air circulation, rotate crops, and avoid evening overhead sprinkler irrigation.'
      },
      {
        user: sampleFarmerUser._id,
        cropName: 'Potato',
        diseaseName: 'Potato Early Blight',
        confidence: 0.91,
        imageUrl: '/uploads/sample_potato_blight.jpg',
        symptoms: 'Concentric dark target-board rings on older foliage with yellowing margins.',
        treatment: 'Apply neem oil spray or recommended fungicides like Mancozeb.',
        prevention: 'Ensure balanced nitrogen fertility and destroy post-harvest debris.'
      }
    ];

    const diagCount = await CropDiagnosis.countDocuments({});
    if (diagCount === 0 || options.clean) {
      await CropDiagnosis.insertMany(sampleDiagnoses);
      console.log(`    ✓ Inserted ${sampleDiagnoses.length} crop diagnosis scan records.`);
    } else {
      console.log(`    - Found ${diagCount} existing diagnoses, skipping.`);
    }
  }

  console.log('\n======================================================');
  console.log('         DATABASE SEEDING COMPLETED SUCCESSFULLY!      ');
  console.log('======================================================\n');
};

// If run directly from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const isClean = process.argv.includes('--clean') || process.argv.includes('-c');
  seedData({ clean: isClean })
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n[SEEDING FAILED]:', err.message);
      process.exit(1);
    });
}
