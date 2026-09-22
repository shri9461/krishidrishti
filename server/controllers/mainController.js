import { User, Admin, WeatherHistory, MarketPrice, Notification, Scheme } from '../models/schemas.js';
import { fetchLiveWeather, fetchLiveMandiPrices, fetchLiveSchemes } from '../utils/externalApis.js';

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

/**
 * GET /api/weather?location=<city>
 *
 * Priority:
 *  1. Live data from Open-Meteo (free, no key required)
 *  2. Last cached record in WeatherHistory for that location
 *  3. Synthetic random data (legacy last-resort)
 */
export const getWeather = async (req, res) => {
  const location = req.query.location || req.user.location || req.user.state || 'Maharashtra';
  try {
    // ── Attempt 1: Live Open-Meteo ──────────────────────────────────────
    try {
      const liveData = await fetchLiveWeather(location);
      // Persist to history so the fallback always has something recent
      await WeatherHistory.create(liveData);
      console.log(`[Weather] Live data fetched for "${liveData.location}" via Open-Meteo.`);
      return res.json({ success: true, source: 'live', data: liveData });
    } catch (liveErr) {
      console.warn(`[Weather] Live fetch failed for "${location}": ${liveErr.message}. Trying DB cache.`);
    }

    // ── Attempt 2: Last DB cache for this location ──────────────────────
    const cached = await WeatherHistory.findOne(
      { location: new RegExp(location, 'i') }
    ).sort({ createdAt: -1 });

    if (cached) {
      console.log(`[Weather] Serving cached data for "${location}" from WeatherHistory.`);
      return res.json({
        success: true,
        source: 'cache',
        data: {
          location: cached.location,
          temperature: cached.temperature,
          humidity: cached.humidity,
          windSpeed: cached.windSpeed,
          rainForecast: cached.rainForecast,
          recommendations: cached.recommendations,
          date: cached.createdAt,
        },
      });
    }

    // ── Attempt 3: Legacy synthetic fallback ────────────────────────────
    console.warn(`[Weather] No cache found for "${location}". Using synthetic data.`);
    const randomTemp     = Math.floor(22 + Math.random() * 12);
    const randomHumidity = Math.floor(50 + Math.random() * 40);
    const randomWind     = parseFloat((5 + Math.random() * 15).toFixed(1));
    const rainForecast   = randomHumidity > 75 ? 'Heavy Rain Alert' : 'Clear Skies';
    const recommendations = randomHumidity > 75
      ? ['High humidity. Postpone foliar sprays.', 'Ensure proper field drainage.']
      : ['Sunny weather. Perfect for agricultural operations.', 'Schedule standard drip irrigation.'];

    const syntheticData = { location, temperature: randomTemp, humidity: randomHumidity, rainForecast, windSpeed: randomWind, recommendations, date: new Date() };
    await WeatherHistory.create(syntheticData);
    return res.json({ success: true, source: 'synthetic', data: syntheticData });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// 2. MARKET PRICE TICKER
// =========================================================================

/**
 * GET /api/market-prices?search=<crop>&state=<state>
 *
 * Priority:
 *  1. Live data from data.gov.in Agmarknet API (requires DATA_GOV_API_KEY)
 *  2. Existing records in MarketPrice collection (seeded / previously cached)
 */
export const getMarketPrices = async (req, res) => {
  const { search = '', state = '' } = req.query;
  try {
    // ── Attempt 1: Live Agmarknet via data.gov.in ───────────────────────
    try {
      const livePrices = await fetchLiveMandiPrices(search, state !== 'all' ? state : '');

      // Upsert live data into DB so DB cache is always fresh
      const bulkOps = livePrices.map(p => ({
        updateOne: {
          filter: { cropName: p.cropName, market: p.market, state: p.state },
          update: { $set: p },
          upsert: true,
        },
      }));
      if (bulkOps.length > 0) await MarketPrice.bulkWrite(bulkOps);

      const states = [...new Set(livePrices.map(p => p.state))].sort();
      console.log(`[Mandi] Live prices fetched: ${livePrices.length} records from Agmarknet.`);
      return res.json({ success: true, source: 'live', data: { prices: livePrices, states } });

    } catch (liveErr) {
      console.warn(`[Mandi] Live fetch failed: ${liveErr.message}. Falling back to DB.`);
    }

    // ── Attempt 2: DB fallback ──────────────────────────────────────────
    const query = {};
    if (search) query.cropName = { $regex: search, $options: 'i' };
    if (state && state !== 'all') query.state = state;

    const prices = await MarketPrice.find(query).sort({ cropName: 1 });
    const states = await MarketPrice.distinct('state');
    console.log(`[Mandi] Serving ${prices.length} records from DB cache.`);
    return res.json({ success: true, source: 'cache', data: { prices, states } });

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

// =========================================================================
// 5. GOVERNMENT SCHEMES
// =========================================================================

/**
 * GET /api/schemes?search=<keyword>&category=<category>
 *
 * Priority:
 *  1. Live data from data.gov.in Agriculture Schemes API (requires DATA_GOV_API_KEY)
 *  2. Existing Scheme records in MongoDB (seeded / previously cached)
 */
export const getSchemes = async (req, res) => {
  const { search = '', category = 'all' } = req.query;
  try {
    // ── Attempt 1: Live schemes via data.gov.in ─────────────────────────
    try {
      const liveSchemes = await fetchLiveSchemes(search, category);

      // Upsert live schemes so DB cache stays current
      const bulkOps = liveSchemes.map(s => ({
        updateOne: {
          filter: { title: s.title },
          update: { $set: s },
          upsert: true,
        },
      }));
      if (bulkOps.length > 0) await Scheme.bulkWrite(bulkOps);

      console.log(`[Schemes] Live schemes fetched: ${liveSchemes.length} records from data.gov.in.`);
      return res.json({ success: true, source: 'live', data: liveSchemes });

    } catch (liveErr) {
      console.warn(`[Schemes] Live fetch failed: ${liveErr.message}. Falling back to DB.`);
    }

    // ── Attempt 2: DB fallback ──────────────────────────────────────────
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'all') {
      query.category = category;
    }

    const schemes = await Scheme.find(query).sort({ title: 1 });
    console.log(`[Schemes] Serving ${schemes.length} schemes from DB cache.`);
    return res.json({ success: true, source: 'cache', data: schemes });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
