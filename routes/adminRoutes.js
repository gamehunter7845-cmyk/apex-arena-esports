const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authMiddleware');
const {
  getLogin,
  postLogin,
  logout,
  getDashboard,
  getCreate,
  postCreate,
  getParticipants,
  deleteRegistration,
  deleteTournament,
} = require('../controllers/adminController');

// ─── Auth ───────────────────────────────────────────────────
router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/logout', logout);

// ─── Dashboard ──────────────────────────────────────────────
router.get('/dashboard', isAdmin, getDashboard);

// ─── Tournament CRUD ────────────────────────────────────────
router.get('/tournament/create', isAdmin, getCreate);
router.post('/tournament/create', isAdmin, postCreate);
router.delete('/tournament/:id', isAdmin, deleteTournament);

// ─── Participants ───────────────────────────────────────────
router.get('/tournament/:id/participants', isAdmin, getParticipants);
router.delete('/registration/:id', isAdmin, deleteRegistration);

module.exports = router;