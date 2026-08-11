import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Globe, Bell, Menu, X, Bus } from 'lucide-react';
import RoutePlanner from './components/RoutePlanner';
import CommunityFeed from './components/CommunityFeed';

// --- TASK 3: i18n Dictionary ---
const translations = {
  en: { 
    brand: 'RedBus Pro', plannerTab: 'Route Planner', communityTab: 'Community & Reviews',
    notifEmpty: 'No new notifications'
  },
  hi: { 
    brand: 'रेडबस प्रो', plannerTab: 'मार्ग योजनाकार', communityTab: 'समुदाय और समीक्षाएं',
    notifEmpty: 'कोई नई सूचना नहीं'
  }
};

// Global Contexts
export const AppContext = createContext();

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('planner');
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Booking Confirmed: NY to Boston', time: 'Just now', read: false },
    { id: 2, text: 'Traffic Alert: Heavy congestion on Route 95', time: '1h ago', read: false }
  ]);
  const [showNotifs, setShowNotifs] = useState(false);

  const t = (key) => translations[lang][key] || key;

  // --- TASK 5: Persisted Dark Mode ---
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const markNotifsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider value={{ lang, setLang, t, isDark, toggleTheme }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        
        {/* Navigation Bar */}
        <nav className="bg-red-600 dark:bg-red-800 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            
            {/* Replaced emoji with robust Lucide React Icon */}
            <div className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Bus size={28} />
              <span>{t('brand')}</span>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              {/* TASK 3: Interactive Language Switcher */}
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full cursor-pointer hover:bg-white/30 transition">
                <Globe size={18} />
                <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent outline-none cursor-pointer font-medium appearance-none">
                  <option value="en" className="text-black">EN</option>
                  <option value="hi" className="text-black">HI</option>
                </select>
              </div>

              {/* TASK 5: Dark Mode Toggle */}
              <button onClick={toggleTheme} className="p-2 hover:bg-white/20 rounded-full transition">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* TASK 2: Advanced Notification System */}
              <div className="relative">
                <button onClick={() => { setShowNotifs(!showNotifs); markNotifsRead(); }} className="p-2 hover:bg-white/20 rounded-full transition relative">
                  <Bell size={20} />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1 right-1 bg-yellow-400 h-3 w-3 rounded-full border-2 border-red-600"></span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifs && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border dark:border-gray-700 overflow-hidden text-left"
                    >
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 font-bold border-b dark:border-gray-600 flex justify-between items-center">
                        Notifications
                        <button onClick={() => setShowNotifs(false)}><X size={16} /></button>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">{t('notifEmpty')}</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className="p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer">
                              <p className="text-sm font-medium">{n.text}</p>
                              <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </nav>

        {/* Dynamic Tabs */}
        <div className="flex justify-center gap-4 p-4">
          <button 
            onClick={() => setActiveTab('planner')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'planner' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
          >
            {t('plannerTab')}
          </button>
          <button 
            onClick={() => setActiveTab('community')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'community' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
          >
            {t('communityTab')}
          </button>
        </div>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'planner' ? (
              <motion.div key="planner" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <RoutePlanner />
              </motion.div>
            ) : (
              <motion.div key="community" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <CommunityFeed />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </AppContext.Provider>
  );
}