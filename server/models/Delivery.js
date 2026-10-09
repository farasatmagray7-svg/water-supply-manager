import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  delivery_date: { type: String, required: true }, // YYYY-MM-DD
  qty_19l: { type: Number, default: 0 },
  qty_6l: { type: Number, default: 0 },
  qty_1_5l: { type: Number, default: 0 },
  qty_500ml: { type: Number, default: 0 },
  returned_19l: { type: Number, default: 0 },
  total_amount: { type: Number, required: true },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Delivery', deliverySchema);
