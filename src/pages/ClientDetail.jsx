import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPKR, formatDate } from '../utils/helpers';
import { BillModal } from '../components/BillModal';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  Truck, 
  CreditCard, 
  Container, 
  Plus 
} from 'lucide-react';

export const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const { t } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('deliveries');
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const fetchClientDetail = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`/api/clients/${id}`);
      if (!res.ok) throw new Error('Client not found');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-gray-500">Client record not found.</div>;

  const { client, deliveries = [], payments = [] } = data;

  return (
    <div className="space-y-6">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/clients')}
          className="flex items-center space-x-1 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clients</span>
        </button>

        <button
          onClick={() => setIsBillModalOpen(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>{t('generateBill')}</span>
        </button>
      </div>

      {/* Client Overview Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="bg-sky-100 text-sky-600 p-3 rounded-2xl dark:bg-sky-950 dark:text-sky-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white">{client.name}</h1>
              <p className="text-xs text-gray-400">{client.area || 'No area specified'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 pt-2">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-sky-500" />
              <span>{client.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-sky-500" />
              <span>{client.address || 'N/A'}</span>
            </div>
          </div>

          {client.notes && (
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 p-2.5 rounded-xl">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Notes: </span>
              {client.notes}
            </div>
          )}

          {/* Rates Badge */}
          <div className="bg-sky-50/60 dark:bg-sky-950/30 p-3 rounded-xl border border-sky-100 dark:border-sky-900 text-xs">
            <span className="font-semibold text-sky-800 dark:text-sky-300 block mb-1">Assigned Custom Rates:</span>
            <div className="grid grid-cols-4 gap-2 text-center text-gray-700 dark:text-gray-300 font-bold">
              <div>19L: Rs.{client.rate_19l}</div>
              <div>6L: Rs.{client.rate_6l}</div>
              <div>1.5L: Rs.{client.rate_1_5l}</div>
              <div>500ml: Rs.{client.rate_500ml}</div>
            </div>
          </div>
        </div>

        {/* Financial & Bottle Balances */}
        <div className="bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('runningBalance')}</p>
            <h3 className={`text-2xl font-black mt-1 ${client.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {formatPKR(client.balance)}
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Total Billed: {formatPKR(client.total_billed)} | Total Paid: {formatPKR(client.total_paid)}
            </p>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1">
              <Container className="w-3.5 h-3.5 text-amber-500" />
              <span>19L Empty Bottles Held</span>
            </p>
            <h4 className="text-xl font-extrabold text-gray-800 dark:text-gray-200 mt-1">
              {client.bottles_held_19l || 0} <span className="text-xs text-gray-400 font-normal">bottles</span>
            </h4>
            <p className="text-[11px] text-gray-400">
              Delivered: {client.total_19l_delivered} | Returned: {client.total_19l_returned}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs for Deliveries vs Payments History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`flex-1 py-3.5 px-4 text-xs font-bold flex items-center justify-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'deliveries'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 bg-white dark:bg-gray-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Deliveries History ({deliveries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-3.5 px-4 text-xs font-bold flex items-center justify-center space-x-2 border-b-2 transition-colors ${
              activeTab === 'payments'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payments History ({payments.length})</span>
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'deliveries' ? (
            deliveries.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No delivery logs recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">19L</th>
                      <th className="p-3">6L</th>
                      <th className="p-3">1.5L</th>
                      <th className="p-3">500ml</th>
                      <th className="p-3">Ret 19L</th>
                      <th className="p-3 text-right">Total (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {deliveries.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                        <td className="p-3 font-semibold text-gray-900 dark:text-white">{formatDate(d.delivery_date)}</td>
                        <td className="p-3 font-bold text-sky-600">{d.qty_19l}</td>
                        <td className="p-3">{d.qty_6l}</td>
                        <td className="p-3">{d.qty_1_5l}</td>
                        <td className="p-3">{d.qty_500ml}</td>
                        <td className="p-3 text-amber-600 font-bold">{d.returned_19l}</td>
                        <td className="p-3 text-right font-extrabold text-gray-900 dark:text-white">{formatPKR(d.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            payments.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No payment records logged yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Notes</th>
                      <th className="p-3 text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                        <td className="p-3 font-semibold text-gray-900 dark:text-white">{formatDate(p.payment_date)}</td>
                        <td className="p-3 uppercase font-bold text-emerald-600">{p.method}</td>
                        <td className="p-3 text-gray-500">{p.notes || '-'}</td>
                        <td className="p-3 text-right font-extrabold text-emerald-600">{formatPKR(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        clientData={data}
      />

    </div>
  );
};
