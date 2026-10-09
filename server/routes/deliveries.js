import express from 'express';
import Delivery from '../models/Delivery.js';
import Client from '../models/Client.js';
import Payment from '../models/Payment.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Helper to format delivery doc
const formatDelivery = async (d) => {
  const obj = d.toObject ? d.toObject() : d;
  obj.id = obj._id;

  const clientDoc = d.client && d.client.name ? d.client : await Client.findById(d.client);
  if (clientDoc) {
    obj.client_id = clientDoc._id;
    obj.client_name = clientDoc.name;
    obj.client_phone = clientDoc.phone;
    obj.client_area = clientDoc.area;
  }

  const paymentDoc = await Payment.findOne({ delivery: d._id });
  if (paymentDoc) {
    obj.cash_received = paymentDoc.amount;
    obj.payment_id = paymentDoc._id;
  } else {
    obj.cash_received = 0;
  }

  return obj;
};

// List deliveries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, clientId, todayOnly } = req.query;
    const filter = {};

    if (todayOnly === 'true') {
      filter.delivery_date = new Date().toISOString().split('T')[0];
    } else {
      if (startDate || endDate) {
        filter.delivery_date = {};
        if (startDate) filter.delivery_date.$gte = startDate;
        if (endDate) filter.delivery_date.$lte = endDate;
      }
    }

    if (clientId) {
      filter.client = clientId;
    }

    const deliveries = await Delivery.find(filter).populate('client').sort({ delivery_date: -1, createdAt: -1 });
    const formatted = await Promise.all(deliveries.map(formatDelivery));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create delivery
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      client_id,
      delivery_date,
      qty_19l,
      qty_6l,
      qty_1_5l,
      qty_500ml,
      returned_19l,
      cash_received,
      notes,
    } = req.body;

    if (!client_id) {
      return res.status(400).json({ error: 'Client selection is required' });
    }

    const client = await Client.findById(client_id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const q19 = Number(qty_19l || 0);
    const q6 = Number(qty_6l || 0);
    const q1_5 = Number(qty_1_5l || 0);
    const q500 = Number(qty_500ml || 0);
    const ret19 = Number(returned_19l || 0);
    const cash = Number(cash_received || 0);

    const totalAmount =
      q19 * client.rate_19l +
      q6 * client.rate_6l +
      q1_5 * client.rate_1_5l +
      q500 * client.rate_500ml;

    const dateStr = delivery_date || new Date().toISOString().split('T')[0];

    const delDoc = await Delivery.create({
      client: client_id,
      delivery_date: dateStr,
      qty_19l: q19,
      qty_6l: q6,
      qty_1_5l: q1_5,
      qty_500ml: q500,
      returned_19l: ret19,
      total_amount: totalAmount,
      notes: notes || '',
    });

    if (cash > 0) {
      await Payment.create({
        client: client_id,
        payment_date: dateStr,
        amount: cash,
        method: 'cash',
        delivery: delDoc._id,
        notes: 'Cash collected at delivery',
      });
    }

    const formatted = await formatDelivery(delDoc);
    res.status(201).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update delivery
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const {
      client_id,
      delivery_date,
      qty_19l,
      qty_6l,
      qty_1_5l,
      qty_500ml,
      returned_19l,
      cash_received,
      notes,
    } = req.body;

    const existingDel = await Delivery.findById(deliveryId);
    if (!existingDel) {
      return res.status(404).json({ error: 'Delivery record not found' });
    }

    const targetClientId = client_id || existingDel.client;
    const client = await Client.findById(targetClientId);

    const q19 = Number(qty_19l !== undefined ? qty_19l : existingDel.qty_19l);
    const q6 = Number(qty_6l !== undefined ? qty_6l : existingDel.qty_6l);
    const q1_5 = Number(qty_1_5l !== undefined ? qty_1_5l : existingDel.qty_1_5l);
    const q500 = Number(qty_500ml !== undefined ? qty_500ml : existingDel.qty_500ml);
    const ret19 = Number(returned_19l !== undefined ? returned_19l : existingDel.returned_19l);
    const cash = Number(cash_received || 0);

    const totalAmount =
      q19 * client.rate_19l +
      q6 * client.rate_6l +
      q1_5 * client.rate_1_5l +
      q500 * client.rate_500ml;

    const dateStr = delivery_date || existingDel.delivery_date;

    existingDel.client = targetClientId;
    existingDel.delivery_date = dateStr;
    existingDel.qty_19l = q19;
    existingDel.qty_6l = q6;
    existingDel.qty_1_5l = q1_5;
    existingDel.qty_500ml = q500;
    existingDel.returned_19l = ret19;
    existingDel.total_amount = totalAmount;
    existingDel.notes = notes || '';
    await existingDel.save();

    // Update associated payment
    const existingPayment = await Payment.findOne({ delivery: deliveryId });
    if (cash > 0) {
      if (existingPayment) {
        existingPayment.client = targetClientId;
        existingPayment.payment_date = dateStr;
        existingPayment.amount = cash;
        await existingPayment.save();
      } else {
        await Payment.create({
          client: targetClientId,
          payment_date: dateStr,
          amount: cash,
          method: 'cash',
          delivery: deliveryId,
          notes: 'Cash collected at delivery',
        });
      }
    } else if (existingPayment) {
      await Payment.findByIdAndDelete(existingPayment._id);
    }

    const formatted = await formatDelivery(existingDel);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete delivery
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deliveryId = req.params.id;
    await Delivery.findByIdAndDelete(deliveryId);
    await Payment.deleteMany({ delivery: deliveryId });
    res.json({ message: 'Delivery record deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
