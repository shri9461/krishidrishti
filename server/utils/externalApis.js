/**
 * externalApis.js
 * -------------------------------------------------------
 * Encapsulates all real-time external API calls:
 *  1. OpenWeatherMap — weather (primary, keyed via OPENWEATHER_API_KEY)
 *     Open-Meteo     — weather (free fallback, no key required)
 *  2. data.gov.in   — Agmarknet mandi prices
 *  3. data.gov.in   — Agriculture / government schemes
 *
 * Every function throws on failure so the controller can
 * catch and fall back to the MongoDB cache gracefully.
 */

const DATA_GOV_KEY    = () => process.env.DATA_GOV_API_KEY    || '';
const OPENWEATHER_KEY = () => process.env.OPENWEATHER_API_KEY || '';

// ─────────────────────────────────────────────────────────
// 1. WEATHER
//    Primary  : OpenWeatherMap  (https://openweathermap.org)
//    Fallback : Open-Meteo      (free, no key needed)
// ─────────────────────────────────────────────────────────

/**
 * Map OpenWeatherMap condition ids / main strings to app-friendly labels.
 */
function owmConditionToLabel(weatherMain = '', description = '') {
  const main = weatherMain.toLowerCase();
  if (main === 'thunderstorm') return 'Thunderstorm';
  if (main === 'drizzle')      return 'Light Drizzle';
  if (main === 'rain')         return description.includes('heavy') ? 'Heavy Rain Alert' : 'Moderate Rain';
  if (main === 'snow')         return 'Snowfall';
  if (main === 'mist' || main === 'fog' || main === 'haze') return 'Foggy / Hazy';
  if (main === 'smoke' || main === 'dust' || main === 'sand') return 'Poor Visibility';
  if (main === 'clouds')       return description.includes('few') ? 'Mainly Clear' : 'Partly Cloudy';
  return 'Clear Skies';
}

/**
 * Map Open-Meteo WMO codes to human-readable strings.
 * https://open-meteo.com/en/docs#weathervariables
 */
const WMO_CODE_MAP = {
  0:  'Clear Skies',   1:  'Mainly Clear',     2:  'Partly Cloudy',
  3:  'Overcast',      45: 'Foggy',             48: 'Depositing Rime Fog',
  51: 'Light Drizzle', 53: 'Moderate Drizzle',  55: 'Dense Drizzle',
  61: 'Slight Rain',   63: 'Moderate Rain',     65: 'Heavy Rain Alert',
  71: 'Slight Snowfall', 73: 'Moderate Snowfall', 75: 'Heavy Snowfall',
  80: 'Slight Rain Showers', 81: 'Moderate Rain Showers', 82: 'Violent Rain Showers',
  95: 'Thunderstorm',  96: 'Thunderstorm with Hail', 99: 'Thunderstorm with Heavy Hail',
};

/**
 * Build farming recommendations based on live conditions.
 */
function buildRecommendations(temp, humidity, rainForecast) {
  const recs = [];
  const rain = rainForecast.toLowerCase();
  if (humidity > 75 || rain.includes('rain') || rain.includes('storm') || rain.includes('drizzle')) {
    recs.push('High humidity detected. Postpone foliar sprays and pesticide application.');
    recs.push('Ensure proper field drainage to avoid waterlogging in low-lying areas.');
    recs.push('Secure stored harvests and cover open crop stockpiles.');
  } else if (temp > 35) {
    recs.push('Extreme heat advisory. Schedule irrigation early morning (before 8 AM) or late evening.');
    recs.push('Watch for wilting symptoms — provide adequate soil moisture to prevent heat stress.');
  } else if (humidity < 40) {
    recs.push('Low humidity. Increase drip irrigation frequency for moisture-sensitive crops.');
    recs.push('Ideal dry conditions for harvesting operations and threshing activities.');
  } else {
    recs.push('Sunny weather. Ideal conditions for standard agricultural field operations.');
    recs.push('Schedule drip or furrow irrigation as per your normal crop water requirement.');
  }
  if (temp >= 20 && temp <= 30 && humidity >= 50 && humidity <= 70) {
    recs.push('Optimal temperature and humidity range — good window for transplanting seedlings.');
  }
  return recs;
}

/**
 * PRIMARY: Fetch weather from OpenWeatherMap using the configured API key.
 * Uses metric units (°C, km/h).
 *
 * @param {string} locationName
 * @returns {{ location, temperature, humidity, windSpeed, rainForecast, recommendations, date }}
 */
