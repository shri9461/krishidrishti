import React, { useContext, useState } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { AuthContext } from '../context/AuthContext';
import { Bell, Globe, CheckCircle2 } from 'lucide-react';

const Navbar = ({ title = 'Dashboard' }) => {
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead } =
    useContext(NotificationContext);
  const { user, updateUserProfile, language, changeLanguage } = useContext(AuthContext);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const toggleLanguage = () => {
    const nextLang = language === 'hi' ? 'en' : 'hi';
    changeLanguage(nextLang);
    if (user) {
      updateUserProfile({ preferredLanguage: nextLang });
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center space-x-3">
        <h2 className="font-semibold text-lg text-slate-800">{title}</h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-2 text-xs font-semibold px-3 py-2 rounded-premium bg-slate-50 text-slate-600 hover:text-primary hover:bg-primary-light transition-all border border-slate-100"
          title="Toggle Language"
        >
          <Globe size={14} />
          <span>{language === 'hi' ? 'हिंदी' : 'English'}</span>
        </button>

        {/* Notifications Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className={`p-2 rounded-premium bg-slate-50 border border-slate-100 text-slate-600 hover:text-primary hover:bg-primary-light transition-all relative ${
              showNotifDropdown ? 'bg-primary-light text-primary' : ''
            }`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-error text-white font-bold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-100 rounded-premium shadow-lg z-50 py-2">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[10px] text-primary hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => !notif.isRead && markNotificationAsRead(notif._id)}
                      className={`p-3.5 border-b border-slate-50 cursor-pointer transition-colors ${
                        notif.isRead ? 'bg-white' : 'bg-primary/5 hover:bg-primary/10'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <div className="mt-0.5">
                          {notif.type === 'weather' && '🌦️'}
                          {notif.type === 'disease' && '🍂'}
                          {notif.type === 'scheme' && '📜'}
                          {notif.type === 'price' && '💰'}
                          {notif.type === 'general' && '🔔'}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-semibold text-slate-700 leading-snug">
                            {notif.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                            {notif.message}
                          </p>
                          <span className="text-[9px] text-slate-400 block mt-1">
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {!notif.isRead && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User initials bubble */}
        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm cursor-pointer shadow-premium">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
