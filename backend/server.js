import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Plus, Navigation, AlertTriangle, Bus, Armchair, CreditCard, CheckCircle2, Database } from 'lucide-react';

export default function RoutePlanner() {
  const { lang, isDark } = useContext(AppContext);
  
  // App States
  const [step, setStep] = useState('search'); 
  const [startLoc, setStartLoc] = useState('New Delhi');
  const [endLoc, setEndLoc] = useState('Hyderabad');
  
  // Database States
  const [buses, setBuses] = useState([]); // Now stores real DB data
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // FETCH BUSES FROM MONGODB
  const fetchBusesFromDB = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/buses');
      const data = await res.json();
      setBuses(data);
    } catch (err) {
      console.error("Failed to fetch buses:", err);
    }
  };

  const handleSearch = () => {
    if (!startLoc || !endLoc) return alert("Please enter locations");
    fetchBusesFromDB(); // Get live data when searching
    setStep('results');
  };

  const handleSelectBus = (bus) => {
    setSelectedBus(bus);
    setStep('seats');
  };

  const handleCheckout = () => {
    if (!selectedSeat) return alert("Please select a seat first");
    setStep('checkout');
  };

  // SEND BOOKING TRANSACTION TO MONGODB
  const processPayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('http://localhost:5000/api/book-seat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ busId: selectedBus._id, seatNumber: selectedSeat })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStep('success'); // Seat successfully booked in DB!
      } else {
        // If someone else booked it a second before you did!
        alert("🚨 Booking Failed: " + data.error);
        setSelectedSeat(null);
        fetchBusesFromDB(); // Refresh the seats layout
        setStep('seats');
      }
    } catch (err) {
      alert("Database connection error during payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ADMIN DEV TOOL: Create a test bus in the database instantly
  const setupTestDatabase = async () => {
    try {
      await fetch('http://localhost:5000/api/setup-test-bus', { method: 'POST' });
      alert("Test Bus created in MongoDB! Refreshing list...");
      fetchBusesFromDB();
    } catch (err) {
      alert("Failed to create test bus. Is your backend running?");
    }
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
              <input type="text" value={startLoc} onChange={(e) => setStartLoc(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl outline-none" />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-red-600" size={20} />
              <input type="text" value={endLoc} onChange={(e) => setEndLoc(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl outline-none" />
            </div>

            <button onClick={handleSearch} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all">
              Find Routes & Buses
            </button>
          </div>

          <div className="col-span-1 lg:col-span-2 h-[400px] lg:h-auto bg-gray-200 relative z-0">
            <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={false} className="h-full w-full">
              <TileLayer url={mapUrl} attribution='&copy; OpenStreetMap' />
            </MapContainer>
          </div>
        </div>
      )}

      {/* STEP 2: BUS RESULTS FROM DATABASE */}
      {step === 'results' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Bus className="text-red-600" /> Live Database Buses</h2>
            <button onClick={() => setStep('search')} className="text-blue-600 hover:underline">← Back</button>
          </div>
          
          {buses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No buses found in MongoDB yet.</p>
              <button onClick={setupTestDatabase} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 mx-auto">
                <Database size={18} /> Initialize Test Bus in DB
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {buses.map(bus => (
                <div key={bus._id} className="border dark:border-gray-600 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center bg-gray-50 dark:bg-gray-700/50 hover:shadow-md transition">
                  <div>
                    <h3 className="font-bold text-lg">{bus.operator}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{bus.route}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-2xl font-black text-red-600">₹{bus.price}</p>
                    <button onClick={() => handleSelectBus(bus)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold">
                      View Seats
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: SEAT SELECTION (Reads Booked Seats from DB) */}
      {step === 'seats' && (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Armchair className="text-red-600" /> Select Seat</h2>
            <button onClick={() => setStep('results')} className="text-blue-600 hover:underline">← Back</button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-8 rounded-xl flex justify-center">
              <div className="grid grid-cols-4 gap-4 w-64 border-4 border-gray-300 dark:border-gray-600 p-4 rounded-3xl relative pt-12">
                <div className="absolute top-4 right-4 text-xs font-bold text-gray-400">DRIVER</div>
                {Array.from({length: 20}).map((_, i) => {
                  const seatNum = `S${i+1}`;
                  
                  // CHECK MONGODB DATA: Is this seat inside the bookedSeats array?
                  const isOccupied = selectedBus?.bookedSeats?.includes(seatNum);
                  const isSelected = selectedSeat === seatNum;
                  
                  return (
                    <button 
                      key={seatNum} 
                      disabled={isOccupied}
                      onClick={() => setSelectedSeat(seatNum)}
                      className={`h-12 w-12 rounded flex items-center justify-center font-bold text-sm transition-colors ${
                        isOccupied ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed' 
                        : isSelected ? 'bg-green-500 text-white' 
                        : 'bg-white dark:bg-gray-800 border-2 border-green-500 hover:bg-green-100 cursor-pointer'
                      }`}
                    >
                      {seatNum}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border dark:border-gray-600 h-fit">
              <h3 className="font-bold text-lg border-b pb-2 mb-4">Journey Summary</h3>
              <p className="font-bold">{selectedBus?.operator}</p>
              <div className="flex justify-between mb-2 mt-4">
                <span>Selected Seat:</span>
                <span className="font-bold">{selectedSeat || 'None'}</span>
              </div>
              <button onClick={handleCheckout} disabled={!selectedSeat} className={`w-full py-3 rounded font-bold text-white transition-colors mt-6 ${selectedSeat ? 'bg-red-600' : 'bg-gray-400'}`}>
                Proceed to Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4 & 5: CHECKOUT & SUCCESS (Same as before but connected to DB) */}
      {step === 'checkout' && (
        <div className="p-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6"><CreditCard className="text-red-600" /> Secure Checkout</h2>
          <button onClick={processPayment} disabled={isProcessing} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2">
            {isProcessing ? 'Saving to MongoDB...' : `Pay ₹${selectedBus?.price} Securely`}
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="p-12 text-center flex flex-col items-center">
          <CheckCircle2 size={80} className="text-green-500 mb-6" />
          <h2 className="text-3xl font-black mb-2">Booking Confirmed!</h2>
          <p className="text-gray-500 mb-8">Seat {selectedSeat} has been successfully saved to MongoDB.</p>
          <button onClick={() => { setStep('search'); setSelectedSeat(null); }} className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-full font-bold">
            Book Another Ticket
          </button>
        </div>
      )}
    </div>
  );
}