async function fetchWeatherFromOWM(locationName) {
  const key = OPENWEATHER_KEY();
  if (!key) throw new Error('OPENWEATHER_API_KEY not configured.');

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(locationName)}&appid=${key}&units=metric`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });

  if (res.status === 404) throw new Error(`City not found on OpenWeatherMap: "${locationName}"`);
  if (res.status === 401) throw new Error('OpenWeatherMap: invalid API key.');
  if (!res.ok)            throw new Error(`OpenWeatherMap API error: ${res.status}`);

  const d = await res.json();
  const temperature  = Math.round(d.main.temp);
  const humidity     = Math.round(d.main.humidity);
  const windSpeed    = parseFloat((d.wind.speed * 3.6).toFixed(1)); // m/s → km/h
  const weatherMain  = d.weather?.[0]?.main        || 'Clear';
  const description  = d.weather?.[0]?.description || '';
  const rainForecast = owmConditionToLabel(weatherMain, description);
  const location     = `${d.name}, ${d.sys?.country || ''}`.trim().replace(/,$/, '');

  return {
    location,
    temperature,
    humidity,
    windSpeed,
    rainForecast,
    recommendations: buildRecommendations(temperature, humidity, rainForecast),
    date: new Date(),
  };
}

/**
 * FALLBACK: Fetch weather from Open-Meteo (free, no key needed).
 *
 * @param {string} locationName
 * @returns {{ location, temperature, humidity, windSpeed, rainForecast, recommendations, date }}
 */
async function fetchWeatherFromOpenMeteo(locationName) {
  // Geocode
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationName)}&count=1&language=en&format=json`
  );
  if (!geoRes.ok) throw new Error(`Open-Meteo geocoding error: ${geoRes.status}`);
  const geoData = await geoRes.json();
  if (!geoData.results?.length) throw new Error(`Location not found via Open-Meteo: "${locationName}"`);

  const { latitude, longitude, name, admin1 } = geoData.results[0];
  const location = admin1 ? `${name}, ${admin1}` : name;

  // Forecast
  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=Asia%2FKolkata`
  );
  if (!weatherRes.ok) throw new Error(`Open-Meteo forecast error: ${weatherRes.status}`);
  const weatherData = await weatherRes.json();

  const c = weatherData.current;
  const temperature  = Math.round(c.temperature_2m);
  const humidity     = Math.round(c.relative_humidity_2m);
  const windSpeed    = parseFloat(c.wind_speed_10m.toFixed(1));
  const rainForecast = WMO_CODE_MAP[c.weather_code] || 'Clear Skies';

  return {
    location,
    temperature,
    humidity,
    windSpeed,
    rainForecast,
    recommendations: buildRecommendations(temperature, humidity, rainForecast),
    date: new Date(),
  };
}

/**
 * Public entry point: tries OpenWeatherMap first, falls back to Open-Meteo.
 *
 * @param {string} locationName  e.g. "Nashik", "Khanna"
 * @returns {{ location, temperature, humidity, windSpeed, rainForecast, recommendations, date }}
 */
export async function fetchLiveWeather(locationName) {
  // Primary: OpenWeatherMap (uses OPENWEATHER_API_KEY)
  try {
    const data = await fetchWeatherFromOWM(locationName);
    console.log(`[Weather] OpenWeatherMap OK for "${locationName}".`);
    return data;
  } catch (owmErr) {
    console.warn(`[Weather] OpenWeatherMap failed (${owmErr.message}). Trying Open-Meteo fallback.`);
  }

  // Fallback: Open-Meteo (free, no key)
  const data = await fetchWeatherFromOpenMeteo(locationName);
  console.log(`[Weather] Open-Meteo fallback OK for "${locationName}".`);
  return data;
}

// ─────────────────────────────────────────────────────────
// 2. MANDI PRICES  (data.gov.in — Agmarknet daily arrivals)
//    Resource: 9ef84268-d588-465a-a308-a864a43d0070
// ─────────────────────────────────────────────────────────

const MANDI_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';

/**
 * Determine price trend by comparing modal price to min/max spread.
 */
function deriveTrend(modalPrice, minPrice, maxPrice) {
  if (!minPrice || !maxPrice || minPrice === maxPrice) return 'stable';
  const mid = (parseFloat(minPrice) + parseFloat(maxPrice)) / 2;
  const modal = parseFloat(modalPrice);
  if (modal > mid * 1.02) return 'up';
  if (modal < mid * 0.98) return 'down';
  return 'stable';
}

/**
 * Fetch live mandi prices from data.gov.in Agmarknet dataset.
 * Falls back gracefully if API key is missing.
 *
 * @param {string} search  crop name filter (optional)
 * @param {string} state   state name filter (optional)
 * @returns {Array<{ cropName, market, state, price, unit, trend }>}
 */
export async function fetchLiveMandiPrices(search = '', state = '') {
  const key = DATA_GOV_KEY();
  if (!key) {
    throw new Error('DATA_GOV_API_KEY not configured — using DB fallback.');
  }

  let apiUrl = `https://api.data.gov.in/resource/${MANDI_RESOURCE_ID}?api-key=${key}&format=json&limit=60&offset=0`;

  if (search) apiUrl += `&filters[commodity]=${encodeURIComponent(search)}`;
  if (state)  apiUrl += `&filters[state]=${encodeURIComponent(state)}`;

  const res = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`data.gov.in Mandi API error: ${res.status}`);

  const json = await res.json();
  const records = json.records || [];

  if (records.length === 0) {
    throw new Error('No records returned from Agmarknet API.');
  }

  // Normalize to match the app's MarketPrice schema
  return records
    .filter(r => r.modal_price && parseFloat(r.modal_price) > 0)
    .map(r => ({
      cropName : r.commodity   || 'Unknown',
      market   : r.market      || r.apmc || 'N/A',
      state    : r.state       || 'N/A',
      price    : parseFloat(r.modal_price),
      unit     : 'Quintal',
      trend    : deriveTrend(r.modal_price, r.min_price, r.max_price),
    }));
}

