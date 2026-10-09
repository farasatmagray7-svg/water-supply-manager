import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Client from './models/Client.js';
import Delivery from './models/Delivery.js';
import Payment from './models/Payment.js';
import { connectDB } from './db.js';

export const seedDatabase = async () => {
  await connectDB();

  // Create default admin user if not exists
  const existingUser = await User.findOne({ username: 'admin' });
  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    await User.create({ username: 'admin', password_hash: hash });
    console.log('Default admin user created: admin / admin123');
  }

  // Check if clients exist
  const count = await Client.countDocuments();
  if (count > 0) {
    console.log('Database already contains client records. Skipping seed.');
    return;
  }

  console.log('Seeding initial Pakistani client and delivery dummy data into MongoDB Atlas...');

  const sampleClients = [
    {
      name: 'Al-Madina Mart (Tariq)',
      phone: '0300-1234567',
      address: 'Shop 12, Main Boulevard, Gulberg III',
      area: 'Gulberg, Lahore',
      notes: 'Monthly bulk payment client',
      rate_19l: 180,
      rate_6l: 90,
      rate_1_5l: 45,
      rate_500ml: 25,
      deposit_amount: 5000,
    },
    {
      name: 'Chaudhry House (Usman)',
      phone: '0321-9876543',
      address: 'House 45, Block H, DHA Phase 5',
      area: 'DHA, Lahore',
      notes: 'Delivers on Mondays & Thursdays',
      rate_19l: 220,
      rate_6l: 110,
      rate_1_5l: 50,
      rate_500ml: 30,
      deposit_amount: 3000,
    },
    {
      name: 'Bismillah Bakery & Cafe',
      phone: '0333-5554433',
      address: 'Plot 88, Commercial Market, Satellite Town',
      area: 'Rawalpindi',
      notes: 'Prefers 19L and 500ml boxes',
      rate_19l: 190,
      rate_6l: 95,
      rate_1_5l: 48,
      rate_500ml: 28,
      deposit_amount: 8000,
    },
    {
      name: 'Dr. Sarah Ahmed',
      phone: '0302-8881122',
      address: 'Apartment 4B, Falcon Complex, New Karachi',
      area: 'Karachi',
      notes: 'Always pays via JazzCash',
      rate_19l: 200,
      rate_6l: 100,
      rate_1_5l: 50,
      rate_500ml: 30,
      deposit_amount: 2000,
    },
    {
      name: 'Royal Fitness Gym (Bilal)',
      phone: '0345-7772211',
      address: 'Hall 3, F-8 Markaz',
      area: 'Islamabad',
      notes: 'High demand gym account',
      rate_19l: 175,
      rate_6l: 85,
      rate_1_5l: 40,
      rate_500ml: 25,
      deposit_amount: 10000,
    },
    {
      name: 'Sheikh & Sons Law Office',
      phone: '0301-4449900',
      address: 'Office 201, Mall Plaza, The Mall',
      area: 'Peshawar',
      notes: 'Requires monthly invoices',
      rate_19l: 210,
      rate_6l: 105,
      rate_1_5l: 55,
      rate_500ml: 35,
      deposit_amount: 2500,
    }
  ];

  const createdClients = await Client.insertMany(sampleClients);

  const today = new Date();
  const formatDate = (d) => d.toISOString().split('T')[0];
  const getDateDaysAgo = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return formatDate(d);
  };

  const deliveriesSeed = [
    { clientIndex: 0, daysAgo: 10, q19: 10, q6: 5, q1_5: 12, q500: 24, ret19: 8, cash: 0 },
    { clientIndex: 0, daysAgo: 5,  q19: 12, q6: 2, q1_5: 6,  q500: 12, ret19: 10, cash: 2000 },
    { clientIndex: 0, daysAgo: 0,  q19: 8,  q6: 4, q1_5: 0,  q500: 24, ret19: 6, cash: 0 },

    { clientIndex: 1, daysAgo: 12, q19: 4, q6: 2, q1_5: 4,  q500: 6,  ret19: 3, cash: 1000 },
    { clientIndex: 1, daysAgo: 6,  q19: 5, q6: 1, q1_5: 2,  q500: 0,  ret19: 4, cash: 0 },
    { clientIndex: 1, daysAgo: 1,  q19: 4, q6: 2, q1_5: 0,  q500: 12, ret19: 2, cash: 500 },

    { clientIndex: 2, daysAgo: 8,  q19: 15, q6: 10, q1_5: 20, q500: 48, ret19: 12, cash: 3000 },
    { clientIndex: 2, daysAgo: 2,  q19: 10, q6: 5,  q1_5: 10, q500: 24, ret19: 10, cash: 0 },

    { clientIndex: 3, daysAgo: 7,  q19: 3, q6: 2, q1_5: 4,  q500: 6,  ret19: 2, cash: 1000 },
    { clientIndex: 3, daysAgo: 0,  q19: 2, q6: 1, q1_5: 2,  q500: 12, ret19: 2, cash: 800 },

    { clientIndex: 4, daysAgo: 14, q19: 20, q6: 10, q1_5: 30, q500: 60, ret19: 15, cash: 5000 },
    { clientIndex: 4, daysAgo: 7,  q19: 25, q6: 5,  q1_5: 20, q500: 48, ret19: 20, cash: 0 },
    { clientIndex: 4, daysAgo: 0,  q19: 15, q6: 8,  q1_5: 10, q500: 24, ret19: 12, cash: 0 },

    { clientIndex: 5, daysAgo: 4,  q19: 6, q6: 2, q1_5: 6,  q500: 12, ret19: 4, cash: 0 },
  ];

  for (const d of deliveriesSeed) {
    const client = createdClients[d.clientIndex];
    const totalAmount = (d.q19 * client.rate_19l) +
                        (d.q6 * client.rate_6l) +
                        (d.q1_5 * client.rate_1_5l) +
                        (d.q500 * client.rate_500ml);

    const deliveryDate = getDateDaysAgo(d.daysAgo);
    const delDoc = await Delivery.create({
      client: client._id,
      delivery_date: deliveryDate,
      qty_19l: d.q19,
      qty_6l: d.q6,
      qty_1_5l: d.q1_5,
      qty_500ml: d.q500,
      returned_19l: d.ret19,
      total_amount: totalAmount,
      notes: 'Regular route delivery',
    });

    if (d.cash > 0) {
      await Payment.create({
        client: client._id,
        payment_date: deliveryDate,
        amount: d.cash,
        method: 'cash',
        delivery: delDoc._id,
        notes: 'Cash collected on delivery',
      });
    }
  }

  const additionalPayments = [
    { clientIndex: 0, daysAgo: 3, amount: 2500, method: 'jazzcash', notes: 'Trx ID: JC9876231' },
    { clientIndex: 2, daysAgo: 4, amount: 4000, method: 'easypaisa', notes: 'Trx ID: EP443311' },
    { clientIndex: 4, daysAgo: 2, amount: 6000, method: 'bank', notes: 'Meezan Bank Transfer' },
    { clientIndex: 1, daysAgo: 8, amount: 1500, method: 'cash', notes: 'Direct Cash' },
  ];

  for (const p of additionalPayments) {
    const client = createdClients[p.clientIndex];
    await Payment.create({
      client: client._id,
      payment_date: getDateDaysAgo(p.daysAgo),
      amount: p.amount,
      method: p.method,
      notes: p.notes,
    });
  }

  console.log('MongoDB Atlas dummy data seeded successfully.');
};
