const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['Kharid', 'Bikri', 'Payment In', 'Payment Out']
    },
    date: { type: String, required: true },      // yyyy-mm-dd from <input type="date">
    party: { type: String, required: true, trim: true },
    item: { type: String, default: '', trim: true },
    amount: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Entry', entrySchema);
