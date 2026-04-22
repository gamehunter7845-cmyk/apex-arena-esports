const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tournament name is required'],
      trim: true,
    },

    date: {
      type: String,
      required: [true, 'Date is required'],
    },

    time: {
      type: String,
      required: [true, 'Time is required'],
    },

    roomId: {
      type: String,
      required: [true, 'Room ID is required'],
      trim: true,
    },

    roomPassword: {
      type: String,
      required: [true, 'Room Password is required'],
      trim: true,
    },

    whatsappLink: {
      type: String,
      required: [true, 'WhatsApp channel link is required'],
      trim: true,
    },

    maxTeams: {
      type: Number,
      required: [true, 'Maximum teams count is required'],
      min: [1, 'At least 1 team required'],
    },

    slug: {
      type: String,
      required: true,
      unique: true, // Each tournament gets a unique URL
      trim: true,
    },

    isOpen: {
      type: Boolean,
      default: true, // Registration open by default
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Tournament', tournamentSchema);