import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  payment_date: { type: String, required: true }, // YYYY-MM-DD
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash', 'bank', 'jazzcash', 'easypaisa'], default: 'cash' },
  delivery: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery', default: null },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
