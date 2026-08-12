import { useState, useEffect, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Globe, Bell, X, Bus, Settings, CheckCircle, AlertTriangle, XCircle, Clock, Tag } from 'lucide-react';
import RoutePlanner from './components/RoutePlanner';
import CommunityFeed from './components/CommunityFeed';
import RedBusExtras from './components/RedBusExtras';

export const AppContext = createContext();

const translations = {
  en: { brand: 'RedBus Pro', plannerTab: 'Interactive Route Planner', communityTab: 'Community & Verified Reviews', notifHistory: 'Notification History', prefs: 'Preferences', startLoc: 'Start Location', dest: 'Destination', findBuses: 'Find Buses', saveRoute: 'Save Route', traffic: 'Route Comparison & Traffic Impact', primary: 'Primary Route (NH 44): 18h 30m (+35m Delay)', alt: 'Alt Route (Via Bypass): 17h 55m (Clear Traffic)', book: 'Confirm & Pay Ticket', success: 'Booking Successful!', returnMap: 'Return to Map', rateTitle: 'Rate Your Completed Journey', submitReview: 'Submit Verified Review', forumTitle: 'Share Travel Story, Tips & Photos', publish: 'Publish Post' },
  hi: { brand: 'रेडबस प्रो', plannerTab: 'मार्ग योजनाकार', communityTab: 'समुदाय और समीक्षाएं', notifHistory: 'अधिसूचना इतिहास', prefs: 'प्राथमिकताएं', startLoc: 'प्रारंभिक स्थान', dest: 'मंज़िल', findBuses: 'बसें खोजें', saveRoute: 'मार्ग सहेजें', traffic: 'मार्ग तुलना और यातायात प्रभाव', primary: 'प्राथमिक मार्ग: 18h 30m (+35m देरी)', alt: 'वैकल्पिक मार्ग: 17h 55m (साफ यातायात)', book: 'टिकट की पुष्टि करें', success: 'बुकिंग सफल!', returnMap: 'मानचित्र पर लौटें', rateTitle: 'अपनी यात्रा का मूल्यांकन करें', submitReview: 'समीक्षा जमा करें', forumTitle: 'यात्रा की कहानी साझा करें', publish: 'पोस्ट प्रकाशित करें' },
  te: { brand: 'రెడ్‌బస్ ప్రో', plannerTab: 'రూట్ ప్లానర్', communityTab: 'కమ్యూనిటీ & రివ్యూలు', notifHistory: 'నోటిఫికేషన్ చరిత్ర', prefs: 'ప్రాధాన్యతలు', startLoc: 'ప్రారంభ స్థానం', dest: 'గమ్యస్థానం', findBuses: 'బస్సులను వెతకండి', saveRoute: 'రూట్ సేవ్ చేయండి', traffic: 'ట్రాఫిక్ ప్రభావం', primary: 'ప్రధాన మార్గం: 18h 30m', alt: 'ప్రత్యామ్నాయ మార్గం: 17h 55m', book: 'టిక్కెట్‌ను నిర్ధారించండి', success: 'బుకింగ్ విజయవంతమైంది!', returnMap: 'మ్యాప్‌కు తిరిగి వెళ్లండి', rateTitle: 'మీ ప్రయాణాన్ని రేట్ చేయండి', submitReview: 'రివ్యూ సమర్పించండి', forumTitle: 'ప్రయాణ కథనాన్ని పంచుకోండి', publish: 'పోస్ట్ చేయండి' },
  ta: { brand: 'ரெட்பஸ் ப்ரோ', plannerTab: 'வழித்தட திட்டமிடல்', communityTab: 'சமூகம் மற்றும் விமர்சனங்கள்', notifHistory: 'அறிவிப்பு வரலாறு', prefs: 'விருப்பங்கள்', startLoc: 'தொடங்கும் இடம்', dest: 'சேருமிடம்', findBuses: 'பேருந்துகளைத் தேடு', saveRoute: 'வழியைச் சேமி', traffic: 'போக்குவரத்து தாக்கம்', primary: 'முதன்மை வழி: 18h 30m', alt: 'மாற்று வழி: 17h 55m', book: 'டிக்கெட்டை உறுதிசெய்', success: 'முன்பதிவு வெற்றி!', returnMap: 'வரைபடத்திற்குத் திரும்பு', rateTitle: 'உங்கள் பயணத்தை மதிப்பிடுங்கள்', submitReview: 'விமர்சனத்தை சமர்ப்பி', forumTitle: 'பயணக் கதையைப் பகிரவும்', publish: 'பதிப்பி' },
  bn: { brand: 'রেডবাস প্রো', plannerTab: 'রুট প্ল্যানার', communityTab: 'সম্প্রদায় এবং পর্যালোচনা', notifHistory: 'বিজ্ঞপ্তি ইতিহাস', prefs: 'পছন্দসমূহ', startLoc: 'শুরুর স্থান', dest: 'গন্তব্য', findBuses: 'বাস খুঁজুন', saveRoute: 'রুট সংরক্ষণ করুন', traffic: 'ট্রাফিক প্রভাব', primary: 'প্রধান রুট: 18h 30m', alt: 'বিকল্প রুট: 17h 55m', book: 'টিকিট নিশ্চিত করুন', success: 'বুকিং সফল!', returnMap: 'মানচিত্রে ফিরে যান', rateTitle: 'আপনার রেটিং দিন', submitReview: 'পর্যালোচনা জমা দিন', forumTitle: 'ভ্রমণের গল্প শেয়ার করুন', publish: 'পোস্ট করুন' },
  mr: { brand: 'रेडबस प्रो', plannerTab: 'मार्ग नियोजक', communityTab: 'समुदाय आणि पुनरावलोकने', notifHistory: 'सूचना इतिहास', prefs: 'प्राधान्ये', startLoc: 'प्रारंभिक स्थान', dest: 'गंतव्यस्थान', findBuses: 'बसेस शोधा', saveRoute: 'मार्ग जतन करा', traffic: 'वाहतूक प्रभाव', primary: 'मुख्य मार्ग: 18h 30m', alt: 'पर्यायी मार्ग: 17h 55m', book: 'तिकीट निश्चित करा', success: 'बुकिंग यशस्वी!', returnMap: 'नकाशावर परत जा', rateTitle: 'तुमच्या प्रवासाला रेट करा', submitReview: 'पुनरावलोकन सबमिट करा', forumTitle: 'प्रवासाची कथा शेअर करा', publish: 'पोस्ट करा' }
};

