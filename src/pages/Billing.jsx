import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BillModal } from '../components/BillModal';
import { formatPKR } from '../utils/helpers';
import { FileText, Search, Printer, Share2, Users } from 'lucide-react';

export const Billing = () => {
  const { authFetch } = useAuth();
  const { t } = useLanguage();

  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientDetailData, setClientDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await authFetch('/api/clients?status=active');
        const data = await res.json();
        setClients(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClients();
  }, []);

  const handleGenerateBill = async (clientId) => {
    if (!clientId) return;
    try {
      setLoading(true);
      const res = await authFetch(`/api/clients/${clientId}`);
      const json = await res.json();
      setClientDetailData(json);
      setIsBillModalOpen(true);
    } catch (err) {
      alert('Failed to load bill data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center space-x-2">
          <FileText className="w-7 h-7 text-sky-500" />
          <span>{t('payments')} - Monthly Bill Generator</span>
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Generate professional printable invoices and share via WhatsApp in one click
        </p>
      </div>

      {/* Select Client Card */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm max-w-xl">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
          {t('generateBill')}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {t('selectClient')}
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="">-- {t('selectClient')} --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.area || 'No Area'}) - Bal: {formatPKR(c.balance)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleGenerateBill(selectedClientId)}
            disabled={!selectedClientId || loading}
            className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-sky-500/20 flex items-center justify-center space-x-2 text-sm"
          >
            <Printer className="w-4 h-4" />
            <span>{loading ? 'Loading...' : t('generateBill')}</span>
          </button>
        </div>
      </div>

      {/* Quick Select Client Directory Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Active Accounts List</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase">
              <tr>
                <th className="p-3.5">Client Name</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Area</th>
                <th className="p-3.5">Balance Due</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                  <td className="p-3.5 font-bold text-gray-900 dark:text-white">{c.name}</td>
                  <td className="p-3.5 text-gray-500">{c.phone || '-'}</td>
                  <td className="p-3.5 text-gray-500">{c.area || '-'}</td>
                  <td className={`p-3.5 font-extrabold ${c.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
                    {formatPKR(c.balance)}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleGenerateBill(c.id)}
                      className="px-3 py-1 bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-300 hover:bg-sky-100 font-bold rounded-lg text-xs"
                    >
                      Bill & Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        clientData={clientDetailData}
      />

    </div>
  );
};
