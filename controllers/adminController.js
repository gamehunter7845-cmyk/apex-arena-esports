const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');
const Tournament = require('../models/Tournament');
const Registration = require('../models/Registration');

// ─── GET /admin/login ───────────────────────────────────────
const getLogin = (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin/dashboard');
  res.render('admin/login', { title: 'Admin Login' });
};

// ─── POST /admin/login ──────────────────────────────────────
const postLogin = (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.isAdmin = true;
    req.flash('success_msg', 'Welcome back, Admin!');
    return res.redirect('/admin/dashboard');
  }

  req.flash('error_msg', 'Invalid username or password.');
  res.redirect('/admin/login');
};

// ─── GET /admin/logout ──────────────────────────────────────
const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
};

// ─── GET /admin/dashboard ───────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ createdAt: -1 });

    // Get registration count for each tournament
    const tournamentsWithCount = await Promise.all(
      tournaments.map(async (t) => {
        const count = await Registration.countDocuments({ tournament: t._id });
        return { ...t.toObject(), registrationCount: count };
      })
    );

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      tournaments: tournamentsWithCount,
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load dashboard.');
    res.redirect('/admin/login');
  }
};

// ─── GET /admin/tournament/create ───────────────────────────
const getCreate = (req, res) => {
  res.render('admin/create', { title: 'Create Tournament' });
};

// ─── POST /admin/tournament/create ──────────────────────────
const postCreate = async (req, res) => {
  const { name, date, time, roomId, roomPassword, whatsappLink, maxTeams } =
    req.body;

  try {
    const slug = nanoid(8); // e.g. "aB3xKp2Q"

    const tournament = new Tournament({
      name,
      date,
      time,
      roomId,
      roomPassword,
      whatsappLink,
      maxTeams: parseInt(maxTeams),
      slug,
    });

    await tournament.save();
    req.flash('success_msg', `Tournament created! Share link: /tournament/${slug}`);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to create tournament. Please try again.');
    res.redirect('/admin/tournament/create');
  }
};

// ─── GET /admin/tournament/:id/participants ──────────────────
const getParticipants = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      req.flash('error_msg', 'Tournament not found.');
      return res.redirect('/admin/dashboard');
    }

    const registrations = await Registration.find({
      tournament: tournament._id,
    }).sort({ createdAt: 1 });

    res.render('admin/participants', {
      title: `${tournament.name} — Participants`,
      tournament,
      registrations,
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load participants.');
    res.redirect('/admin/dashboard');
  }
};

// ─── DELETE /admin/registration/:id ─────────────────────────
const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) {
      req.flash('error_msg', 'Registration not found.');
      return res.redirect('/admin/dashboard');
    }

    // Re-open tournament if it was closed due to max teams
    await Tournament.findByIdAndUpdate(registration.tournament, {
      isOpen: true,
    });

    req.flash('success_msg', 'Participant removed successfully.');
    res.redirect(`/admin/tournament/${registration.tournament}/participants`);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to remove participant.');
    res.redirect('/admin/dashboard');
  }
};

// ─── DELETE /admin/tournament/:id ───────────────────────────
const deleteTournament = async (req, res) => {
  try {
    await Registration.deleteMany({ tournament: req.params.id });
    await Tournament.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Tournament deleted successfully.');
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to delete tournament.');
    res.redirect('/admin/dashboard');
  }
};

module.exports = {
  getLogin,
  postLogin,
  logout,
  getDashboard,
  getCreate,
  postCreate,
  getParticipants,
  deleteRegistration,
  deleteTournament,
};