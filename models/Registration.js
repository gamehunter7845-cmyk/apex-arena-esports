const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
    },

    teamName: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },

    playerIGN: {
      type: String,
      required: [true, 'Player IGN is required'],
      trim: true,
    },

    whatsappNumber: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Enter a valid 10-digit WhatsApp number'],
    },
  },
  {
    timestamps: true, // registeredAt = createdAt
  }
);

// ─── Compound Unique Index ──────────────────────────────────
// Prevents same WhatsApp number from registering twice
// in the same tournament
registrationSchema.index(
  { tournament: 1, whatsappNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model('Registration', registrationSchema);