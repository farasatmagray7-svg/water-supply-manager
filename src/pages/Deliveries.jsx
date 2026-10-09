import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { DeliveryModal } from '../components/DeliveryModal';
import { formatPKR, formatDate } from '../utils/helpers';
import { 
  Truck, 
  Plus, 
  Calendar, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle,
  Banknote
} from 'lucide-react';

export const Deliveries = () => {
  const { authFetch } = useAuth();
  const { t } = useLanguage();

  const [deliveries, setDeliveries] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayOnly, setTodayOnly] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);

  const fetchClients = async () => {
    try {
      const res = await authFetch('/api/clients?status=active');
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const url = todayOnly ? '/api/deliveries?todayOnly=true' : '/api/deliveries';
      const res = await authFetch(url);
      const data = await res.json();
      setDeliveries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [todayOnly]);

  const handleSave = async (formData) => {
    try {
      if (editingDelivery) {
        await authFetch(`/api/deliveries/${editingDelivery.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await authFetch('/api/deliveries', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      setEditingDelivery(null);
      fetchDeliveries();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this delivery entry?')) {
      try {
        await authFetch(`/api/deliveries/${id}`, { method: 'DELETE' });
        fetchDeliveries();
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
            <Truck className="w-7 h-7 text-sky-500" />
            <span>{t('deliveries')}</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Record daily bottle deliveries and empty bottle returns
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDelivery(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center space-x-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t('recordDelivery')}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setTodayOnly(true)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
              todayOnly
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            {t('todayDeliveriesTitle')}
          </button>

          <button
            onClick={() => setTodayOnly(false)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
              !todayOnly
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            {t('allDeliveries')}
          </button>
        </div>

        <span className="text-xs font-semibold text-gray-400">
          Total Logs: {deliveries.length}
        </span>
      </div>

      {/* Delivery Logs Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
      ) : deliveries.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">No deliveries recorded</h3>
          <p className="text-xs text-gray-400 mt-1">Click "{t('recordDelivery')}" to add a new delivery.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Client Name</th>
                  <th className="p-3.5">19L</th>
                  <th className="p-3.5">6L</th>
                  <th className="p-3.5">1.5L</th>
                  <th className="p-3.5">500ml</th>
                  <th className="p-3.5">Ret 19L</th>
                  <th className="p-3.5">Total (PKR)</th>
                  <th className="p-3.5">Cash Rec</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {deliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                    <td className="p-3.5 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {formatDate(d.delivery_date)}
                    </td>
                    <td className="p-3.5 font-bold text-gray-900 dark:text-white">
                      <div>{d.client_name}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{d.client_area}</div>
                    </td>
                    <td className="p-3.5 font-extrabold text-sky-600">{d.qty_19l}</td>
                    <td className="p-3.5 font-semibold">{d.qty_6l}</td>
                    <td className="p-3.5 font-semibold">{d.qty_1_5l}</td>
                    <td className="p-3.5 font-semibold">{d.qty_500ml}</td>
                    <td className="p-3.5 font-extrabold text-amber-600">{d.returned_19l}</td>
                    <td className="p-3.5 font-extrabold text-gray-900 dark:text-white">
                      {formatPKR(d.total_amount)}
                    </td>
                    <td className="p-3.5 font-extrabold text-emerald-600">
                      {d.cash_received > 0 ? (
                        <span className="bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                          {formatPKR(d.cash_received)}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-normal">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingDelivery(d);
                            setIsModalOpen(true);
                          }}
                          className="p-1 rounded text-gray-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-gray-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delivery Modal */}
      <DeliveryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDelivery(null);
        }}
        onSave={handleSave}
        clients={clients}
        initialData={editingDelivery}
      />

    </div>
  );
};
