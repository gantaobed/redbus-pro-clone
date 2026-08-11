import { useContext } from 'react';
import { AppContext } from '../App';
import { Tag, Shield, Clock, Award } from 'lucide-react';

export default function RedBusExtras() {
  const { lang } = useContext(AppContext);

  const t = {
    en: {
      offers: 'Trending Offers',
      rtc: 'Official Partner of RTCs',
      rtcDesc: 'Book official government bus tickets for reliable and safe travel.',
      features: 'Why Choose Us',
      f1: 'Unmatched Security', f1d: 'Safe and secure online payments.',
      f2: '24/7 Support', f2d: 'We are here to help anytime.',
      f3: 'On-Time Guarantee', f3d: 'Reliable tracking and schedules.'
    },
    hi: {
      offers: 'ट्रेंडिंग ऑफ़र',
      rtc: 'RTC के आधिकारिक भागीदार',
      rtcDesc: 'विश्वसनीय और सुरक्षित यात्रा के लिए आधिकारिक सरकारी बस टिकट बुक करें।',
      features: 'हमें क्यों चुनें',
      f1: 'अतुलनीय सुरक्षा', f1d: 'सुरक्षित ऑनलाइन भुगतान।',
      f2: '24/7 सहायता', f2d: 'हम किसी भी समय मदद के लिए यहां हैं।',
      f3: 'समय की गारंटी', f3d: 'विश्वसनीय ट्रैकिंग और समय सारिणी।'
    }
  }[lang];

  return (
    <div className="w-full mt-12 space-y-16">
      
      {/* Original RedBus Feature: Offers Section */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Tag className="text-red-600" /> {t.offers}
        </h2>
        <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar">
          {/* Offer 1 */}
          <div className="min-w-[300px] p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
            <div className="text-sm font-bold bg-white/20 inline-block px-2 py-1 rounded mb-2">BUS</div>
            <h3 className="font-bold text-lg">Save up to Rs 250 on AP & TS routes</h3>
            <p className="text-sm text-blue-100 mt-1">Valid till month end</p>
            <div className="mt-4 border border-dashed border-white/50 bg-white/10 px-3 py-1 rounded text-center font-mono font-bold tracking-widest">
              FIRST
            </div>
          </div>
          {/* Offer 2 */}
          <div className="min-w-[300px] p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-800 text-white shadow-lg">
            <div className="text-sm font-bold bg-white/20 inline-block px-2 py-1 rounded mb-2">HOLIDAY</div>
            <h3 className="font-bold text-lg">Flat 10% off on Delhi Transport</h3>
            <p className="text-sm text-emerald-100 mt-1">For registered users</p>
            <div className="mt-4 border border-dashed border-white/50 bg-white/10 px-3 py-1 rounded text-center font-mono font-bold tracking-widest">
              DELHI10
            </div>
          </div>
          {/* Offer 3 */}
          <div className="min-w-[300px] p-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-800 text-white shadow-lg">
            <div className="text-sm font-bold bg-white/20 inline-block px-2 py-1 rounded mb-2">NEW</div>
            <h3 className="font-bold text-lg">Get Rs 150 Cashback on First Trip</h3>
            <p className="text-sm text-purple-100 mt-1">Minimum ticket value Rs 500</p>
            <div className="mt-4 border border-dashed border-white/50 bg-white/10 px-3 py-1 rounded text-center font-mono font-bold tracking-widest">
              NEW150
            </div>
          </div>
        </div>
      </section>

      {/* Original RedBus Feature: Government RTC Partners */}
      <section className="bg-white dark:bg-gray-800 py-12 border-y dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.rtc}</h2>
              <p className="text-gray-600 dark:text-gray-400">{t.rtcDesc}</p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <span className="px-6 py-3 bg-gray-100 dark:bg-gray-700 font-bold rounded-xl shadow-sm">APSRTC</span>
              <span className="px-6 py-3 bg-gray-100 dark:bg-gray-700 font-bold rounded-xl shadow-sm">TSRTC</span>
              <span className="px-6 py-3 bg-gray-100 dark:bg-gray-700 font-bold rounded-xl shadow-sm">Delhi Transport (DTC)</span>
              <span className="px-6 py-3 bg-gray-100 dark:bg-gray-700 font-bold rounded-xl shadow-sm">KSRTC</span>
            </div>
          </div>
        </div>
      </section>

      {/* Original RedBus Feature: Trust & Safety Cards */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-8 text-center">{t.features}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700">
            <Shield size={48} className="text-red-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">{t.f1}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t.f1d}</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700">
            <Award size={48} className="text-red-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">{t.f2}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t.f2d}</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700">
            <Clock size={48} className="text-red-600 mb-4" />
            <h3 className="font-bold text-lg mb-2">{t.f3}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t.f3d}</p>
          </div>
        </div>
      </section>

      {/* Original RedBus Feature: Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 text-sm">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">🚌 RedBus Pro</h3>
            <p className="text-gray-400 mb-4">The world's largest online bus ticket booking service, trusted by over 25 million happy customers globally.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Top Bus Routes</h4>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer transition">Hyderabad to Bangalore</li>
              <li className="hover:text-white cursor-pointer transition">Delhi to Manali</li>
              <li className="hover:text-white cursor-pointer transition">Chennai to Coimbatore</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">About</h4>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer transition">About Us</li>
              <li className="hover:text-white cursor-pointer transition">Contact Us</li>
              <li className="hover:text-white cursor-pointer transition">Terms & Conditions</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Global Presence</h4>
            <ul className="space-y-2">
              <li className="hover:text-white cursor-pointer transition">India</li>
              <li className="hover:text-white cursor-pointer transition">Singapore</li>
              <li className="hover:text-white cursor-pointer transition">Malaysia</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
          © 2026 OBED GANTA . All rights reserved.
        </div>
      </footer>
    </div>
  );
}