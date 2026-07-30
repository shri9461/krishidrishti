import { User, Admin, WeatherHistory, MarketPrice, Notification, Scheme } from '../models/schemas.js';

// =========================================================================
// 1. DASHBOARD & WEATHER
// =========================================================================

export const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    const userState = req.user.state || 'Maharashtra';

    let localPrices = await MarketPrice.find({ state: new RegExp(userState, 'i') }).sort({ updatedAt: -1 }).limit(4);
    if (localPrices.length === 0) {
      localPrices = await MarketPrice.find({}).sort({ updatedAt: -1 }).limit(4);
    }

    const unreadNotifications = await Notification.countDocuments({
      $or: [{ user: userId }, { user: null }],
      isRead: false,
    });

    res.json({
      success: true,
      data: {
        localPrices,
        unreadNotifications,
        weatherSummary: { temp: 28, condition: 'Sunny with partial clouds', humidity: 62, recommendation: 'Ideal time for field operations. Keep crops hydrated.' },
        farmerName: req.user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWeather = async (req, res) => {
  const location = req.query.location || req.user.location || req.user.state || 'Maharashtra';
  try {
    const randomTemp = Math.floor(22 + Math.random() * 12);
    const randomHumidity = Math.floor(50 + Math.random() * 40);
    const randomWind = parseFloat((5 + Math.random() * 15).toFixed(1));
    const rainForecast = randomHumidity > 75 ? 'Heavy Rain Alert' : 'Clear Skies';

    const recommendations = randomHumidity > 75
      ? ['High humidity. Postpone foliar sprays.', 'Ensure proper field drainage.']
      : ['Sunny weather. Perfect for agricultural operations.', 'Schedule standard drip irrigation.'];

    const weatherData = { location, temperature: randomTemp, humidity: randomHumidity, rainForecast, windSpeed: randomWind, recommendations, date: new Date() };
    await WeatherHistory.create(weatherData);

    res.json({ success: true, data: weatherData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 2. MARKET PRICE TICKER
// =========================================================================

export const getMarketPrices = async (req, res) => {
  const { search, state } = req.query;
  try {
    const query = {};
    if (search) query.cropName = { $regex: search, $options: 'i' };
    if (state) query.state = state;

    const prices = await MarketPrice.find(query).sort({ cropName: 1 });
    const states = await MarketPrice.distinct('state');
    res.json({ success: true, data: { prices, states } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 3. NOTIFICATIONS
// =========================================================================

export const getNotifications = async (req, res) => {
  try {
    const list = await Notification.find({ $or: [{ user: req.user._id }, { user: null }] }).sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (notif) {
      notif.isRead = true;
      await notif.save();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { $or: [{ user: req.user._id }, { user: null }], isRead: false },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 4. ADMIN CONTROL PANEL
// =========================================================================

export const getAdminStats = async (req, res) => {
  try {
    const totalFarmers = await User.countDocuments({});
    res.json({ success: true, data: { totalFarmers } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const farmers = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: farmers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const broadcastNotification = async (req, res) => {
  try {
    const notif = await Notification.create(req.body);
    const io = req.app.get('socketio');
    if (io) io.emit('new_notification', notif);
    res.status(201).json({ success: true, data: notif });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSchemes = async (req, res) => {
  const { search, category } = req.query;
  try {
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'all') {
      query.category = category;
    }

    const schemes = await Scheme.find(query).sort({ title: 1 });
    res.json({ success: true, data: schemes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
