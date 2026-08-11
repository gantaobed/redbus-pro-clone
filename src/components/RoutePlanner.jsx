import { useContext, useState } from 'react';
import { AppContext } from '../App';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Plus, Navigation, AlertTriangle, Bus, Armchair, CreditCard, CheckCircle2 } from 'lucide-react';

// Mock Data for Buses
const mockBuses = [
  { id: 1, operator: 'APSRTC Garuda Plus', time: '21:00 - 06:00', duration: '9h 00m', type: 'A/C Sleeper (2+1)', price: 1500, seatsLeft: 12 },
  { id: 2, operator: 'AbhiBus Prime', time: '19:00 - 05:30', duration: '10h 30m', type: 'Volvo Multi-Axle A/C', price: 2200, seatsLeft: 4 },
  { id: 3, operator: 'TSRTC Super Luxury', time: '22:30 - 08:00', duration: '9h 30m', type: 'Non A/C Seater (2+2)', price: 850, seatsLeft: 20 }
];

export default function RoutePlanner() {
  const { lang, isDark } = useContext(AppContext);
  
  // App States
  const [step, setStep] = useState('search'); // search, results, seats, checkout, success
  const [startLoc, setStartLoc] = useState('New Delhi');
  const [endLoc, setEndLoc] = useState('Hyderabad');
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSearch = () => {
    if (!startLoc || !endLoc) return alert("Please enter locations");
    setStep('results');
  };

  const handleSelectBus = (bus) => {
    setSelectedBus(bus);
    setStep('seats');
  };

  const handleSeatSelect = (seatNum) => {
    setSelectedSeat(seatNum);
  };

  const handleCheckout = () => {
    if (!selectedSeat) return alert("Please select a seat first");
    setStep('checkout');
  };

  const processPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
    }, 2000); // Simulate network delay
  };

  const mapUrl = isDark 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border dark:border-gray-700 min-h-[500px] overflow-hidden">
      
      {/* STEP 1: INITIAL SEARCH & MAP */}
      {step === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          <div className="p-6 lg:p-8 col-span-1 flex flex-col gap-5 border-r dark:border-gray-700">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Navigation className="text-red-600" /> Plan Journey</h2>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="text" value={startLoc} onChange={(e) => setStartLoc(e.target.value)} placeholder="Start Location (e.g., New Delhi)" className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
            </div>

            <div className="relative flex items-center gap-2">
              <div className="w-full relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500"></div>
                <input type="text" placeholder="Waypoint (e.g., Vijayawada)" className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-dashed dark:border-gray-600 rounded-xl outline-none" />
              </div>
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-red-600" size={20} />
              <input type="text" value={endLoc} onChange={(e) => setEndLoc(e.target.value)} placeholder="Destination (e.g., Hyderabad)" className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
            </div>

            <button onClick={handleSearch} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all">
              Find Routes & Buses
            </button>

            <div className="mt-2 flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl border border-yellow-200 dark:border-yellow-800/50">
              <AlertTriangle className="shrink-0 text-yellow-500" />
              <p className="text-sm font-medium">Heavy traffic detected on primary route. Suggesting alternative (+15m).</p>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2 h-[400px] lg:h-auto bg-gray-200 relative z-0">
            <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={false} className="h-full w-full">
              <TileLayer url={mapUrl} attribution='&copy; OpenStreetMap' />
            </MapContainer>
          </div>
        </div>
      )}

      {/* STEP 2: BUS RESULTS */}
      {step === 'results' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Bus className="text-red-600" /> Available Buses</h2>
            <button onClick={() => setStep('search')} className="text-blue-600 hover:underline">← Back to Search</button>
          </div>
          <p className="text-gray-500 mb-4 font-bold">{startLoc} to {endLoc}</p>
          
          <div className="space-y-4">
            {mockBuses.map(bus => (
              <div key={bus.id} className="border dark:border-gray-600 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center bg-gray-50 dark:bg-gray-700/50 hover:shadow-md transition">
                <div>
                  <h3 className="font-bold text-lg">{bus.operator}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{bus.type}</p>
                </div>
                <div className="text-center my-4 md:my-0">
                  <p className="font-bold text-xl">{bus.time}</p>
                  <p className="text-xs text-gray-500">{bus.duration}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="text-2xl font-black text-red-600">₹{bus.price}</p>
                  <p className="text-xs text-green-600 font-bold">{bus.seatsLeft} Seats Left</p>
                  <button onClick={() => handleSelectBus(bus)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold">
                    View Seats
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: SEAT SELECTION */}
      {step === 'seats' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Armchair className="text-red-600" /> Select Seat</h2>
            <button onClick={() => setStep('results')} className="text-blue-600 hover:underline">← Back to Buses</button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-8 rounded-xl flex justify-center">
              <div className="grid grid-cols-4 gap-4 w-64 border-4 border-gray-300 dark:border-gray-600 p-4 rounded-3xl relative pt-12">
                <div className="absolute top-4 right-4 text-xs font-bold text-gray-400">DRIVER</div>
                {Array.from({length: 20}).map((_, i) => {
                  const seatNum = `S${i+1}`;
                  const isOccupied = i === 2 || i === 7 || i === 12;
                  const isSelected = selectedSeat === seatNum;
                  return (
                    <button 
                      key={seatNum} 
                      disabled={isOccupied}
                      onClick={() => handleSeatSelect(seatNum)}
                      className={`h-12 w-12 rounded flex items-center justify-center font-bold text-sm transition-colors ${
                        isOccupied ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed' 
                        : isSelected ? 'bg-green-500 text-white' 
                        : 'bg-white dark:bg-gray-800 border-2 border-green-500 hover:bg-green-100 dark:hover:bg-green-900 cursor-pointer'
                      }`}
                    >
                      {seatNum}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border dark:border-gray-600 h-fit">
              <h3 className="font-bold text-lg border-b dark:border-gray-600 pb-2 mb-4">Journey Summary</h3>
              <p className="font-bold">{selectedBus?.operator}</p>
              <p className="text-sm text-gray-500 mb-4">{startLoc} → {endLoc}</p>
              
              <div className="flex justify-between mb-2">
                <span>Selected Seat:</span>
                <span className="font-bold">{selectedSeat || 'None'}</span>
              </div>
              <div className="flex justify-between font-black text-lg mb-6 border-t dark:border-gray-600 pt-2">
                <span>Total Amount:</span>
                <span className="text-red-600">₹{selectedSeat ? selectedBus?.price : '0'}</span>
              </div>
              
              <button onClick={handleCheckout} disabled={!selectedSeat} className={`w-full py-3 rounded font-bold text-white transition-colors ${selectedSeat ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}>
                Proceed to Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: CHECKOUT */}
      {step === 'checkout' && (
        <div className="p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6"><CreditCard className="text-red-600" /> Secure Checkout</h2>
          
          <div className="space-y-4 mb-6">
            <input type="text" placeholder="Full Name" className="w-full p-3 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 outline-none" />
            <input type="email" placeholder="Email Address" className="w-full p-3 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 outline-none" />
            <input type="tel" placeholder="Mobile Number" className="w-full p-3 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 outline-none" />
          </div>

          <button onClick={processPayment} disabled={isProcessing} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2">
            {isProcessing ? 'Processing Transaction...' : `Pay ₹${selectedBus?.price} Securely`}
          </button>
          <button onClick={() => setStep('seats')} className="w-full mt-4 text-gray-500 hover:underline">Cancel</button>
        </div>
      )}

      {/* STEP 5: SUCCESS */}
      {step === 'success' && (
        <div className="p-12 text-center flex flex-col items-center">
          <CheckCircle2 size={80} className="text-green-500 mb-6" />
          <h2 className="text-3xl font-black mb-2">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-8">Your ticket details have been sent to your email and phone.</p>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 w-full max-w-md text-left">
            <div className="flex justify-between border-b pb-2 mb-2 dark:border-gray-600">
              <span className="text-gray-500">PNR No:</span>
              <span className="font-bold font-mono">RB-{Math.floor(Math.random() * 1000000)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-500">Route:</span>
              <span className="font-bold">{startLoc} to {endLoc}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-500">Bus:</span>
              <span className="font-bold">{selectedBus?.operator}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-500">Seat:</span>
              <span className="font-bold text-red-600">{selectedSeat}</span>
            </div>
          </div>

          <button onClick={() => { setStep('search'); setSelectedSeat(null); setSelectedBus(null); }} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold">
            Book Another Ticket
          </button>
        </div>
      )}

    </div>
  );
}