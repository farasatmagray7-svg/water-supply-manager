import express from 'express';
import Delivery from '../models/Delivery.js';
import Payment from '../models/Payment.js';
import Client from '../models/Client.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Dashboard Summary Stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Today's stats
    const todayDeliveries = await Delivery.find({ delivery_date: todayStr });
    const todaySales = todayDeliveries.reduce((acc, d) => acc + d.total_amount, 0);

    // Active Clients count
    const activeClientsCount = await Client.countDocuments({ status: 'active' });

    // Pending Amount calculation across all active clients
    const activeClients = await Client.find({ status: 'active' });
    let totalPendingAmount = 0;
    const topDefaultersList = [];

    for (const c of activeClients) {
      const delAg = await Delivery.aggregate([
        { $match: { client: c._id } },
        { $group: { _id: null, billed: { $sum: '$total_amount' } } },
      ]);
      const payAg = await Payment.aggregate([
        { $match: { client: c._id } },
        { $group: { _id: null, paid: { $sum: '$amount' } } },
      ]);

      const billed = delAg[0] ? delAg[0].billed : 0;
      const paid = payAg[0] ? payAg[0].paid : 0;
      const bal = billed - paid;

      if (bal > 0) {
        totalPendingAmount += bal;
        topDefaultersList.push({
          id: c._id,
          name: c.name,
          phone: c.phone,
          area: c.area,
          balance: bal,
        });
      }
    }

    topDefaultersList.sort((a, b) => b.balance - a.balance);

    // Bottle split
    const bottleSplitAg = await Delivery.aggregate([
      {
        $group: {
          _id: null,
          total_19l: { $sum: '$qty_19l' },
          total_6l: { $sum: '$qty_6l' },
          total_1_5l: { $sum: '$qty_1_5l' },
          total_500ml: { $sum: '$qty_500ml' },
        },
      },
    ]);

    const bSplit = bottleSplitAg[0] || { total_19l: 0, total_6l: 0, total_1_5l: 0, total_500ml: 0 };

    // Top 5 Clients by total spent
    const topClientsAg = await Delivery.aggregate([
      {
        $group: {
          _id: '$client',
          total_spent: { $sum: '$total_amount' },
        },
      },
      { $sort: { total_spent: -1 } },
      { $limit: 5 },
    ]);

    const topClientsList = [];
    for (const tc of topClientsAg) {
      const clientDoc = await Client.findById(tc._id);
      if (clientDoc) {
        topClientsList.push({
          id: clientDoc._id,
          name: clientDoc.name,
          area: clientDoc.area,
          total_spent: tc.total_spent,
        });
      }
    }

    // Monthly Sales Chart Data (by YYYY-MM prefix of delivery_date)
    const monthlySalesAg = await Delivery.aggregate([
      {
        $group: {
          _id: { $substr: ['$delivery_date', 0, 7] },
          total_sales: { $sum: '$total_amount' },
          total_deliveries: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    const monthlySalesList = monthlySalesAg.map((m) => ({
      month: m._id,
      total_sales: m.total_sales,
      total_deliveries: m.total_deliveries,
    }));

    res.json({
      today_deliveries_count: todayDeliveries.length,
      today_sales: todaySales,
      total_active_clients: activeClientsCount,
      total_pending_amount: totalPendingAmount,
      bottle_split: {
        '19L': bSplit.total_19l,
        '6L': bSplit.total_6l,
        '1.5L': bSplit.total_1_5l,
        '500ml': bSplit.total_500ml,
      },
      top_clients: topClientsList,
      top_defaulters: topDefaultersList.slice(0, 5),
      monthly_sales: monthlySalesList,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Detailed Date Range Report
router.get('/range', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const deliveries = await Delivery.find({
      delivery_date: { $gte: startDate, $lte: endDate },
    }).populate('client').sort({ delivery_date: 1 });

    const payments = await Payment.find({
      payment_date: { $gte: startDate, $lte: endDate },
    }).populate('client').sort({ payment_date: 1 });

    const formattedDeliveries = deliveries.map((d) => ({
      id: d._id,
      delivery_date: d.delivery_date,
      client_name: d.client ? d.client.name : 'Unknown',
      client_area: d.client ? d.client.area : '',
      qty_19l: d.qty_19l,
      qty_6l: d.qty_6l,
      qty_1_5l: d.qty_1_5l,
      qty_500ml: d.qty_500ml,
      returned_19l: d.returned_19l,
      total_amount: d.total_amount,
      notes: d.notes,
    }));

    const formattedPayments = payments.map((p) => ({
      id: p._id,
      payment_date: p.payment_date,
      client_name: p.client ? p.client.name : 'Unknown',
      client_area: p.client ? p.client.area : '',
      amount: p.amount,
      method: p.method,
      notes: p.notes,
    }));

    const totalSales = deliveries.reduce((acc, item) => acc + item.total_amount, 0);
    const totalCollected = payments.reduce((acc, item) => acc + item.amount, 0);
    const total19l = deliveries.reduce((acc, item) => acc + item.qty_19l, 0);
    const total6l = deliveries.reduce((acc, item) => acc + item.qty_6l, 0);
    const total1_5l = deliveries.reduce((acc, item) => acc + item.qty_1_5l, 0);
    const total500ml = deliveries.reduce((acc, item) => acc + item.qty_500ml, 0);
    const totalReturned19l = deliveries.reduce((acc, item) => acc + item.returned_19l, 0);

    res.json({
      startDate,
      endDate,
      totalSales,
      totalCollected,
      totals: {
        qty_19l: total19l,
        qty_6l: total6l,
        qty_1_5l: total1_5l,
        qty_500ml: total500ml,
        returned_19l: totalReturned19l,
      },
      deliveries: formattedDeliveries,
      payments: formattedPayments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CSV Export
router.get('/export-csv', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate && endDate) {
      filter.delivery_date = { $gte: startDate, $lte: endDate };
    }

    const deliveries = await Delivery.find(filter).populate('client').sort({ delivery_date: -1 });

    let csvContent = 'Date,Client Name,Phone,Area,19L Qty,6L Qty,1.5L Qty,500ml Qty,Returned 19L,Total Amount (PKR),Notes\n';
    for (const d of deliveries) {
      const clientName = d.client ? d.client.name : 'Unknown';
      const phone = d.client ? d.client.phone : '';
      const area = d.client ? d.client.area : '';
      csvContent += `"${d.delivery_date}","${clientName}","${phone}","${area}",${d.qty_19l},${d.qty_6l},${d.qty_1_5l},${d.qty_500ml},${d.returned_19l},${d.total_amount},"${(d.notes || '').replace(/"/g, '""')}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=water_deliveries_${startDate || 'all'}.csv`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
