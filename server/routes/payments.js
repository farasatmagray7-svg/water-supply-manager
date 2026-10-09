import express from 'express';
import Payment from '../models/Payment.js';
import Client from '../models/Client.js';
import Delivery from '../models/Delivery.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

const formatPayment = async (p) => {
  const obj = p.toObject ? p.toObject() : p;
  obj.id = obj._id;

  const clientDoc = p.client && p.client.name ? p.client : await Client.findById(p.client);
  if (clientDoc) {
    obj.client_id = clientDoc._id;
    obj.client_name = clientDoc.name;
    obj.client_phone = clientDoc.phone;
  }

  return obj;
};

// List payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, clientId, method } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.payment_date = {};
      if (startDate) filter.payment_date.$gte = startDate;
      if (endDate) filter.payment_date.$lte = endDate;
    }
    if (clientId) {
      filter.client = clientId;
    }
    if (method && method !== 'all') {
      filter.method = method;
    }

    const payments = await Payment.find(filter).populate('client').sort({ payment_date: -1, createdAt: -1 });
    const formatted = await Promise.all(payments.map(formatPayment));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pending payments list
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const activeClients = await Client.find({ status: 'active' });

    const pending = [];
    for (const c of activeClients) {
      const delAg = await Delivery.aggregate([
        { $match: { client: c._id } },
        { $group: { _id: null, billed: { $sum: '$total_amount' } } },
      ]);
      const payAg = await Payment.aggregate([
        { $match: { client: c._id } },
        { $group: { _id: null, paid: { $sum: '$amount' } } },
      ]);

      const totalBilled = delAg[0] ? delAg[0].billed : 0;
      const totalPaid = payAg[0] ? payAg[0].paid : 0;
      const balance = totalBilled - totalPaid;

      if (balance > 0) {
        pending.push({
          id: c._id,
          name: c.name,
          phone: c.phone,
          area: c.area,
          deposit_amount: c.deposit_amount,
          total_billed: totalBilled,
          total_paid: totalPaid,
          balance,
        });
      }
    }

    pending.sort((a, b) => b.balance - a.balance);
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record new payment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { client_id, payment_date, amount, method, notes } = req.body;

    if (!client_id) {
      return res.status(400).json({ error: 'Client is required' });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Payment amount must be greater than 0' });
    }

    const validMethods = ['cash', 'bank', 'jazzcash', 'easypaisa'];
    const pMethod = (method || 'cash').toLowerCase();
    if (!validMethods.includes(pMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    const dateStr = payment_date || new Date().toISOString().split('T')[0];

    const pDoc = await Payment.create({
      client: client_id,
      payment_date: dateStr,
      amount: Number(amount),
      method: pMethod,
      notes: notes || '',
    });

    const formatted = await formatPayment(pDoc);
    res.status(201).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete payment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
