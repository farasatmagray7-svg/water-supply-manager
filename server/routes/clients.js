import express from 'express';
import mongoose from 'mongoose';
import Client from '../models/Client.js';
import Delivery from '../models/Delivery.js';
import Payment from '../models/Payment.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Helper function to format client document with calculated metrics
const formatClientWithStats = async (clientDoc) => {
  const clientId = clientDoc._id;

  const deliveryStats = await Delivery.aggregate([
    { $match: { client: new mongoose.Types.ObjectId(clientId) } },
    {
      $group: {
        _id: null,
        total_billed: { $sum: '$total_amount' },
        total_19l_delivered: { $sum: '$qty_19l' },
        total_19l_returned: { $sum: '$returned_19l' },
      },
    },
  ]);

  const paymentStats = await Payment.aggregate([
    { $match: { client: new mongoose.Types.ObjectId(clientId) } },
    {
      $group: {
        _id: null,
        total_paid: { $sum: '$amount' },
      },
    },
  ]);

  const billed = deliveryStats[0] ? deliveryStats[0].total_billed : 0;
  const paid = paymentStats[0] ? paymentStats[0].total_paid : 0;
  const del19l = deliveryStats[0] ? deliveryStats[0].total_19l_delivered : 0;
  const ret19l = deliveryStats[0] ? deliveryStats[0].total_19l_returned : 0;

  const obj = clientDoc.toObject();
  obj.id = obj._id;
  obj.total_billed = billed;
  obj.total_paid = paid;
  obj.balance = billed - paid;
  obj.total_19l_delivered = del19l;
  obj.total_19l_returned = ret19l;
  obj.bottles_held_19l = del19l - ret19l;

  return obj;
};

// List clients
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, status, area } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (area) {
      filter.area = area;
    }

    const clients = await Client.find(filter).sort({ name: 1 });
    const formattedClients = await Promise.all(clients.map(formatClientWithStats));

    res.json(formattedClients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get client detail
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const clientDoc = await Client.findById(req.params.id);
    if (!clientDoc) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const clientWithStats = await formatClientWithStats(clientDoc);

    const deliveries = await Delivery.find({ client: req.params.id }).sort({ delivery_date: -1, createdAt: -1 });
    const payments = await Payment.find({ client: req.params.id }).sort({ payment_date: -1, createdAt: -1 });

    const formattedDeliveries = deliveries.map((d) => {
      const o = d.toObject();
      o.id = o._id;
      return o;
    });

    const formattedPayments = payments.map((p) => {
      const o = p.toObject();
      o.id = o._id;
      return o;
    });

    res.json({
      client: clientWithStats,
      deliveries: formattedDeliveries,
      payments: formattedPayments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add client
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      area,
      notes,
      status,
      rate_19l,
      rate_6l,
      rate_1_5l,
      rate_500ml,
      deposit_amount,
    } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Client name is required' });
    }

    const newClient = await Client.create({
      name: name.trim(),
      phone: phone || '',
      address: address || '',
      area: area || '',
      notes: notes || '',
      status: status || 'active',
      rate_19l: rate_19l !== undefined ? Number(rate_19l) : 200,
      rate_6l: rate_6l !== undefined ? Number(rate_6l) : 100,
      rate_1_5l: rate_1_5l !== undefined ? Number(rate_1_5l) : 50,
      rate_500ml: rate_500ml !== undefined ? Number(rate_500ml) : 30,
      deposit_amount: deposit_amount !== undefined ? Number(deposit_amount) : 0,
    });

    const formatted = await formatClientWithStats(newClient);
    res.status(201).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update client
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      area,
      notes,
      status,
      rate_19l,
      rate_6l,
      rate_1_5l,
      rate_500ml,
      deposit_amount,
    } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Client name is required' });
    }

    const updated = await Client.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        phone: phone || '',
        address: address || '',
        area: area || '',
        notes: notes || '',
        status: status || 'active',
        rate_19l: Number(rate_19l),
        rate_6l: Number(rate_6l),
        rate_1_5l: Number(rate_1_5l),
        rate_500ml: Number(rate_500ml),
        deposit_amount: Number(deposit_amount),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const formatted = await formatClientWithStats(updated);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete client
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const clientId = req.params.id;
    await Client.findByIdAndDelete(clientId);
    await Delivery.deleteMany({ client: clientId });
    await Payment.deleteMany({ client: clientId });
    res.json({ message: 'Client and associated history deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
