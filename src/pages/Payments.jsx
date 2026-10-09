import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { PaymentModal } from '../components/PaymentModal';
import { formatPKR, formatDate } from '../utils/helpers';
import { 
  CreditCard, 
  Plus, 
  AlertCircle, 
  CheckCircle, 
  Trash2, 
  Search, 
  DollarSign 
} from 'lucide-react';

export const Payments = () => {
  const { authFetch } = useAuth();
  const { t } = useLanguage();

  const [payments, setPayments] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [methodFilter, setMethodFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preselectedClientId, setPreselectedClientId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, pendingRes, clientsRes] = await Promise.all([
        authFetch(`/api/payments?method=${methodFilter}`),
        authFetch('/api/payments/pending'),
        authFetch('/api/clients?status=active'),
      ]);

      const [paymentsData, pendingData, clientsData] = await Promise.all([
        paymentsRes.json(),
        pendingRes.json(),
        clientsRes.json(),
      ]);

      setPayments(paymentsData);
      setPendingList(pendingData);
      setClients(clientsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [methodFilter]);

  const handleSavePayment = async (formData) => {
    try {
      await authFetch('/api/payments', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      setPreselectedClientId(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePayment = async (id) => {
    if (window.confirm('Delete this payment log?')) {
      try {
        await authFetch(`/api/payments/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center space-x-2">
            <CreditCard className="w-7 h-7 text-emerald-500" />
            <span>{t('payments')}</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Record customer payments (Cash, Bank, JazzCash, Easypaisa) and track outstanding balance
          </p>
        </div>

        <button
          onClick={() => {
            setPreselectedClientId(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t('recordPayment')}</span>
        </button>
      </div>

      {/* Pending Dues Ranking List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <span>{t('pendingList')} (Sorted by Highest Due)</span>
        </h3>

        {pendingList.length === 0 ? (
          <div className="text-center py-6 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center space-x-1">
            <CheckCircle className="w-4 h-4" />
            <span>All accounts are settled! No pending dues.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingList.map((client) => (
              <div
                key={client.id}
                className="p-4 rounded-xl border border-rose-100 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 flex justify-between items-center"
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">{client.name}</h4>
                  <p className="text-[11px] text-gray-400">{client.area || client.phone}</p>
                  <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                    {formatPKR(client.balance)}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setPreselectedClientId(client.id);
                    setIsModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs shadow-sm"
                >
                  Pay Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Payment History</h3>
          
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="jazzcash">JazzCash</option>
            <option value="easypaisa">Easypaisa</option>
            <option value="bank">Bank</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : payments.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">No payment records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Client Name</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Notes</th>
                  <th className="p-3.5 text-right">Amount (PKR)</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                    <td className="p-3.5 font-semibold text-gray-900 dark:text-white">{formatDate(p.payment_date)}</td>
                    <td className="p-3.5 font-bold text-gray-900 dark:text-white">{p.client_name}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md font-bold uppercase text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {p.method}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-500">{p.notes || '-'}</td>
                    <td className="p-3.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatPKR(p.amount)}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleDeletePayment(p.id)}
                        className="p-1 text-gray-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPreselectedClientId(null);
        }}
        onSave={handleSavePayment}
        clients={clients}
        preselectedClientId={preselectedClientId}
      />

    </div>
  );
};
