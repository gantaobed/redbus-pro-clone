const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://obedganta_db_user:Obedganta15@cluster0.xuwqxth.mongodb.net/redbus?appName=Cluster0")
  .then(() => console.log("✅ MongoDB Connected Programmatically"))
  .catch(err => console.log("❌ Connection Error: ", err));
  
// Database Schema
const busSchema = new mongoose.Schema({
  operator: String,
  route: String,
  price: Number,
  bookedSeats: [String] 
});

const Bus = mongoose.model('Bus', busSchema);

// API Endpoints
app.post('/api/setup-test-bus', async (req, res) => {
  try {
    const newBus = new Bus({
      operator: "APSRTC Garuda Plus",
      route: "New Delhi to Hyderabad",
      price: 1500,
      bookedSeats: ["S2", "S7", "S12"]
    });
    await newBus.save();
    res.json({ message: "Test bus successfully created in MongoDB!", bus: newBus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/buses', async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/book-seat', async (req, res) => {
  const { busId, seatNumber } = req.body;
  try {
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ error: "Bus not found." });
    
    if (bus.bookedSeats.includes(seatNumber)) {
      return res.status(400).json({ error: "Sorry, this seat was just booked by someone else!" });
    }

    bus.bookedSeats.push(seatNumber);
    await bus.save();
    res.json({ message: "Seat booked successfully!", bus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));