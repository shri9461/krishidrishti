import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ==========================================
// 1. USER SCHEMA (Farmer)
// ==========================================
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'] },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Valid email required'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6 },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    state: { type: String, default: 'Maharashtra' },
    preferredLanguage: { type: String, enum: ['en', 'hi'], default: 'en' },
    resetOTP: { type: String, default: null },
    resetOTPExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ state: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);

// ==========================================
// 2. ADMIN SCHEMA
// ==========================================
const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const Admin = mongoose.model('Admin', adminSchema);

// ==========================================
// 3. WEATHER HISTORY SCHEMA
// ==========================================
const weatherHistorySchema = new mongoose.Schema(
  {
    location: { type: String, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    rainForecast: { type: String, default: '' },
    windSpeed: { type: Number, required: true },
    recommendations: { type: [String], default: [] },
  },
  { timestamps: true }
);

weatherHistorySchema.index({ location: 1, createdAt: -1 });

export const WeatherHistory = mongoose.model('WeatherHistory', weatherHistorySchema);

// ==========================================
// 4. MARKET PRICE SCHEMA
// ==========================================
const marketPriceSchema = new mongoose.Schema(
  {
    cropName: { type: String, required: true },
    market: { type: String, required: true },
    state: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, default: 'Quintal' },
    trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
  },
  { timestamps: true }
);

marketPriceSchema.index({ cropName: 1, state: 1 });
marketPriceSchema.index({ state: 1 });
marketPriceSchema.index({ market: 1 });

export const MarketPrice = mongoose.model('MarketPrice', marketPriceSchema);

// ==========================================
// 5. NOTIFICATION SCHEMA
// ==========================================
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = Global broadcast
    type: { type: String, enum: ['weather', 'scheme', 'price', 'general'], default: 'general' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);

// ==========================================
// 6. GOVERNMENT SCHEME SCHEMA
// ==========================================
const schemeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    eligibility: { type: String, required: true },
    benefits: { type: String, required: true },
    applyLink: { type: String, default: '' },
    category: { type: String, enum: ['Financial Support', 'Crop Insurance', 'Irrigation & Power', 'Subsidies & Inputs'], required: true },
  },
  { timestamps: true }
);

schemeSchema.index({ title: 'text', description: 'text', category: 'text' });
schemeSchema.index({ category: 1 });

export const Scheme = mongoose.model('Scheme', schemeSchema);

// ==========================================
// 7. CROP DIAGNOSIS / LEAF SCAN SCHEMA
// ==========================================
const cropDiagnosisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cropName: { type: String, required: true },
    diseaseName: { type: String, required: true },
    confidence: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    symptoms: { type: String, default: '' },
    treatment: { type: String, default: '' },
    prevention: { type: String, default: '' },
  },
  { timestamps: true }
);

cropDiagnosisSchema.index({ user: 1, createdAt: -1 });
cropDiagnosisSchema.index({ cropName: 1 });

export const CropDiagnosis = mongoose.model('CropDiagnosis', cropDiagnosisSchema);