// ─────────────────────────────────────────────────────────
// 3. GOVERNMENT SCHEMES  (data.gov.in — Agriculture Schemes)
//    Resource: 7714ccb3-ef2a-4bda-8924-38e7daabd8b6
// ─────────────────────────────────────────────────────────

const SCHEMES_RESOURCE_ID = '7714ccb3-ef2a-4bda-8924-38e7daabd8b6';

/**
 * Map data.gov.in scheme ministry/department names to app categories.
 */
function mapCategory(schemeName = '', ministry = '') {
  const combined = `${schemeName} ${ministry}`.toLowerCase();
  if (combined.includes('insurance') || combined.includes('fasal bima')) return 'Crop Insurance';
  if (combined.includes('solar') || combined.includes('kusum') || combined.includes('irrigation') || combined.includes('power')) return 'Irrigation & Power';
  if (combined.includes('subsid') || combined.includes('mechaniz') || combined.includes('soil') || combined.includes('organic') || combined.includes('seed')) return 'Subsidies & Inputs';
  return 'Financial Support';
}

/**
 * Fetch live government agriculture schemes from data.gov.in.
 *
 * @param {string} search    keyword filter (optional)
 * @param {string} category  category filter (optional)
 * @returns {Array<{ title, description, eligibility, benefits, applyLink, category }>}
 */
export async function fetchLiveSchemes(search = '', category = '') {
  const key = DATA_GOV_KEY();
  if (!key) {
    throw new Error('DATA_GOV_API_KEY not configured — using DB fallback.');
  }

  let apiUrl = `https://api.data.gov.in/resource/${SCHEMES_RESOURCE_ID}?api-key=${key}&format=json&limit=40&offset=0`;

  if (search) apiUrl += `&filters[scheme_name]=${encodeURIComponent(search)}`;

  const res = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`data.gov.in Schemes API error: ${res.status}`);

  const json = await res.json();
  const records = json.records || [];

  if (records.length === 0) {
    throw new Error('No scheme records returned from data.gov.in API.');
  }

  const mapped = records
    .filter(r => r.scheme_name || r.schemename)
    .map(r => {
      const name = r.scheme_name || r.schemename || '';
      const ministry = r.ministry || r.department || '';
      const derivedCategory = mapCategory(name, ministry);

      return {
        title       : name,
        description : r.description || r.scheme_details || `${name} — Government of India scheme administered by ${ministry}.`,
        eligibility : r.eligibility || r.beneficiaries || 'All eligible farmers as per scheme guidelines.',
        benefits    : r.benefits    || r.benefit_details || 'Financial assistance and support as per scheme norms.',
        applyLink   : r.apply_link  || r.url || 'https://www.myscheme.gov.in/',
        category    : derivedCategory,
      };
    });

  // Client-side category filter (API may not support it as a query param)
  if (category && category !== 'all') {
    return mapped.filter(s => s.category === category);
  }
  return mapped;
}
