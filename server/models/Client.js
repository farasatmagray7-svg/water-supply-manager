import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  area: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  rate_19l: { type: Number, default: 200 },
  rate_6l: { type: Number, default: 100 },
  rate_1_5l: { type: Number, default: 50 },
  rate_500ml: { type: Number, default: 30 },
  deposit_amount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Client', clientSchema);
