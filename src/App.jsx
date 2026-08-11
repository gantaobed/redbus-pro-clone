import { useState, useEffect, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Globe, Bell, X, Bus, Settings, CheckCircle, ShieldAlert } from 'lucide-react';
import RoutePlanner from './components/RoutePlanner';
import CommunityFeed from './components/CommunityFeed';
import RedBusExtras from './components/RedBusExtras';

export const AppContext = createContext();

const translations = {
  en: { brand: 'RedBus Pro', plannerTab: 'Interactive Route Planner', communityTab: 'Community & Verified Reviews' },
  hi: { brand: 'रेडबस प्रो', plannerTab: 'मार्ग योजनाकार', communityTab: 'समुदाय और सत्यापन समीक्षाएं' }
};

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('planner');
  
  // Task 2: Advanced Notifications & Preferences State
  const [showNotifs, setShowNotifs] = useState(false);
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [prefs, setPrefs] = useState({ emailNotifs: true, pushNotifs: true, promoNotifs: false });

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications');
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (e) {
      setNotifications([
        { id: 1, type: 'booking', title: { en: 'Booking Confirmed', hi: 'बुकिंग की पुष्टि की गई' }, message: { en: 'PNR RB-99812 confirmed for Delhi to Hyderabad', hi: 'दिल्ली से हैदराबाद के लिए PNR पुष्टि' }, status: 'delivered', channel: 'email', timestamp: new Date() },
        { id: 2, type: 'schedule', title: { en: 'Route Traffic Alert', hi: 'ट्रैफिक चेतावनी' }, message: { en: 'Heavy traffic on NH 44 (+15m delay)', hi: 'एनएच 44 पर भारी ट्रैफिक' }, status: 'delivered', channel: 'push', timestamp: new Date() }
      ]);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/preferences');
      const data = await res.json();
      if (data) setPrefs(data);
    } catch (e) { console.error(e); }
  };

  const togglePref = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      await fetch('http://localhost:5000/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) { console.error(e); }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const t = (key) => translations[lang][key] || key;

  return (
    <AppContext.Provider value={{ lang, setLang, t, isDark, toggleTheme }}>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        
        {/* Navigation Bar */}
        <nav className="bg-red-600 dark:bg-red-800 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            
            <div className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Bus size={28} />
              <span>{t('brand')}</span>
            </div>

            <div className="flex items-center gap-4">
              {/* TASK 3: i18n Selector */}
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full cursor-pointer">
                <Globe size={18} />
                <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent outline-none cursor-pointer font-bold appearance-none">
                  <option value="en" className="text-black">EN</option>
                  <option value="hi" className="text-black">HI</option>
                </select>
              </div>

              {/* TASK 5: Dark Mode Toggle */}
              <button onClick={toggleTheme} className="p-2 hover:bg-white/20 rounded-full transition">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* TASK 2: Advanced Notifications */}
              <div className="relative">
                <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 hover:bg-white/20 rounded-full relative">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 bg-yellow-400 h-2.5 w-2.5 rounded-full"></span>
                </button>

                <AnimatePresence>
                  {showNotifs && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 overflow-hidden text-left text-gray-800 dark:text-gray-100 z-50">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 font-bold border-b dark:border-gray-600 flex justify-between items-center">
                        <span>Notification History</span>
                        <button onClick={() => setShowPrefModal(true)} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
                          <Settings size={14} /> Preferences
                        </button>
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((n, idx) => (
                          <div key={idx} className="p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-1">
                              <span className="uppercase">{n.type}</span>
                              <span className="text-green-500 font-mono flex items-center gap-0.5"><CheckCircle size={10} /> {n.status}</span>
                            </div>
                            <p className="font-bold text-sm">{n.title[lang] || n.title.en}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message[lang] || n.message.en}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </nav>

        {/* Task Tabs */}
        <div className="flex justify-center gap-4 p-4 mt-2">
          <button onClick={() => setActiveTab('planner')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'planner' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-800'}`}>
            {t('plannerTab')}
          </button>
          <button onClick={() => setActiveTab('community')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'community' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-800'}`}>
            {t('communityTab')}
          </button>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-4 flex-grow w-full">
          {activeTab === 'planner' ? <RoutePlanner /> : <CommunityFeed />}
        </main>

        <RedBusExtras />

        {/* TASK 2: Notification Channel Preferences Modal */}
        {showPrefModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-sm w-full space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-lg">Notification Channels</h3>
                <button onClick={() => setShowPrefModal(false)}><X size={18} /></button>
              </div>

              <div className="space-y-3">
                <label className="flex justify-between items-center cursor-pointer">
                  <span>Email Alerts</span>
                  <input type="checkbox" checked={prefs.emailNotifs} onChange={() => togglePref('emailNotifs')} className="h-5 w-5 text-red-600" />
                </label>
                <label className="flex justify-between items-center cursor-pointer">
                  <span>Push Notifications</span>
                  <input type="checkbox" checked={prefs.pushNotifs} onChange={() => togglePref('pushNotifs')} className="h-5 w-5 text-red-600" />
                </label>
                <label className="flex justify-between items-center cursor-pointer">
                  <span>Promotional Offers</span>
                  <input type="checkbox" checked={prefs.promoNotifs} onChange={() => togglePref('promoNotifs')} className="h-5 w-5 text-red-600" />
                </label>
              </div>

              <button onClick={() => setShowPrefModal(false)} className="w-full bg-red-600 text-white font-bold py-2 rounded-xl mt-4">
                Save Channel Preferences
              </button>
            </div>
          </div>
        )}

      </div>
    </AppContext.Provider>
  );
}