import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Bus, Armchair, CreditCard, CheckCircle2, Bookmark } from 'lucide-react';

export default function RoutePlanner() {
  const { isDark, t, triggerNotification } = useContext(AppContext);
  const [step, setStep] = useState('search'); 
  const [startLoc, setStartLoc] = useState('New Delhi');
  const [endLoc, setEndLoc] = useState('Hyderabad');
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookedPnr, setBookedPnr] = useState(null);

  // TASK 4: Real Map Coordinates for Routing Polyline
  const delhiCoords = [28.6139, 77.2090];
  const hyderabadCoords = [17.3850, 78.4867];
  const routeLine = [delhiCoords, [21.1458, 79.0882], hyderabadCoords]; // Route via Nagpur

  useEffect(() => {
    fetch('http://localhost:5000/api/buses').then(res => res.json()).then(data => setBuses(data));
  }, []);

  const processPayment = async () => {
    const newPnr = "RB-" + Math.floor(10000 + Math.random() * 90000); 
    try {
      const res = await fetch('http://localhost:5000/api/book-seat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pnr: newPnr, route: `${startLoc} to ${endLoc}`, operator: selectedBus.operator, seatNumber: selectedSeat, passengerName: "Obed Ganta" })
      });
      if (res.ok) {
        setBookedPnr(newPnr);
        setStep('success');
        // TASK 2: Trigger Real-time automated notification
        triggerNotification('Booking Confirmed!', `Seat ${selectedSeat} on ${selectedBus.operator}. PNR: ${newPnr}`);
      }
    } catch (e) { alert("Error saving to DB."); }
  };

  const mapUrl = isDark ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border dark:border-gray-700 min-h-[500px] overflow-hidden">
      {step === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          <div className="p-6 col-span-1 flex flex-col gap-4 border-r dark:border-gray-700">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Navigation className="text-red-600" /> {t('plannerTab')}</h2>
            <input type="text" value={startLoc} onChange={e => setStartLoc(e.target.value)} placeholder={t('startLoc')} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border outline-none" />
            <input type="text" value={endLoc} onChange={e => setEndLoc(e.target.value)} placeholder={t('dest')} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border outline-none" />
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border space-y-2">
              <span className="text-xs font-bold text-gray-400">{t('traffic')}</span>
              <div className="text-xs font-bold text-red-500">{t('primary')}</div>
              <div className="text-xs font-bold text-green-600">{t('alt')}</div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep('results')} className="flex-1 bg-red-600 text-white font-bold py-3.5 rounded-xl">{t('findBuses')}</button>
              <button className="p-3.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-200"><Bookmark size={20} /></button>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2 h-[450px] relative z-0 bg-gray-200 rounded-xl overflow-hidden">
            {/* The Ultimate Hackathon Map Fix: Dynamic Google Maps Routing */}
            <iframe 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              loading="lazy" 
              allowFullScreen 
              src={`https://www.google.com/maps?saddr=${encodeURIComponent(startLoc)}&daddr=${encodeURIComponent(endLoc)}&output=embed`}>
            </iframe>
          </div>
        </div>
      )}

      {step === 'results' && (
        <div className="p-6">
          <button onClick={() => setStep('search')} className="text-blue-600 mb-4 font-bold">← Back</button>
          <div className="space-y-4">
            {buses.map(bus => (
              <div key={bus._id} className="border dark:border-gray-700 rounded-xl p-4 flex justify-between bg-gray-50 dark:bg-gray-700/50">
                <div><h3 className="font-bold text-lg">{bus.operator}</h3><p className="text-sm text-gray-500">{bus.route}</p></div>
                <button onClick={() => { setSelectedBus(bus); setStep('seats'); }} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold">Select Seats</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'seats' && (
        <div className="p-6">
          <div className="flex gap-8">
            <div className="grid grid-cols-4 gap-4 bg-gray-100 dark:bg-gray-700 p-8 rounded-xl border-4">
              {Array.from({ length: 20 }).map((_, i) => {
                const seatNum = `S${i + 1}`;
                return (
                  <button key={seatNum} onClick={() => setSelectedSeat(seatNum)} className={`h-10 w-10 rounded font-bold text-sm ${selectedSeat === seatNum ? 'bg-green-500 text-white' : 'bg-white border-2 border-green-500'}`}>{seatNum}</button>
                );
              })}
            </div>
            <div className="w-1/3 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border">
              <h3 className="font-bold mb-4">Journey Summary</h3>
              <button onClick={() => setStep('checkout')} disabled={!selectedSeat} className={`w-full py-3 rounded-xl font-bold text-white ${selectedSeat ? 'bg-red-600' : 'bg-gray-400'}`}>Proceed to Checkout</button>
            </div>
          </div>
        </div>
      )}

      {step === 'checkout' && (
        <div className="p-8 max-w-lg mx-auto text-center space-y-4">
          <CreditCard size={48} className="text-red-600 mx-auto" />
          <h2 className="text-2xl font-bold">{t('book')}</h2>
          <button onClick={processPayment} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl">{t('book')}</button>
        </div>
      )}

      {step === 'success' && (
        <div className="p-12 text-center">
          <CheckCircle2 size={80} className="text-green-500 mb-4 mx-auto" />
          <h2 className="text-3xl font-black mb-2">{t('success')}</h2>
          <p className="font-bold mb-6">PNR: <span className="text-red-600">{bookedPnr}</span></p>
          <button onClick={() => { setStep('search'); setSelectedSeat(null); }} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold">{t('returnMap')}</button>
        </div>
      )}
    </div>
  );
}