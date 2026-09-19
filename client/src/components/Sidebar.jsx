import React, { useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { TRANSLATIONS } from '../utils/translations';
import {
  LayoutDashboard,
  CloudSun,
  Coins,
  User,
  LogOut,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logoutUser, language } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const farmerLinks = [
    { name: t.dashboard, path: '/dashboard?tab=overview', icon: LayoutDashboard },
    { name: t.weather, path: '/dashboard?tab=weather', icon: CloudSun },
    { name: t.schemes, path: '/dashboard?tab=schemes', icon: BookOpen },
    { name: t.profile, path: '/dashboard?tab=profile', icon: User },
  ];

  const adminLinks = [
    { name: t.adminHome, path: '/dashboard?tab=admin', icon: LayoutDashboard },
  ];

  const links = user?.role === 'admin' ? adminLinks : farmerLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-100 min-h-screen flex flex-col justify-between sticky top-0 shadow-sm">
      <div className="p-6">
        {/* Brand/Logo */}
        <div className="flex items-center space-x-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xl font-bold">
            🌱
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-800">{t.brand}</h1>
            <p className="text-xs text-primary font-medium tracking-wide">FARM ASSISTANT</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={() => {
                  const isTabActive = link.path.includes('tab=')
                    ? window.location.search === link.path.substring(link.path.indexOf('?'))
                    : window.location.pathname === link.path;

                  return `flex items-center space-x-3 px-4 py-3 rounded-premium text-sm font-medium transition-all duration-200 ${
                    isTabActive
                      ? 'bg-primary text-white shadow-premium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                  }`;
                }}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-50 space-y-4">
        {user?.role === 'admin' && (
          <div className="flex items-center space-x-2 text-xs text-secondary font-semibold bg-secondary-light px-3 py-2 rounded-lg">
            <ShieldCheck size={14} />
            <span>{t.adminAccess}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="truncate max-w-[110px]">
              <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            title={t.logout}
            className="p-1.5 rounded-premium text-slate-400 hover:text-error hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
