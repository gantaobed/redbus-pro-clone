const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// MONGODB CONNECTION
// ==========================================
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://obedganta_db_user:Obedganta15@cluster0.xuwqxth.mongodb.net/redbus?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected: Commercial Schemas Ready"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ==========================================
// CLOUDINARY CONFIGURATION (TASK 1)
// ==========================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '123456789',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'redbus_community_photos',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});
const upload = multer({ storage: storage });

// ==========================================
// MONGODB SCHEMAS & MODELS
// ==========================================

// Task 1 & Task 6: Reviews & Forum Schemas
const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  pnr: { type: String, required: true },
  verifiedJourney: { type: Boolean, default: true },
  route: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true, minlength: 20 },
  upvotes: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
  hidden: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const communityPostSchema = new mongoose.Schema({
  author: { type: String, required: true },
  isVerified: { type: Boolean, default: true },
  topic: { type: String, enum: ['Routes', 'Destinations', 'Travel Advice'], default: 'Travel Advice' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  photoUrl: { type: String, default: "" },
  likes: { type: Number, default: 0 },
  comments: [{ author: String, text: String, createdAt: { type: Date, default: Date.now } }],
  reports: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Task 2: Advanced Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: { type: String, default: "user_default" },
  type: { type: String, enum: ['booking', 'cancellation', 'schedule', 'reminder', 'promo'], required: true },
  title: { type: Object, required: true },
  message: { type: Object, required: true },
  channel: { type: String, enum: ['email', 'push', 'in-app'], default: 'in-app' },
  status: { type: String, enum: ['delivered', 'pending', 'failed'], default: 'delivered' },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

// Task 3 & Task 5: User Preferences Schema
const userPrefSchema = new mongoose.Schema({
  userId: { type: String, default: "user_default", unique: true },
  emailNotifs: { type: Boolean, default: true },
  pushNotifs: { type: Boolean, default: true },
  promoNotifs: { type: Boolean, default: false },
  language: { type: String, default: "en" },
  theme: { type: String, default: "light" }
});

// Task 4: Saved Routes Schema
const savedRouteSchema = new mongoose.Schema({
  userId: { type: String, default: "user_default" },
  startLoc: String,
  endLoc: String,
  waypoints: [String],
  distanceKm: Number,
  estTime: String,
  createdAt: { type: Date, default: Date.now }
});

// Bus Booking Schema
const busBookingSchema = new mongoose.Schema({
  pnr: { type: String, unique: true },
  route: String,
  operator: String,
  seatNumber: String,
  passengerName: String,
  passengerEmail: String,
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'completed' },
  hasReviewed: { type: Boolean, default: false },
  bookedAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);
const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const UserPref = mongoose.model('UserPref', userPrefSchema);
const SavedRoute = mongoose.model('SavedRoute', savedRouteSchema);
const BusBooking = mongoose.model('BusBooking', busBookingSchema);

// ==========================================
// REST API ENDPOINTS
// ==========================================

// --- TASK 1: Cloud Photo Upload Endpoint ---
app.post('/api/upload', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image file provided." });
    res.json({ photoUrl: req.file.path });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TASK 1: Community Posts & Discussions ---
app.get('/api/community/posts', async (req, res) => {
  try {
    const { topic } = req.query;
    const filter = topic && topic !== 'All' ? { topic, reports: { $lt: 3 } } : { reports: { $lt: 3 } };
    const posts = await CommunityPost.find(filter).sort({ likes: -1, createdAt: -1 });
    res.json(posts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/community/posts', async (req, res) => {
  try {
    const { author, isVerified, topic, title, content, photoUrl } = req.body;
    if (!isVerified) return res.status(403).json({ error: "Only verified travelers can create community posts." });
    
    const post = new CommunityPost({ author, isVerified, topic, title, content, photoUrl });
    await post.save();
    res.json(post);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/community/posts/:id/like', async (req, res) => {
  try {
    const post = await CommunityPost.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    res.json(post);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/community/posts/:id/comment', async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    post.comments.push({ author: req.body.author, text: req.body.text });
    await post.save();
    res.json(post);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/community/posts/:id/report', async (req, res) => {
  try {
    const post = await CommunityPost.findByIdAndUpdate(req.params.id, { $inc: { reports: 1 } }, { new: true });
    res.json({ message: "Post reported for moderation review.", post });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- TASK 6: Verified Journey Reviews ---
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ hidden: false }).sort({ createdAt: -1 });
    const avgRating = reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "5.0";
    res.json({ reviews, avgRating, total: reviews.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { user, pnr, route, rating, text } = req.body;
    
    const booking = await BusBooking.findOne({ pnr });
    if (!booking || booking.status !== 'completed') {
      return res.status(400).json({ error: "Reviews can only be submitted for completed journeys verified by PNR." });
    }
    if (booking.hasReviewed) {
      return res.status(400).json({ error: "You have already submitted a review for this journey." });
    }
    if (text.length < 20) {
      return res.status(400).json({ error: "Reviews must be at least 20 characters long." });
    }

    const review = new Review({ user, pnr, route, rating, text, verifiedJourney: true });
    await review.save();

    booking.hasReviewed = true;
    await booking.save();

    res.json(review);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    // Enforce 24-Hour Edit Window Constraint
    const hoursElapsed = (Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursElapsed > 24) {
      return res.status(400).json({ error: "Review edit window (24 hours) has expired." });
    }

    review.text = req.body.text || review.text;
    review.rating = req.body.rating || review.rating;
    await review.save();
    res.json(review);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reviews/:id/report', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    review.reportCount += 1;
    if (review.reportCount >= 2) review.hidden = true; 
    await review.save();
    res.json({ message: review.hidden ? "Review hidden due to safety policy." : "Review reported." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- TASK 2: Notification History & Preferences ---
app.get('/api/notifications', async (req, res) => {
  try {
    const list = await Notification.find().sort({ timestamp: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const notif = new Notification(req.body);
    await notif.save();
    res.json(notif);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/user/preferences', async (req, res) => {
  try {
    let pref = await UserPref.findOne({ userId: "user_default" });
    if (!pref) pref = await UserPref.create({ userId: "user_default" });
    res.json(pref);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/user/preferences', async (req, res) => {
  try {
    const pref = await UserPref.findOneAndUpdate({ userId: "user_default" }, req.body, { new: true, upsert: true });
    res.json(pref);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- TASK 4: Saved Routes ---
app.get('/api/routes/saved', async (req, res) => {
  try {
    const routes = await SavedRoute.find().sort({ createdAt: -1 });
    res.json(routes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/routes/saved', async (req, res) => {
  try {
    const { startLoc, endLoc, waypoints, distanceKm, estTime } = req.body;
    const route = new SavedRoute({ startLoc, endLoc, waypoints, distanceKm, estTime });
    await route.save();
    res.json(route);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- BUS BOOKINGS & SMTP NOTIFICATION DISPATCH ---
app.get('/api/buses', async (req, res) => {
  try {
    let bookings = await BusBooking.find();
    if (bookings.length === 0) {
      bookings = await BusBooking.insertMany([
        { pnr: "RB-99812", route: "New Delhi to Hyderabad", operator: "APSRTC Garuda Plus", seatNumber: "S4", passengerName: "Obed Ganta", passengerEmail: "obed@example.com", status: "completed", hasReviewed: false },
        { pnr: "RB-77123", route: "New Delhi to Vijayawada", operator: "TSRTC Super Luxury", seatNumber: "S10", passengerName: "Obed Ganta", passengerEmail: "obed@example.com", status: "upcoming", hasReviewed: false }
      ]);
    }
    res.json(bookings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/book-seat', async (req, res) => {
  try {
    const { pnr, route, operator, seatNumber, passengerName, passengerEmail } = req.body;
    const newBooking = new BusBooking({
      pnr, route, operator, seatNumber, passengerName, passengerEmail, status: 'completed', hasReviewed: false
    });
    await newBooking.save();

    // Log Notification to Database
    const notifLog = new Notification({
      type: 'booking',
      title: { en: 'Booking Confirmed!', hi: 'बुकिंग की पुष्टि की गई!' },
      message: { en: `Seat ${seatNumber} on ${operator}. PNR: ${pnr}`, hi: `सीट ${seatNumber}, ${operator}. PNR: ${pnr}` },
      channel: 'email',
      status: 'delivered'
    });
    await notifLog.save();

    // Real SMTP Email Dispatch via Nodemailer
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: passengerEmail,
        subject: `RedBus Pro: Booking Confirmed (PNR: ${pnr})`,
        text: `Hello ${passengerName},\n\nYour bus ticket for ${route} has been successfully booked with ${operator}.\n\nSeat Number: ${seatNumber}\nPNR Number: ${pnr}\n\nThank you for choosing RedBus Pro!\nSafe Travels.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("❌ SMTP Dispatch Warning:", error.message);
        } else {
          console.log(`✅ Ticket Email Dispatched to ${passengerEmail}: ` + info.response);
        }
      });
    }

    res.json(newBooking);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 RedBus Pro Commercial Backend API running on port ${PORT}`));