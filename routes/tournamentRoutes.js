const express = require('express');
const router = express.Router();
const {
  getRegisterPage,
  postRegister,
} = require('../controllers/tournamentController');

// ─── Public Registration ────────────────────────────────────
router.get('/:slug', getRegisterPage);
router.post('/:slug/register', postRegister);

module.exports = router;