import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { formatPKR } from '../utils/helpers';
import { X, Truck, Calculator } from 'lucide-react';

export const DeliveryModal = ({ isOpen, onClose, onSave, clients, initialData }) => {
  const { t } = useLanguage();
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    client_id: '',
    delivery_date: todayStr,
    qty_19l: 0,
    qty_6l: 0,
    qty_1_5l: 0,
    qty_500ml: 0,
    returned_19l: 0,
    cash_received: 0,
    notes: '',
  });

  const [selectedClient, setSelectedClient] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        client_id: initialData.client_id || '',
        delivery_date: initialData.delivery_date || todayStr,
        qty_19l: initialData.qty_19l || 0,
        qty_6l: initialData.qty_6l || 0,
        qty_1_5l: initialData.qty_1_5l || 0,
        qty_500ml: initialData.qty_500ml || 0,
        returned_19l: initialData.returned_19l || 0,
        cash_received: initialData.cash_received || 0,
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        client_id: clients.length > 0 ? clients[0].id : '',
        delivery_date: todayStr,
        qty_19l: 0,
        qty_6l: 0,
        qty_1_5l: 0,
        qty_500ml: 0,
        returned_19l: 0,
        cash_received: 0,
        notes: '',
      });
    }
    setError('');
  }, [initialData, isOpen, clients]);

  useEffect(() => {
    if (formData.client_id) {
      const found = clients.find((c) => c.id === Number(formData.client_id));
      setSelectedClient(found || null);
    } else {
      setSelectedClient(null);
    }
  }, [formData.client_id, clients]);

  if (!isOpen) return null;

  // Auto-calculated total amount
  const calculatedTotal = selectedClient
    ? (Number(formData.qty_19l) * selectedClient.rate_19l) +
      (Number(formData.qty_6l) * selectedClient.rate_6l) +
      (Number(formData.qty_1_5l) * selectedClient.rate_1_5l) +
      (Number(formData.qty_500ml) * selectedClient.rate_500ml)
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.client_id) {
      setError(t('selectClient') + ' is required');
      return;
    }
    if (
      Number(formData.qty_19l) === 0 &&
      Number(formData.qty_6l) === 0 &&
      Number(formData.qty_1_5l) === 0 &&
      Number(formData.qty_500ml) === 0 &&
      Number(formData.returned_19l) === 0
    ) {
      setError('Please enter at least one delivered bottle quantity or empty bottle return.');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Truck className="w-5 h-5 text-sky-500" />
            <span>{t('recordDelivery')}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Client Select */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('selectClient')} *
              </label>
              <select
                required
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="">-- {t('selectClient')} --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.area ? `(${c.area})` : ''} - Bal: {formatPKR(c.balance)}
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('deliveryDate')}
              </label>
              <input
                type="date"
                required
                value={formData.delivery_date}
                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Selected Client Custom Rates Preview Badge */}
            {selectedClient && (
              <div className="sm:col-span-2 text-xs bg-sky-50 dark:bg-sky-950/30 p-2.5 rounded-xl text-sky-800 dark:text-sky-300 border border-sky-100 dark:border-sky-900">
                <span className="font-semibold">Custom Rates: </span>
                19L: Rs.{selectedClient.rate_19l} | 6L: Rs.{selectedClient.rate_6l} | 1.5L: Rs.{selectedClient.rate_1_5l} | 500ml: Rs.{selectedClient.rate_500ml}
              </div>
            )}

            {/* Bottle Quantities */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('qty19l')} (19 Liter)
              </label>
              <input
                type="number"
                min="0"
                value={formData.qty_19l}
                onChange={(e) => setFormData({ ...formData, qty_19l: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('qty6l')} (6 Liter)
              </label>
              <input
                type="number"
                min="0"
                value={formData.qty_6l}
                onChange={(e) => setFormData({ ...formData, qty_6l: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('qty1_5l')} (1.5 Liter)
              </label>
              <input
                type="number"
                min="0"
                value={formData.qty_1_5l}
                onChange={(e) => setFormData({ ...formData, qty_1_5l: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('qty500ml')} (500 ml)
              </label>
              <input
                type="number"
                min="0"
                value={formData.qty_500ml}
                onChange={(e) => setFormData({ ...formData, qty_500ml: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* 19L Empty Bottles Returned */}
            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
              <label className="block text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                {t('returned19l')} 🔄
              </label>
              <input
                type="number"
                min="0"
                value={formData.returned_19l}
                onChange={(e) => setFormData({ ...formData, returned_19l: e.target.value })}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Cash Received on Delivery */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                {t('cashReceived')} (PKR) 💵
              </label>
              <input
                type="number"
                min="0"
                value={formData.cash_received}
                onChange={(e) => setFormData({ ...formData, cash_received: e.target.value })}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Total Auto-calculated Box */}
            <div className="sm:col-span-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white p-4 rounded-xl flex items-center justify-between shadow-md">
              <div>
                <p className="text-xs font-medium text-sky-100 flex items-center space-x-1">
                  <Calculator className="w-4 h-4" />
                  <span>{t('totalAmount')}</span>
                </p>
                <p className="text-xs text-sky-200 mt-0.5">{t('autoCalculated')}</p>
              </div>
              <div className="text-2xl font-extrabold">{formatPKR(calculatedTotal)}</div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('notes')}
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional delivery instructions..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-500/20"
            >
              {t('save')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
