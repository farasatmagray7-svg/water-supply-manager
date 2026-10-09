import React, { useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { formatPKR, formatDate, generateWhatsAppBillLink } from '../utils/helpers';
import { X, Printer, Share2, Droplets } from 'lucide-react';

export const BillModal = ({ isOpen, onClose, clientData }) => {
  const { t } = useLanguage();

  if (!isOpen || !clientData || !clientData.client) return null;

  const { client, deliveries = [], payments = [] } = clientData;

  // Month-year label
  const today = new Date();
  const monthYearStr = today.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Compute totals
  const total19l = deliveries.reduce((acc, d) => acc + (d.qty_19l || 0), 0);
  const total6l = deliveries.reduce((acc, d) => acc + (d.qty_6l || 0), 0);
  const total1_5l = deliveries.reduce((acc, d) => acc + (d.qty_1_5l || 0), 0);
  const total500ml = deliveries.reduce((acc, d) => acc + (d.qty_500ml || 0), 0);
  const totalReturned19l = deliveries.reduce((acc, d) => acc + (d.returned_19l || 0), 0);

  const totalBilled = deliveries.reduce((acc, d) => acc + (d.total_amount || 0), 0);
  const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const netBalance = client.balance; // Running total balance
  const bottlesHeld = client.bottles_held_19l;

  const whatsappUrl = generateWhatsAppBillLink(client, monthYearStr, {
    total19l,
    total6l,
    total1_5l,
    total500ml,
    totalBilled,
    totalPaid,
    balance: netBalance,
    bottlesHeld,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden my-8">
        
        {/* Modal Controls Top Header (Hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {t('generateBill')} - {monthYearStr}
          </h3>
          <div className="flex items-center space-x-2">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 flex items-center space-x-1 shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>{t('shareWhatsapp')}</span>
              </a>
            )}

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-500 text-white hover:bg-sky-600 flex items-center space-x-1 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>{t('downloadPDF')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bill Area */}
        <div id="printable-bill" className="p-8 bg-white text-gray-900 space-y-6">
          
          {/* Company Branding & Header */}
          <div className="flex justify-between items-start border-b border-sky-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Droplets className="w-8 h-8 text-sky-600" />
                <h2 className="text-2xl font-black text-sky-900 tracking-tight">WATER SUPPLY MANAGER</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">Pure Bottled Mineral Water Delivery Services</p>
              <p className="text-xs text-gray-500">Helpline / Support: 0300-WATER-PK</p>
            </div>
            <div className="text-right">
              <span className="bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1 rounded-full">
                MONTHLY INVOICE
              </span>
              <p className="text-xs font-semibold text-gray-500 mt-2">Date: {formatDate(today)}</p>
              <p className="text-xs font-semibold text-gray-500">Period: {monthYearStr}</p>
            </div>
          </div>

          {/* Client Details Card */}
          <div className="grid grid-cols-2 gap-4 bg-sky-50/50 p-4 rounded-xl border border-sky-100 text-sm">
            <div>
              <p className="text-xs text-sky-700 font-semibold uppercase">Customer Details</p>
              <h4 className="text-base font-bold text-gray-900 mt-0.5">{client.name}</h4>
              <p className="text-xs text-gray-600">{client.address}</p>
              <p className="text-xs text-gray-600">{client.area}</p>
              <p className="text-xs text-gray-600">Phone: {client.phone}</p>
            </div>
            <div className="text-right border-l border-sky-200 pl-4">
              <p className="text-xs text-sky-700 font-semibold uppercase">Account Summary</p>
              <p className="text-xs text-gray-600 mt-1">19L Bottles Held: <span className="font-bold text-gray-900">{bottlesHeld} bottles</span></p>
              {client.deposit_amount > 0 && (
                <p className="text-xs text-gray-600">Security Deposit: <span className="font-bold text-gray-900">{formatPKR(client.deposit_amount)}</span></p>
              )}
            </div>
          </div>

          {/* Bottle Consumption Summary Table */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Bottle Consumption Breakdown</h4>
            <table className="w-full text-xs text-left border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 uppercase">
                <tr>
                  <th className="p-2.5">Bottle Size</th>
                  <th className="p-2.5 text-center">Delivered Qty</th>
                  <th className="p-2.5 text-right">Unit Rate (PKR)</th>
                  <th className="p-2.5 text-right">Subtotal (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-2.5 font-medium">19 Liter Jug</td>
                  <td className="p-2.5 text-center font-bold">{total19l}</td>
                  <td className="p-2.5 text-right">Rs.{client.rate_19l}</td>
                  <td className="p-2.5 text-right font-semibold">{formatPKR(total19l * client.rate_19l)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">6 Liter Bottle</td>
                  <td className="p-2.5 text-center font-bold">{total6l}</td>
                  <td className="p-2.5 text-right">Rs.{client.rate_6l}</td>
                  <td className="p-2.5 text-right font-semibold">{formatPKR(total6l * client.rate_6l)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">1.5 Liter Bottle</td>
                  <td className="p-2.5 text-center font-bold">{total1_5l}</td>
                  <td className="p-2.5 text-right">Rs.{client.rate_1_5l}</td>
                  <td className="p-2.5 text-right font-semibold">{formatPKR(total1_5l * client.rate_1_5l)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">500 ml Bottle</td>
                  <td className="p-2.5 text-center font-bold">{total500ml}</td>
                  <td className="p-2.5 text-right">Rs.{client.rate_500ml}</td>
                  <td className="p-2.5 text-right font-semibold">{formatPKR(total500ml * client.rate_500ml)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 19L Empty Bottle Return Summary */}
          <div className="flex justify-between items-center text-xs bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900">
            <span>19L Empty Bottles Returned During Month:</span>
            <span className="font-bold text-sm">{totalReturned19l} bottles</span>
          </div>

          {/* Payment & Balance Breakdown */}
          <div className="border-t-2 border-gray-900 pt-4 flex justify-between items-end">
            <div className="text-xs text-gray-500 space-y-1">
              <p>Payment accepted via Cash, Bank Transfer, JazzCash, or Easypaisa.</p>
              <p className="font-semibold text-gray-700">Thank you for choosing Water Supply Manager!</p>
            </div>
            <div className="w-64 space-y-1 text-right text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Total Billed:</span>
                <span className="font-semibold">{formatPKR(totalBilled)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Total Payments Received:</span>
                <span className="font-semibold">-{formatPKR(totalPaid)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-300">
                <span>BALANCE DUE:</span>
                <span className="text-sky-700">{formatPKR(netBalance)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