export default function App() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');
  const [activeTab, setActiveTab] = useState('planner');
  
  const [showNotifs, setShowNotifs] = useState(false);
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    syncPreferencesBackend();
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications');
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (e) { console.error(e); }
  };

  const syncPreferencesBackend = async () => {
    try {
      await fetch('http://localhost:5000/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang, theme: isDark ? 'dark' : 'light' })
      });
    } catch (e) { console.error(e); }
  };

  const toggleTheme = () => setIsDark(!isDark);
  const t = (key) => (translations[lang] && translations[lang][key]) ? translations[lang][key] : (translations['en'][key] || key);

  const triggerNotification = async (type, titleEn, titleHi, messageEn, messageHi) => {
    const payload = {
      type,
      title: { en: titleEn, hi: titleHi || titleEn },
      message: { en: messageEn, hi: messageHi || messageEn },
      channel: 'push',
      status: 'delivered'
    };
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setNotifications(prev => [data, ...prev]);
      setShowNotifs(true);
    } catch (e) { console.error(e); }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'cancellation': return <XCircle size={14} className="text-red-500" />;
      case 'schedule': return <AlertTriangle size={14} className="text-orange-500" />;
      case 'reminder': return <Clock size={14} className="text-blue-500" />;
      case 'promo': return <Tag size={14} className="text-purple-500" />;
      default: return <CheckCircle size={14} className="text-green-500" />;
    }
  };

  return (
    <AppContext.Provider value={{ lang, setLang, t, isDark, toggleTheme, triggerNotification }}>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        
        {/* Navigation Bar */}
        <nav className="bg-red-600 dark:bg-red-800 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Bus size={28} /><span>{t('brand')}</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Task 3 Selector */}
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <Globe size={18} />
                <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent outline-none cursor-pointer font-bold appearance-none text-black dark:text-white">
                  <option value="en" className="text-black">English</option>
                  <option value="hi" className="text-black">हिंदी</option>
                  <option value="te" className="text-black">తెలుగు</option>
                  <option value="ta" className="text-black">தமிழ்</option>
                  <option value="bn" className="text-black">বাংলা</option>
                  <option value="mr" className="text-black">मराठी</option>
                </select>
              </div>

              {/* Task 5 Dark Mode Toggle */}
              <button onClick={toggleTheme} className="p-2 hover:bg-white/20 rounded-full transition">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Task 2 Notification Hub */}
              <div className="relative">
                <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 hover:bg-white/20 rounded-full relative">
                  <Bell size={20} />
                  {notifications.length > 0 && <span className="absolute top-1 right-1 bg-yellow-400 h-2.5 w-2.5 rounded-full animate-pulse"></span>}
                </button>

                <AnimatePresence>
                  {showNotifs && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border dark:border-gray-700 overflow-hidden text-left z-50">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 font-bold flex justify-between items-center text-gray-800 dark:text-gray-100">
                        <span>{t('notifHistory')}</span>
                        <button onClick={() => setShowPrefModal(true)} className="text-blue-600 dark:text-blue-400 text-xs flex items-center gap-1"><Settings size={14}/> {t('prefs')}</button>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">No recent notifications.</div>
                        ) : notifications.map((n, idx) => (
                          <div key={idx} className="p-3 border-b dark:border-gray-700 text-gray-800 dark:text-gray-100">
                            <div className="flex items-center gap-1 mb-1 text-[10px] uppercase font-bold tracking-wider text-gray-500">
                              {getIcon(n.type)} {n.type}
                            </div>
                            <p className="font-bold text-sm leading-tight">{n.title[lang] || n.title.en}</p>
                            <p className="text-xs text-gray-500 mt-1 leading-tight">{n.message[lang] || n.message.en}</p>
                          </div>
                        ))}
                      </div>

                      {/* Event Simulator Panel */}
                      <div className="p-2 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700">
                        <p className="text-[10px] font-bold text-center text-gray-400 mb-2 uppercase tracking-widest">Multi-Channel Event Trigger</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => triggerNotification('schedule', 'Traffic Delay ⚠️', 'यातायात में देरी ⚠️', 'Your bus is delayed by 45 mins due to rain.', 'बारिश के कारण आपकी बस 45 मिनट लेट है।')} className="text-[10px] font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 py-1.5 rounded">Simulate Delay</button>
                          <button onClick={() => triggerNotification('cancellation', 'Trip Cancelled ❌', 'यात्रा रद्द ❌', 'Operator cancelled route. Refund initiated.', 'ऑपरेटर ने रूट रद्द कर दिया। रिफंड शुरू।')} className="text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 py-1.5 rounded">Simulate Cancel</button>
                          <button onClick={() => triggerNotification('reminder', 'Upcoming Trip 🕒', 'आगामी यात्रा 🕒', 'Your journey starts in 2 hours!', 'आपकी यात्रा ठीक 2 घंटे में शुरू होगी!')} className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 py-1.5 rounded">Simulate Reminder</button>
                          <button onClick={() => triggerNotification('promo', 'FLASH SALE! 🏷️', 'फ्लैश सेल! 🏷️', 'Use code REDBUS20 for 20% off.', '20% छूट के लिए REDBUS20 का उपयोग करें।')} className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600 py-1.5 rounded">Simulate Promo</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </nav>

        {/* Tab Switcher */}
        <div className="flex justify-center gap-4 p-4 mt-2">
          <button onClick={() => setActiveTab('planner')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'planner' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-800'}`}>{t('plannerTab')}</button>
          <button onClick={() => setActiveTab('community')} className={`px-6 py-2 rounded-full font-bold transition ${activeTab === 'community' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-800'}`}>{t('communityTab')}</button>
        </div>

        <main className="max-w-7xl mx-auto p-4 flex-grow w-full">
          {activeTab === 'planner' ? <RoutePlanner /> : <CommunityFeed />}
        </main>

        <RedBusExtras />

        {/* Notification Channel Preferences Modal */}
        {showPrefModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl max-w-sm w-full space-y-4 text-gray-800 dark:text-gray-100">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-lg">Channel Preferences</h3>
                <button onClick={() => setShowPrefModal(false)}><X size={18} /></button>
              </div>
              <div className="space-y-3">
                <label className="flex justify-between items-center cursor-pointer">
                  <span>Email Alerts</span>
                  <input type="checkbox" defaultChecked className="h-5 w-5 text-red-600" />
                </label>
                <label className="flex justify-between items-center cursor-pointer">
                  <span>Push Notifications</span>
                  <input type="checkbox" defaultChecked className="h-5 w-5 text-red-600" />
                </label>
                <label className="flex justify-between items-center cursor-pointer">
                  <span>Promotional Offers</span>
                  <input type="checkbox" className="h-5 w-5 text-red-600" />
                </label>
              </div>
              <button onClick={() => setShowPrefModal(false)} className="w-full bg-red-600 text-white font-bold py-2 rounded-xl mt-4">Save Channel Preferences</button>
            </div>
          </div>
        )}

      </div>
    </AppContext.Provider>
  );
}