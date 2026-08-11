import { useContext, useState } from 'react';
import { AppContext } from '../App';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Plus, Navigation, AlertTriangle } from 'lucide-react';

const i18n = {
  en: { title: 'Plan Your Journey', start: 'Start Location', dest: 'Destination', add: 'Add Waypoint', search: 'Find Routes', traffic: 'Heavy traffic detected on primary route. Suggesting alternative (+15m).' },
  hi: { title: 'अपनी यात्रा की योजना बनाएं', start: 'शुरुआती स्थान', dest: 'मंज़िल', add: 'पड़ाव जोड़ें', search: 'रास्ते खोजें', traffic: 'प्राथमिक मार्ग पर भारी ट्रैफ़िक. वैकल्पिक सुझाव (+15m).' }
};

export default function RoutePlanner() {
  const { lang, isDark } = useContext(AppContext);
  const t = i18n[lang];
  const [waypoints, setWaypoints] = useState([{ id: 1, val: '' }]);

  const addWaypoint = () => {
    if (waypoints.length < 3) {
      setWaypoints([...waypoints, { id: Date.now(), val: '' }]);
    }
  };

  const mapUrl = isDark 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border dark:border-gray-700">
      
      {/* Controls */}
      <div className="p-6 lg:p-8 col-span-1 flex flex-col gap-5">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Navigation className="text-red-600" /> {t.title}</h2>
        
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
          <input type="text" placeholder={t.start} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition" />
        </div>

        {waypoints.map((wp, index) => (
          <div key={wp.id} className="relative flex items-center gap-2">
            <div className="w-full relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500"></div>
              <input type="text" placeholder={`Waypoint ${index + 1}`} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-dashed dark:border-gray-600 rounded-xl outline-none" />
            </div>
          </div>
        ))}

        {waypoints.length < 3 && (
          <button onClick={addWaypoint} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline">
            <Plus size={16} /> {t.add}
          </button>
        )}

        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-red-600" size={20} />
          <input type="text" placeholder={t.dest} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition" />
        </div>

        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/30 transition-all transform hover:-translate-y-1">
          {t.search}
        </button>

        {/* Dynamic Traffic Alert */}
        <div className="mt-2 flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl border border-yellow-200 dark:border-yellow-800/50">
          <AlertTriangle className="shrink-0 text-yellow-500" />
          <p className="text-sm font-medium">{t.traffic}</p>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="col-span-1 lg:col-span-2 h-[400px] lg:h-auto bg-gray-200 relative z-0">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={false} className="h-full w-full">
          <TileLayer url={mapUrl} attribution='&copy; OpenStreetMap contributors' />
        </MapContainer>
      </div>
    </div>
  );
}