const Tournament = require('../models/Tournament');
const Registration = require('../models/Registration');

// ─── GET /tournament/:slug ───────────────────────────────────
const getRegisterPage = async (req, res) => {
  try {
    const tournament = await Tournament.findOne({ slug: req.params.slug });

    if (!tournament) {
      return res.status(404).render('404', { title: 'Not Found' });
    }

    res.render('tournament/register', {
      title: `Register — ${tournament.name}`,
      tournament,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error.');
  }
};

// ─── POST /tournament/:slug/register ────────────────────────
const postRegister = async (req, res) => {
  const { teamName, playerIGN, whatsappNumber } = req.body;

  try {
    const tournament = await Tournament.findOne({ slug: req.params.slug });

    if (!tournament) {
      return res.status(404).send('Tournament not found.');
    }

    // ── Check if registration is open ──
    if (!tournament.isOpen) {
      return res.render('tournament/register', {
        title: `Register — ${tournament.name}`,
        tournament,
        error: 'Registration is closed for this tournament.',
      });
    }

    // ── Check for duplicate WhatsApp number ──
    const existing = await Registration.findOne({
      tournament: tournament._id,
      whatsappNumber,
    });

    if (existing) {
      return res.render('tournament/register', {
        title: `Register — ${tournament.name}`,
        tournament,
        error: 'This WhatsApp number is already registered for this tournament.',
      });
    }

    // ── Save registration ──
    const registration = new Registration({
      tournament: tournament._id,
      teamName,
      playerIGN,
      whatsappNumber,
    });

    await registration.save();

    // ── Check if max teams reached → close registration ──
    const totalRegistrations = await Registration.countDocuments({
      tournament: tournament._id,
    });

    if (totalRegistrations >= tournament.maxTeams) {
      await Tournament.findByIdAndUpdate(tournament._id, { isOpen: false });
    }

    // ── Render success page ──
    res.render('tournament/success', {
      title: 'Registration Successful!',
      tournament,
      teamName,
    });
  } catch (err) {
    // Handle MongoDB duplicate key error as fallback
    if (err.code === 11000) {
      const tournament = await Tournament.findOne({ slug: req.params.slug });
      return res.render('tournament/register', {
        title: `Register — ${tournament.name}`,
        tournament,
        error: 'This WhatsApp number is already registered for this tournament.',
      });
    }
    console.error(err);
    res.status(500).send('Server error.');
  }
};

module.exports = {
  getRegisterPage,
  postRegister,
};