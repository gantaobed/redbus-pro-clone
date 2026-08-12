import { useState, useEffect, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Globe, Bell, X, Bus, Settings, CheckCircle } from 'lucide-react';
import RoutePlanner from './components/RoutePlanner';
import CommunityFeed from './components/CommunityFeed';
import RedBusExtras from './components/RedBusExtras';

export const AppContext = createContext();

// TASK 3: Full i18n Dictionary
const translations = {
  en: { 
    brand: 'RedBus Pro', plannerTab: 'Interactive Route Planner', communityTab: 'Community & Verified Reviews',
    notifHistory: 'Notification History', prefs: 'Preferences',
    startLoc: 'Start Location', dest: 'Destination', findBuses: 'Find Buses', saveRoute: 'Save Route',
    traffic: 'Route Comparison & Traffic Impact', primary: 'Primary Route (NH 44): 18h 30m (+35m Delay)',
    alt: 'Alt Route (Via Bypass): 17h 55m (Clear Traffic)',
    book: 'Confirm & Pay Ticket', success: 'Booking Successful!', returnMap: 'Return to Map',
    rateTitle: 'Rate Your Completed Journey', submitReview: 'Submit Verified Review',
    forumTitle: 'Share Travel Story, Tips & Photos', publish: 'Publish Post'
  },
  hi: { 
    brand: 'रेडबस प्रो', plannerTab: 'मार्ग योजनाकार', communityTab: 'समुदाय और समीक्षाएं',
    notifHistory: 'अधिसूचना इतिहास', prefs: 'प्राथमिकताएं',
    startLoc: 'प्रारंभिक स्थान', dest: 'मंज़िल', findBuses: 'बसें खोजें', saveRoute: 'मार्ग सहेजें',
    traffic: 'मार्ग तुलना और यातायात प्रभाव', primary: 'प्राथमिक मार्ग (NH 44): 18h 30m (+35m देरी)',
    alt: 'वैकल्पिक मार्ग (बाईपास): 17h 55m (साफ यातायात)',
    book: 'टिकट की पुष्टि करें', success: 'बुकिंग सफल!', returnMap: 'मानचित्र पर लौटें',
    rateTitle: 'अपनी यात्रा का मूल्यांकन करें', submitReview: 'समीक्षा जमा करें',
    forumTitle: 'यात्रा की कहानी और तस्वीरें साझा करें', publish: 'पोस्ट प्रकाशित करें'
  }
};

export default function App() {
  // TASK 3 & 5: Persist State in Local Storage
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');
  const [activeTab, setActiveTab] = useState('planner');
  
  const [showNotifs, setShowNotifs] = useState(false);
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'promo', title: { en: 'Welcome to RedBus Pro', hi: 'रेडबस प्रो में आपका स्वागत है' }, message: { en: 'Enjoy your seamless travel experience.', hi: 'अपनी निर्बाध यात्रा का आनंद लें।' }, status: 'delivered' }
  ]);

  // Apply persistent theme on load
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleTheme = () => setIsDark(!isDark);
  const t = (key) => translations[lang][key] || key;

  // TASK 2: Trigger automated notifications from anywhere
  const triggerNotification = (title, message) => {
    const newNotif = { id: Date.now(), type: 'booking', title: { en: title, hi: title }, message: { en: message, hi: message }, status: 'delivered' };
    setNotifications([newNotif, ...notifications]);
    setShowNotifs(true); // Auto-open to show it worked
  };

  return (
    <AppContext.Provider value={{ lang, setLang, t, isDark, toggleTheme, triggerNotification }}>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        
        <nav className="bg-red-600 dark:bg-red-800 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Bus size={28} /><span>{t('brand')}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <Globe size={18} />
                <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent outline-none cursor-pointer font-bold appearance-none text-black">
                  <option value="en">EN</option>
                  <option value="hi">HI</option>
                </select>
              </div>

              <button onClick={toggleTheme} className="p-2 hover:bg-white/20 rounded-full transition">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="relative">
                <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 hover:bg-white/20 rounded-full relative">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 bg-yellow-400 h-2.5 w-2.5 rounded-full animate-pulse"></span>
                </button>

                <AnimatePresence>
                  {showNotifs && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 overflow-hidden text-left z-50">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 font-bold flex justify-between">
                        <span>{t('notifHistory')}</span>
                        <button onClick={() => setShowPrefModal(true)} className="text-blue-600 text-xs flex items-center gap-1"><Settings size={14}/> {t('prefs')}</button>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-3 border-b dark:border-gray-700">
                            <p className="font-bold text-sm">{n.title[lang]}</p>
                            <p className="text-xs text-gray-500 mt-1">{n.message[lang]}</p>
                            <span className="text-[10px] text-green-500 flex items-center gap-1 mt-2"><CheckCircle size={10}/> Email & Push Delivered</span>
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

        <div className="flex justify-center gap-4 p-4 mt-2">
          <button onClick={() => setActiveTab('planner')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'planner' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>{t('plannerTab')}</button>
          <button onClick={() => setActiveTab('community')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'community' ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}>{t('communityTab')}</button>
        </div>

        <main className="max-w-7xl mx-auto p-4 flex-grow w-full">
          {activeTab === 'planner' ? <RoutePlanner /> : <CommunityFeed />}
        </main>

        <RedBusExtras />
      </div>
    </AppContext.Provider>
  );
}