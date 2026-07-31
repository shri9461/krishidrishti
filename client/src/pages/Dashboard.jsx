import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { TRANSLATIONS } from '../utils/translations';
import { CloudSun, Coins, Radio } from 'lucide-react';

const Dashboard = () => {
  const { user, updateUserProfile, language } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'overview';
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  
  // State definitions
  const [dashboardData, setDashboardData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherQuery, setWeatherQuery] = useState('');
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Mandi Prices State
  const [mandiPrices, setMandiPrices] = useState([]);
  const [mandiSearch, setMandiSearch] = useState('');
  const [mandiState, setMandiState] = useState('all');
  const [mandiStatesList, setMandiStatesList] = useState([]);
  const [mandiLoading, setMandiLoading] = useState(false);

  const [schemesList, setSchemesList] = useState([]);
  const [schemeSearch, setSchemeSearch] = useState('');
  const [schemeCategory, setSchemeCategory] = useState('all');
  const [schemesLoading, setSchemesLoading] = useState(false);

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileLocation, setProfileLocation] = useState(user?.location || '');
  const [profileState, setProfileState] = useState(user?.state || 'Maharashtra');
  const [profilePass, setProfilePass] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState('general');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Fetch Core Dashboard Overview Data
  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard', { headers: { Authorization: `Bearer ${user.token}` } });
      const json = await res.json();
      if (json.success) setDashboardData(json.data);
    } catch (err) {
      console.error('Fetch dashboard error:', err);
    }
  };

  // Fetch Weather Forecast API
  const [lastFetchedLoc, setLastFetchedLoc] = useState('');
  const fetchWeather = async (loc = '') => {
    setWeatherLoading(true);
    try {
      const q = loc || user?.location || user?.state || 'Maharashtra';
      setLastFetchedLoc(q);
      const res = await fetch(`/api/weather?location=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${user.token}` } });
      const json = await res.json();
      if (json.success) setWeatherData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Fetch Mandi Prices API
  const fetchMandiPrices = async () => {
    setMandiLoading(true);
    try {
      let url = `/api/market-prices?search=${encodeURIComponent(mandiSearch)}`;
      if (mandiState !== 'all') {
        url += `&state=${encodeURIComponent(mandiState)}`;
      }
      const res = await fetch(url, { headers: { Authorization: `Bearer ${user.token}` } });
      const json = await res.json();
      if (json.success) {
        setMandiPrices(json.data.prices);
        setMandiStatesList(json.data.states);
      }
    } catch (err) {
      console.error('Fetch mandi prices error:', err);
    } finally {
      setMandiLoading(false);
    }
  };

  // Fetch Government Schemes
  const fetchSchemes = async () => {
    setSchemesLoading(true);
    try {
      const res = await fetch(`/api/schemes?search=${encodeURIComponent(schemeSearch)}&category=${encodeURIComponent(schemeCategory)}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const json = await res.json();
      if (json.success) setSchemesList(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSchemesLoading(false);
    }
  };

  // Fetch Administrator Stats
  const fetchAdminStats = async () => {
    if (user.role !== 'admin') return;
    try {
      const statsRes = await fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${user.token}` } });
      const statsJson = await statsRes.json();
      if (statsJson.success) setAdminStats(statsJson.data);

      const usersRes = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${user.token}` } });
      const usersJson = await usersRes.json();
      if (usersJson.success) setAdminUsers(usersJson.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger data load on page start and user presence
  useEffect(() => {
    if (user) fetchDashboard();
  }, [user]);

  // Synchronise Active Tab changes with URL Search Params
  useEffect(() => {
    if (tabParam === 'weather') fetchWeather(lastFetchedLoc);
    if (tabParam === 'prices') fetchMandiPrices();
    if (tabParam === 'schemes') fetchSchemes();
    if (tabParam === 'admin') fetchAdminStats();
  }, [tabParam]);

  useEffect(() => {
    if (tabParam === 'prices') fetchMandiPrices();
  }, [mandiState]);

  useEffect(() => {
    if (tabParam === 'schemes') fetchSchemes();
  }, [schemeCategory]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  // Handle Profile settings save
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ name: profileName, phone: profilePhone, location: profileLocation, state: profileState, password: profilePass }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setProfileSuccess(t.saveSuccess);
        updateUserProfile(json.data);
      } else {
        setProfileError(json.message || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileError('Server offline.');
    }
  };

  // Handle Admin socket warnings broadcast
  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    setBroadcastSuccess(false);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ title: broadcastTitle, message: broadcastMsg, type: broadcastType }),
      });
      if (res.ok) {
        setBroadcastSuccess(true);
        setBroadcastTitle('');
        setBroadcastMsg('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-700">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        
        <Navbar title={
          tabParam === 'overview' ? `${t.welcome}, ${user?.name}!` :
          tabParam === 'weather' ? t.weather :
          tabParam === 'prices' ? t.prices :
          tabParam === 'schemes' ? t.schemes :
          tabParam === 'profile' ? t.profile : t.adminControl
        } />

        <main className="p-6 max-w-6xl mx-auto w-full space-y-6">
          
          {/* Visual Tabs Navigation Panel */}
          <div className="flex flex-wrap gap-2 bg-white border border-slate-100 p-2 rounded-2xl shadow-sm text-xs font-semibold">
            {[
              { id: 'overview', name: t.dashboard },
              { id: 'weather', name: t.weather },
              { id: 'prices', name: t.prices },
              { id: 'schemes', name: t.schemes },
              { id: 'profile', name: t.profile },
              ...(user.role === 'admin' ? [{ id: 'admin', name: t.adminHome }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2.5 rounded-xl transition-all ${
                  tabParam === tab.id ? 'bg-primary text-white font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* ==========================================
              TAB 1: OVERVIEW SCREEN
              ========================================== */}
          {tabParam === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-6 rounded-2xl text-white">
                <h3 className="text-lg font-bold">{t.brand} {t.dashboard}</h3>
                <p className="text-xs text-white/80 mt-1">{t.overviewDesc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Weather card */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase">
                      <span>{t.mausamTitle}</span>
                      <CloudSun size={18} className="text-secondary animate-pulse" />
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">🌦️</span>
                      <div>
                        <h4 className="text-2xl font-extrabold text-slate-800">28°C</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{user.location || 'Lasalgaon'}, {user.state}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded leading-relaxed border border-slate-100 font-semibold">
                    {t.dryRecommendation}
                  </p>
                </div>

                {/* Mandi Rates Quick Widget */}
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium space-y-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase">
                    <span>{language === 'hi' ? 'स्थानीय मंडी भाव' : 'Local Mandi Rates'}</span>
                    <Coins size={18} className="text-primary" />
                  </div>
                  <div className="divide-y divide-slate-50">
                    {dashboardData?.localPrices && dashboardData.localPrices.length > 0 ? (
                      dashboardData.localPrices.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 text-xs">
                          <div>
                            <p className="font-bold text-slate-800">{item.cropName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{item.market}, {item.state}</p>
                          </div>
                          <div className="text-right flex items-center space-x-2">
                            <span className="font-extrabold text-slate-800">₹{item.price} <span className="text-[10px] text-slate-400 font-normal">/ {item.unit}</span></span>
                            <span className={`text-xs ${item.trend === 'up' ? 'text-success' : item.trend === 'down' ? 'text-error' : 'text-slate-400'}`}>
                              {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '●'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-slate-400 py-6">
                        {language === 'hi' ? 'कोई भाव उपलब्ध नहीं' : 'No mandi rates available'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: WEATHER FORECAST
              ========================================== */}
          {tabParam === 'weather' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium space-y-4">
                <h3 className="font-bold text-slate-800 text-sm">{t.findWeather}</h3>
                <form onSubmit={(e) => { e.preventDefault(); if (weatherQuery.trim()) fetchWeather(weatherQuery); }} className="space-y-2">
                  <input
                    type="text"
                    value={weatherQuery}
                    onChange={(e) => setWeatherQuery(e.target.value)}
                    placeholder={t.enterMandi}
                    className="w-full bg-slate-50 border border-slate-100 text-xs rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                  <button type="submit" disabled={weatherLoading} className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold text-xs py-3 rounded-lg shadow-premium">
                    {weatherLoading ? t.updating : t.fetchForecast}
                  </button>
                </form>
              </div>

              <div className="md:col-span-2 bg-white border border-slate-100 p-5 rounded-2xl shadow-premium min-h-[160px] flex flex-col justify-center">
                {weatherData ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-slate-800 text-sm">{t.advisoriesFor} {weatherData.location}</h4>
                      <span className="text-secondary font-bold uppercase">{weatherData.rainForecast}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center py-2 bg-slate-50 rounded-xl border border-slate-100 font-semibold text-slate-700">
                      <div><p className="text-slate-400 text-[10px]">{t.temp}</p><p className="text-sm font-extrabold text-slate-800">{weatherData.temperature}°C</p></div>
                      <div><p className="text-slate-400 text-[10px]">{t.humidity}</p><p className="text-sm font-extrabold text-slate-800">{weatherData.humidity}%</p></div>
                      <div><p className="text-slate-400 text-[10px]">{t.wind}</p><p className="text-sm font-extrabold text-slate-800">{weatherData.windSpeed} km/h</p></div>
                    </div>
                    <ul className="list-disc pl-5 text-slate-500 space-y-1 font-semibold">
                      {weatherData.recommendations?.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                ) : <div className="text-center text-xs text-slate-400">{t.loadingForecast}</div>}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB: MANDI PRICES INDEX
              ========================================== */}
          {tabParam === 'prices' && (
            <div className="space-y-6 font-sans">
              {/* Search & State Filter bar */}
              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-premium flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 flex flex-col md:flex-row items-center gap-4 w-full">
                  <input
                    type="text"
                    placeholder={t.filterCrop}
                    value={mandiSearch}
                    onChange={(e) => setMandiSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchMandiPrices(); }}
                    className="bg-slate-50 border border-slate-100 text-xs rounded-lg p-3 w-full md:max-w-md focus:outline-none focus:ring-1 focus:ring-primary font-semibold text-slate-700"
                  />
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <label className="text-xs text-slate-400 font-bold uppercase whitespace-nowrap">
                      {language === 'hi' ? 'राज्य चुनें:' : 'Select State:'}
                    </label>
                    <select
                      value={mandiState}
                      onChange={(e) => setMandiState(e.target.value)}
                      className="bg-slate-50 border border-slate-100 text-xs rounded-lg p-3 w-full md:w-56 focus:outline-none focus:ring-1 focus:ring-primary text-slate-600 font-semibold"
                    >
                      <option value="all">{language === 'hi' ? 'सभी राज्य' : 'All States'}</option>
                      {mandiStatesList.map((st, i) => (
                        <option key={i} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button onClick={fetchMandiPrices} className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-6 py-3 rounded-xl shadow-premium w-full md:w-auto">
                  {language === 'hi' ? 'खोजें' : 'Search'}
                </button>
              </div>

              {/* Mandi Prices Grid/Table */}
              {mandiLoading ? (
                <div className="p-12 text-center text-xs text-slate-500 font-semibold">
                  {language === 'hi' ? 'मंडी भाव सिंक हो रहे हैं...' : 'Syncing mandi prices...'}
                </div>
              ) : mandiPrices.length === 0 ? (
                <div className="bg-white border border-slate-100 p-12 text-center rounded-2xl shadow-premium text-xs text-slate-400 font-semibold">
                  {language === 'hi' ? 'कोई मंडी भाव नहीं मिले।' : 'No mandi rates found.'}
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse text-slate-600">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                          <th className="p-4">{t.cropCol}</th>
                          <th className="p-4">{t.marketCol}</th>
                          <th className="p-4">{t.stateCol}</th>
                          <th className="p-4">{t.priceCol}</th>
                          <th className="p-4">{language === 'hi' ? 'प्रवृत्ति' : 'Trend'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-medium">
                        {mandiPrices.map((item) => (
                          <tr key={item._id} className="hover:bg-slate-50/40">
                            <td className="p-4 font-bold text-slate-800">{item.cropName}</td>
                            <td className="p-4">{item.market}</td>
                            <td className="p-4">{item.state}</td>
                            <td className="p-4 font-extrabold text-slate-800">
                              ₹{item.price} <span className="text-[10px] text-slate-400 font-normal">/ {item.unit}</span>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center space-x-1 font-semibold text-xs ${
                                item.trend === 'up' ? 'text-success' :
                                item.trend === 'down' ? 'text-error' :
                                'text-slate-400'
                              }`}>
                                <span>{item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '●'}</span>
                                <span className="capitalize text-[10px]">{
                                  item.trend === 'up' ? (language === 'hi' ? 'ऊपर' : 'Up') :
                                  item.trend === 'down' ? (language === 'hi' ? 'नीचे' : 'Down') :
                                  (language === 'hi' ? 'स्थिर' : 'Stable')
                                }</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}



          {/* ==========================================
              TAB: GOVERNMENT SCHEMES
              ========================================== */}
          {tabParam === 'schemes' && (
            <div className="space-y-6">
              {/* Search & Filter bar */}
              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-premium flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 flex flex-col md:flex-row items-center gap-4 w-full font-sans">
                  <input
                    type="text"
                    placeholder={t.searchSchemes}
                    value={schemeSearch}
                    onChange={(e) => setSchemeSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchSchemes(); }}
                    className="bg-slate-50 border border-slate-100 text-xs rounded-lg p-3 w-full md:max-w-md focus:outline-none focus:ring-1 focus:ring-primary font-semibold text-slate-700"
                  />
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <label className="text-xs text-slate-400 font-bold uppercase whitespace-nowrap">{t.categoryLabel}:</label>
                    <select
                      value={schemeCategory}
                      onChange={(e) => setSchemeCategory(e.target.value)}
                      className="bg-slate-50 border border-slate-100 text-xs rounded-lg p-3 w-full md:w-56 focus:outline-none focus:ring-1 focus:ring-primary text-slate-600 font-semibold"
                    >
                      <option value="all">{t.allCategories}</option>
                      <option value="Financial Support">{t.financialSupport}</option>
                      <option value="Crop Insurance">{t.cropInsurance}</option>
                      <option value="Irrigation & Power">{t.irrigationPower}</option>
                      <option value="Subsidies & Inputs">{t.subsidiesInputs}</option>
                    </select>
                  </div>
                </div>
                <button onClick={fetchSchemes} className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-6 py-3 rounded-xl shadow-premium w-full md:w-auto font-sans">
                  {t.updateRates}
                </button>
              </div>

              {/* Schemes Grid */}
              {schemesLoading ? (
                <div className="p-12 text-center text-xs text-slate-500 font-semibold font-sans">Syncing government schemes...</div>
              ) : schemesList.length === 0 ? (
                <div className="bg-white border border-slate-100 p-12 text-center rounded-2xl shadow-premium text-xs text-slate-400 font-semibold font-sans">
                  {t.noSchemes}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                  {schemesList.map((scheme) => (
                    <div key={scheme._id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium hover:shadow-hoverGlow hover:scale-[1.01] transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            scheme.category === 'Financial Support' ? 'bg-green-50 text-success border border-green-100' :
                            scheme.category === 'Crop Insurance' ? 'bg-sky-50 text-secondary border border-sky-100' :
                            scheme.category === 'Irrigation & Power' ? 'bg-amber-50 text-warning border border-amber-100' :
                            'bg-purple-50 text-purple-600 border border-purple-100'
                          }`}>
                            {scheme.category === 'Financial Support' ? t.financialSupport :
                             scheme.category === 'Crop Insurance' ? t.cropInsurance :
                             scheme.category === 'Irrigation & Power' ? t.irrigationPower :
                             t.subsidiesInputs}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-800 leading-snug">{scheme.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">{scheme.description}</p>
                        
                        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-50 text-xs">
                          <div>
                            <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">{t.eligibility}</span>
                            <p className="text-slate-600 font-semibold leading-relaxed">{scheme.eligibility}</p>
                          </div>
                          <div className="pt-2">
                            <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">{t.benefits}</span>
                            <p className="text-slate-600 font-semibold leading-relaxed">{scheme.benefits}</p>
                          </div>
                        </div>
                      </div>

                      {scheme.applyLink && (
                        <a
                          href={scheme.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center bg-slate-50 hover:bg-primary hover:text-white border border-slate-100 hover:border-transparent text-slate-600 font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm"
                        >
                          {t.applyNow} ➜
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TAB 4: MY PROFILE DETAILS
              ========================================== */}
          {tabParam === 'profile' && (
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-premium max-w-lg mx-auto space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">{t.profileSettings}</h3>
              {profileSuccess && <p className="text-xs text-success bg-green-50 p-2.5 rounded border border-green-100 font-bold">{profileSuccess}</p>}
              {profileError && <p className="text-xs text-error bg-red-50 p-2.5 rounded border border-red-100 font-bold">{profileError}</p>}
              
              <form onSubmit={handleProfileSubmit} className="space-y-3.5 text-xs font-semibold text-slate-600">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label>{t.nameLabel}</label>
                    <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 font-semibold text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <label>{t.phoneLabel}</label>
                    <input type="text" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label>{t.villageLabel}</label>
                    <input type="text" value={profileLocation} onChange={e => setProfileLocation(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3" />
                  </div>
                  <div className="space-y-1">
                    <label>{t.stateLabel}</label>
                    <select value={profileState} onChange={e => setProfileState(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-slate-600 font-semibold">
                      <option value="Punjab">Punjab</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label>{t.passLabel}</label>
                  <input type="password" placeholder={t.passPlaceholder} value={profilePass} onChange={e => setProfilePass(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3" />
                </div>
                <button type="submit" className="bg-primary text-white font-bold text-xs px-5 py-3 rounded-xl shadow-premium">
                  {t.saveSettings}
                </button>
              </form>
            </div>
          )}

          {/* ==========================================
              TAB 5: ADMIN CONTROL
              ========================================== */}
          {tabParam === 'admin' && user.role === 'admin' && (
            <div className="space-y-6 text-xs font-semibold">
              <div className="max-w-xs">
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium flex justify-between items-center">
                  <div><p className="text-slate-400">{t.farmersCount}</p><h4 className="text-2xl font-extrabold text-slate-800 mt-1">{adminStats?.totalFarmers || 0}</h4></div>
                  <span className="text-2xl">👨‍🌾</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium space-y-4 md:col-span-1">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                    <Radio className="text-error animate-ping" size={16} />
                    <span>Socket.io Broadcast Warning</span>
                  </h3>
                  {broadcastSuccess && <p className="text-success bg-green-50 p-2.5 rounded border border-green-100 text-[10px] font-bold">{t.broadcastSuccess}</p>}
                  <form onSubmit={handleBroadcastSubmit} className="space-y-3.5 text-slate-600">
                    <div className="space-y-1">
                      <label>{t.warningCategory}</label>
                      <select value={broadcastType} onChange={e => setBroadcastType(e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded">
                        <option value="general">{t.warningAdvisory}</option>
                        <option value="weather">{t.warningWeather}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label>{t.warningTitle}</label>
                      <input type="text" value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} placeholder="Locust Outbreak" className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded" />
                    </div>
                    <div className="space-y-1">
                      <label>{t.warningDesc}</label>
                      <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} rows={2} placeholder="Write warning details..." className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded resize-none" />
                    </div>
                    <button type="submit" className="w-full bg-error hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-premium">
                      {t.broadcastBtn}
                    </button>
                  </form>
                </div>

                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-premium space-y-3 md:col-span-2 max-h-[340px] overflow-y-auto">
                  <h3 className="font-bold text-slate-800 text-sm">{t.farmersRegistry}</h3>
                  <table className="w-full text-left text-[11px] border-collapse text-slate-600">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase">
                        <th className="p-2">{t.registryName}</th>
                        <th className="p-2">{t.registryEmail}</th>
                        <th className="p-2">{t.registryState}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium">
                      {adminUsers.map(u => (
                        <tr key={u._id} className="hover:bg-slate-50/40">
                          <td className="p-2 font-bold text-slate-800">{u.name}</td>
                          <td className="p-2">{u.email}</td>
                          <td className="p-2">{u.state}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;
