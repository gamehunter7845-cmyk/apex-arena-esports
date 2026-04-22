require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// ─── View Engine ───────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Static Files ──────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Body Parsing ──────────────────────────────────────────
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ─── Method Override (for DELETE forms) ────────────────────
app.use(methodOverride('_method'));

// ─── Session ───────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 hours
}));

// ─── Flash Messages ────────────────────────────────────────
app.use(flash());

// ─── Global Template Variables ─────────────────────────────
// Makes flash messages & session available in every EJS view
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.isAdmin = req.session.isAdmin || false;
  next();
});

// ─── Routes ────────────────────────────────────────────────
app.use('/admin', adminRoutes);
app.use('/tournament', tournamentRoutes);

// ─── Root Redirect ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.redirect('/admin/dashboard');
});

// ─── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send(`
    <div style="font-family:sans-serif; text-align:center; padding:60px; background:#0f0f0f; color:#fff; min-height:100vh;">
      <h1 style="color:#f97316;">404</h1>
      <p>Page not found.</p>
      <a href="/" style="color:#f97316;">Go Home</a>
    </div>
  `);
});

const Tournament = require('./models/Tournament');
const Registration = require('./models/Registration');
console.log('📦 Models loaded:', Tournament.modelName, Registration.modelName);

// ─── Start Server ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});