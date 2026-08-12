import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Bus, Armchair, CreditCard, CheckCircle2, Bookmark, Plus } from 'lucide-react';

export default function RoutePlanner() {
  const { isDark, t, triggerNotification } = useContext(AppContext);
  const [step, setStep] = useState('search'); 
  const [startLoc, setStartLoc] = useState('New Delhi');
  const [endLoc, setEndLoc] = useState('Hyderabad');
  const [waypoints, setWaypoints] = useState(['Vijayawada']);

  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookedPnr, setBookedPnr] = useState(null);

  const [passengerName, setPassengerName] = useState('Obed Ganta');
  const [passengerEmail, setPassengerEmail] = useState('');

  // Delhi to Hyderabad Coordinates with Waypoints
  const routeLine = [
    [28.6139, 77.2090], // Delhi
    [21.1458, 79.0882], // Nagpur
    [16.5062, 80.6480], // Vijayawada Waypoint
    [17.3850, 78.4867]  // Hyderabad
  ];

  useEffect(() => {
    fetch('http://localhost:5000/api/buses')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setBuses(data); });
  }, []);

  const handleSaveRoute = async () => {
    try {
      await fetch('http://localhost:5000/api/routes/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startLoc, endLoc, waypoints, distanceKm: 1420, estTime: "18h 30m" })
      });
      alert("Route saved to your profile for quick access!");
    } catch (e) { alert("Failed to save route."); }
  };

  const processPayment = async () => {
    if (!passengerName || !passengerEmail) {
      return alert("Please enter both Passenger Name and Email Address.");
    }

    setIsProcessing(true);
    const newPnr = "RB-" + Math.floor(10000 + Math.random() * 90000); 

    try {
      const res = await fetch('http://localhost:5000/api/book-seat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pnr: newPnr,
          route: `${startLoc} to ${endLoc}`,
          operator: selectedBus.operator,
          seatNumber: selectedSeat,
          passengerName,
          passengerEmail
        })
      });

      if (res.ok) {
        setBookedPnr(newPnr);
        setStep('success');
        triggerNotification('booking', 'Booking Confirmed!', 'बुकिंग की पुष्टि की गई!', `Seat ${selectedSeat} on ${selectedBus.operator}. PNR: ${newPnr}`, `सीट ${selectedSeat}, PNR: ${newPnr}`);
      } else {
        alert("Failed to confirm booking.");
      }
    } catch (e) {
      alert("Database error during payment processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  const mapUrl = isDark 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border dark:border-gray-700 min-h-[500px] overflow-hidden">
      
      {step === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          <div className="p-6 col-span-1 flex flex-col gap-4 border-r dark:border-gray-700">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Navigation className="text-red-600" /> {t('plannerTab')}</h2>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="text" value={startLoc} onChange={e => setStartLoc(e.target.value)} placeholder={t('startLoc')} className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border outline-none" />
            </div>

            {waypoints.map((wp, idx) => (
              <input key={idx} type="text" value={wp} onChange={e => { const updated = [...waypoints]; updated[idx] = e.target.value; setWaypoints(updated); }} placeholder={`Waypoint ${idx + 1}`} className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-dashed outline-none" />
            ))}

            <button onClick={() => setWaypoints([...waypoints, ''])} className="text-xs text-blue-600 font-bold hover:underline self-start flex items-center gap-1">
              <Plus size={14} /> Add Waypoint
            </button>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-red-600" size={20} />
              <input type="text" value={endLoc} onChange={e => setEndLoc(e.target.value)} placeholder={t('dest')} className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border outline-none" />
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border space-y-2">
              <span className="text-xs font-bold text-gray-400">{t('traffic')}</span>
              <div className="text-xs font-bold text-red-500">{t('primary')}</div>
              <div className="text-xs font-bold text-green-600">{t('alt')}</div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep('results')} className="flex-1 bg-red-600 text-white font-bold py-3.5 rounded-xl hover:bg-red-700 shadow-md">
                {t('findBuses')}
              </button>
              <button onClick={handleSaveRoute} className="p-3.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-200">
                <Bookmark size={20} />
              </button>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2 h-[450px] lg:h-auto relative z-0">
            <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={false} className="h-full w-full">
              <TileLayer url={mapUrl} attribution='&copy; OpenStreetMap' />
              <Polyline positions={routeLine} color="red" weight={5} opacity={0.8} />
              <Marker position={[28.6139, 77.2090]}><Popup>Start: New Delhi</Popup></Marker>
              <Marker position={[17.3850, 78.4867]}><Popup>Destination: Hyderabad</Popup></Marker>
            </MapContainer>
          </div>
        </div>
      )}

      {step === 'results' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Bus className="text-red-600" /> Available Buses</h2>
            <button onClick={() => setStep('search')} className="text-blue-600 hover:underline">← Back to Map</button>
          </div>

          <div className="space-y-4">
            {buses.map(bus => (
              <div key={bus._id} className="border dark:border-gray-700 rounded-xl p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <h3 className="font-bold text-lg">{bus.operator}</h3>
                  <p className="text-sm text-gray-500">{bus.route}</p>
                </div>
                <button onClick={() => { setSelectedBus(bus); setStep('seats'); }} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold">
                  Select Seats
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'seats' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Armchair className="text-red-600" /> Select Seat</h2>
            <button onClick={() => setStep('results')} className="text-blue-600 hover:underline">← Back</button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-8 rounded-xl flex justify-center">
              <div className="grid grid-cols-4 gap-4 w-64 border-4 p-4 rounded-3xl relative pt-10">
                <div className="absolute top-2 right-4 text-xs font-bold text-gray-400">DRIVER</div>
                {Array.from({ length: 20 }).map((_, i) => {
                  const seatNum = `S${i + 1}`;
                  return (
                    <button key={seatNum} onClick={() => setSelectedSeat(seatNum)} className={`h-10 w-10 rounded font-bold text-sm ${selectedSeat === seatNum ? 'bg-green-500 text-white' : 'bg-white border-2 border-green-500 text-black'}`}>
                      {seatNum}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border h-fit">
              <h3 className="font-bold border-b pb-2 mb-4">Journey Summary</h3>
              <p className="font-bold">{selectedBus?.operator}</p>
              <p className="text-sm text-gray-500 mb-4">{startLoc} to {endLoc}</p>
              <div className="flex justify-between mb-4"><span>Selected Seat:</span><span className="font-bold">{selectedSeat || 'None'}</span></div>
              <button onClick={() => setStep('checkout')} disabled={!selectedSeat} className={`w-full py-3 rounded-xl font-bold text-white ${selectedSeat ? 'bg-red-600' : 'bg-gray-400'}`}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'checkout' && (
        <div className="p-8 max-w-lg mx-auto text-center space-y-6">
          <CreditCard size={48} className="text-red-600 mx-auto" />
          <h2 className="text-2xl font-bold">{t('book')}</h2>
          
          <div className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Passenger Full Name</label>
              <input type="text" value={passengerName} onChange={(e) => setPassengerName(e.target.value)} placeholder="Full Name" className="w-full p-3 mt-1 bg-gray-50 dark:bg-gray-700 rounded-xl border outline-none" />
            </div>
            
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address (For Ticket Delivery)</label>
              <input type="email" value={passengerEmail} onChange={(e) => setPassengerEmail(e.target.value)} placeholder="passenger@email.com" className="w-full p-3 mt-1 bg-gray-50 dark:bg-gray-700 rounded-xl border outline-none" />
            </div>
          </div>

          <button onClick={processPayment} disabled={isProcessing} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition">
            {isProcessing ? 'Processing Ticket...' : t('book')}
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="p-12 text-center flex flex-col items-center">
          <CheckCircle2 size={80} className="text-green-500 mb-4" />
          <h2 className="text-3xl font-black mb-2">{t('success')}</h2>
          <p className="font-bold mb-2">PNR: <span className="text-red-600">{bookedPnr}</span></p>
          <p className="text-sm text-gray-500 mb-6 max-w-md">Your ticket details have been logged and dispatched via SMTP email to {passengerEmail}. Use this PNR in the reviews section after your trip!</p>
          <button onClick={() => { setStep('search'); setSelectedSeat(null); }} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold">{t('returnMap')}</button>
        </div>
      )}

    </div>
  );
}