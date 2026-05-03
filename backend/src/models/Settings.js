const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  logoUrl: { type: String, default: null },
  slideShows: [{ type: String }],
  totalViews: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
