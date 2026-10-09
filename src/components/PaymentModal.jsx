import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { formatPKR } from '../utils/helpers';
import { X, CreditCard, CheckCircle } from 'lucide-react';

export const PaymentModal = ({ isOpen, onClose, onSave, clients, preselectedClientId }) => {
  const { t } = useLanguage();
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    client_id: preselectedClientId || '',
    payment_date: todayStr,
    amount: '',
    method: 'cash',
    notes: '',
  });

  const [selectedClient, setSelectedClient] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData({
      client_id: preselectedClientId || (clients.length > 0 ? clients[0].id : ''),
      payment_date: todayStr,
      amount: '',
      method: 'cash',
      notes: '',
    });
    setError('');
  }, [preselectedClientId, isOpen, clients]);

  useEffect(() => {
    if (formData.client_id) {
      const found = clients.find((c) => c.id === Number(formData.client_id));
      setSelectedClient(found || null);
    } else {
      setSelectedClient(null);
    }
  }, [formData.client_id, clients]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.client_id) {
      setError(t('selectClient') + ' is required');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid payment amount greater than 0');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-emerald-500" />
            <span>{t('recordPayment')}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {t('selectClient')} *
            </label>
            <select
              required
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">-- {t('selectClient')} --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - Pending Bal: {formatPKR(c.balance)}
                </option>
              ))}
            </select>
          </div>

          {selectedClient && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900 flex justify-between items-center text-xs text-emerald-800 dark:text-emerald-300">
              <span>Current Outstanding Due:</span>
              <span className="font-extrabold text-sm">{formatPKR(selectedClient.balance)}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {t('paymentAmount')} *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g. 1500"
              className="w-full px-3.5 py-2.5 text-base font-semibold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {t('paymentMethod')}
            </label>
            <select
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="cash">💵 {t('cash')}</option>
              <option value="jazzcash">📱 {t('jazzcash')}</option>
              <option value="easypaisa">📱 {t('easypaisa')}</option>
              <option value="bank">🏦 {t('bank')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {t('paymentDate')}
            </label>
            <input
              type="date"
              required
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {t('notes')} / Transaction ID
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Trx ID: JC123891"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
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
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t('save')}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
