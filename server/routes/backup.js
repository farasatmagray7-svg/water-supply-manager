import express from 'express';
import multer from 'multer';
import Client from '../models/Client.js';
import Delivery from '../models/Delivery.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { authenticateToken } from './auth.js';

const router = express.Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

// Download JSON Backup of all collections
router.get('/download', authenticateToken, async (req, res) => {
  try {
    const clients = await Client.find();
    const deliveries = await Delivery.find();
    const payments = await Payment.find();

    const backupData = {
      timestamp: new Date().toISOString(),
      clients,
      deliveries,
      payments,
    };

    const filename = `water_manager_mongodb_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(JSON.stringify(backupData, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Restore from uploaded JSON Backup
router.post('/restore', authenticateToken, upload.single('database'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No JSON backup file uploaded' });
    }

    const content = req.file.buffer.toString('utf-8');
    const data = JSON.parse(content);

    if (data.clients && Array.isArray(data.clients)) {
      await Client.deleteMany({});
      await Client.insertMany(data.clients);
    }

    if (data.deliveries && Array.isArray(data.deliveries)) {
      await Delivery.deleteMany({});
      await Delivery.insertMany(data.deliveries);
    }

    if (data.payments && Array.isArray(data.payments)) {
      await Payment.deleteMany({});
      await Payment.insertMany(data.payments);
    }

    res.json({ message: 'MongoDB Atlas collections restored successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to restore backup: ' + err.message });
  }
});

// Clear all sample demo data
router.post('/reset', authenticateToken, async (req, res) => {
  try {
    await Payment.deleteMany({});
    await Delivery.deleteMany({});
    await Client.deleteMany({});
    res.json({ message: 'All demo data cleared successfully! MongoDB collections reset.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear demo data: ' + err.message });
  }
});

export default router;
