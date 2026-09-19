import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { TRANSLATIONS } from '../utils/translations';
import { CloudSun, Coins, ShieldCheck, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';

const LandingPage = () => {
  const { language, changeLanguage } = useContext(AuthContext);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const toggleLanguage = () => {
    changeLanguage(language === 'hi' ? 'en' : 'hi');
  };

  return (
    <div className="bg-white min-h-screen text-slate-700">
      {/* Navbar */}
      <nav className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🌱</span>
          <span className="font-bold text-xl text-slate-800 tracking-tight">{t.brand}</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
          <a href="#features" className="hover:text-primary transition-colors">
            {language === 'hi' ? 'विशेषताएं' : 'Features'}
          </a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">
            {language === 'hi' ? 'कार्य प्रणाली' : 'How It Works'}
          </a>
          <a href="#contact" className="hover:text-primary transition-colors">
            {language === 'hi' ? 'संपर्क' : 'Contact'}
          </a>
        </div>
        <div className="flex items-center space-x-4">
          {/* Public Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-premium bg-slate-50 text-slate-600 hover:text-primary border border-slate-100 transition-all"
            title="Switch Language"
          >
            <span>🌐</span>
            <span>{language === 'hi' ? 'English' : 'हिंदी'}</span>
          </button>
          <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-primary transition-colors">
            {t.signIn}
          </Link>
          <Link to="/register" className="bg-primary hover:bg-primary-dark text-white font-bold text-sm px-5 py-2.5 rounded-premium shadow-premium transition-all">
            {t.getStarted}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-tr from-primary-light via-white to-secondary-light py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6 flex flex-col items-center">
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full">
            <span className="text-xs text-primary font-bold tracking-wider uppercase">Smart Farming for the Future</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight max-w-3xl">
            {t.heroTitle} <span className="text-primary">{t.heroSpan}</span>
          </h1>
          <p className="text-slate-500 leading-relaxed text-base max-w-2xl mx-auto">
            {t.heroDesc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link to="/register" className="bg-primary hover:bg-primary-dark text-white text-center font-bold px-8 py-4 rounded-premium shadow-hoverGlow transition-all w-full sm:w-auto">
              {t.startFree}
            </Link>
            <Link to="/login" className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-center font-bold px-8 py-4 rounded-premium shadow-premium transition-all w-full sm:w-auto">
              {t.farmerDashboard}
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold pt-4">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="text-primary" size={16} />
              <span>{t.realTimePrices}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="text-primary" size={16} />
              <span>{t.bilingualSupport}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold text-slate-900">{t.offersTitle}</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            {t.offersDesc}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            { title: t.featWeatherTitle, desc: t.featWeatherDesc, icon: CloudSun, color: "text-secondary bg-secondary/10" },
            { title: t.featPricesTitle, desc: t.featPricesDesc, icon: Coins, color: "text-primary bg-primary/10" }
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 p-6 rounded-premium hover:shadow-hoverGlow transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 font-bold ${feat.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-base text-slate-800 mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-slate-50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900">{t.howTitle}</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t.howDesc}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: t.step1Title, desc: t.step1Desc },
              { step: "02", title: t.step2Title, desc: t.step2Desc },
              { step: "03", title: t.step3Title, desc: t.step3Desc }
            ].map((step, i) => (
              <div key={i} className="bg-white border border-slate-100 p-8 rounded-premium relative shadow-sm hover:scale-[1.01] transition-transform">
                <span className="text-5xl font-extrabold text-primary/10 absolute top-4 right-4">{step.step}</span>
                <h3 className="font-bold text-lg text-slate-800 mb-3">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900">{language === 'hi' ? 'किसानों के अनुभव' : 'Loved by Farmers'}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { quote: language === 'hi' ? "मौसम की सटीक चेतावनी ने मेरी कटी हुई गेहूं की फसल को भीगने से बचा लिया। पूर्वानुमान बिल्कुल सही समय पर मिला।" : "The extreme weather alerts saved my harvested wheat from getting wet in the sudden rain. The system warning was highly accurate and fast.", farmer: "Rajesh Kumar", place: "Patiala, Punjab" },
            { quote: language === 'hi' ? "प्याज बेचने से पहले मंडी भाव देखने से मुझे आढ़तियों के भारी कमीशन से मुक्ति मिली। मोबाइल पर इसे उपयोग करना बहुत आसान है।" : "Checking onion mandi prices before selling saved me from middleman commissions. The clean interface is very easy to use on mobile.", farmer: "Sanjay Patil", place: "Nashik, Maharashtra" }
          ].map((t, i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 p-8 rounded-premium space-y-4">
              <p className="text-sm italic leading-relaxed text-slate-600">"{t.quote}"</p>
              <div>
                <h4 className="font-bold text-xs text-slate-800">{t.farmer}</h4>
                <p className="text-[10px] text-primary font-semibold mt-0.5">{t.place}</p>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900">{language === 'hi' ? 'संपर्क सूत्र' : 'Get in Touch'}</h2>
          <p className="text-slate-500 text-xs leading-relaxed max-w-md">
            {language === 'hi' ? 'क्या आपके कोई प्रश्न हैं या आपको अपनी सहकारी समिति स्थापित करने में सहायता चाहिए? हमारी तकनीकी टीम से संपर्क करें।' : 'Do you have questions or require support setting up your farming cooperative? Contact our technical team today.'}
          </p>
          <div className="space-y-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center space-x-3">
              <Phone className="text-primary" size={16} />
              <span>+91 9461202406</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="text-primary" size={16} />
              <span>shristhisethi1921@gmail.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="text-primary" size={16} />
              <span>Agricultural IT Center</span>
            </div>
          </div>
        </div>
        <form className="bg-slate-50 border border-slate-100 p-8 rounded-premium space-y-4 shadow-sm" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder={language === 'hi' ? 'नाम' : 'Name'} className="bg-white border border-slate-100 text-xs rounded-lg p-3 w-full focus:ring-1 focus:ring-primary focus:outline-none" />
            <input type="email" placeholder={language === 'hi' ? 'ईमेल' : 'Email'} className="bg-white border border-slate-100 text-xs rounded-lg p-3 w-full focus:ring-1 focus:ring-primary focus:outline-none" />
          </div>
          <input type="text" placeholder={language === 'hi' ? 'विषय' : 'Subject'} className="bg-white border border-slate-100 text-xs rounded-lg p-3 w-full focus:ring-1 focus:ring-primary focus:outline-none" />
          <textarea placeholder={language === 'hi' ? 'आपका संदेश' : 'Your Message'} rows={4} className="bg-white border border-slate-100 text-xs rounded-lg p-3 w-full focus:ring-1 focus:ring-primary focus:outline-none resize-none"></textarea>
          <button className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-6 py-3 rounded-premium shadow-premium w-full transition-all">
            {language === 'hi' ? 'संदेश भेजें' : 'Send Message'}
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <span className="text-lg">🌱</span>
            <span className="font-bold text-white text-sm">{t.brand}</span>
          </div>
          <p>© 2026 KrishiDrishti. All rights reserved. Designed for Placement & Research Portfolio.</p>
          <div className="flex space-x-6">
            <Link to="/admin-login" className="hover:text-white transition-colors">{t.adminAccess}</Link>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
