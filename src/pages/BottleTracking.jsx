import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPKR } from '../utils/helpers';
import { Container, AlertCircle, ShieldCheck, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const BottleTracking = () => {
  const { authFetch } = useAuth();
  const { t } = useLanguage();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBottleData = async () => {
      try {
        setLoading(true);
        const res = await authFetch('/api/clients?status=active');
        const data = await res.json();
        // Sort clients by 19L bottles held descending
        const sorted = data.sort((a, b) => (b.bottles_held_19l || 0) - (a.bottles_held_19l || 0));
        setClients(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBottleData();
  }, []);

  const totalHeld = clients.reduce((acc, c) => acc + (c.bottles_held_19l || 0), 0);
  const totalDelivered = clients.reduce((acc, c) => acc + (c.total_19l_delivered || 0), 0);
  const totalReturned = clients.reduce((acc, c) => acc + (c.total_19l_returned || 0), 0);
  const totalDeposits = clients.reduce((acc, c) => acc + (c.deposit_amount || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center space-x-2">
          <Container className="w-7 h-7 text-amber-500" />
          <span>{t('bottleTracking')}</span>
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Track 19 Liter empty dispenser bottles held by customers and security deposits
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total 19L Held Out</p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{totalHeld} bottles</h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-xl">
            <Container className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total 19L Delivered</p>
            <h3 className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{totalDelivered}</h3>
          </div>
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 text-sky-500 rounded-xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total 19L Returned</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalReturned}</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-xl">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Bottle Deposits</p>
            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{formatPKR(totalDeposits)}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Top 19L Bottle Holders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {t('highestBottleHolders')}
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase">
                <tr>
                  <th className="p-3.5">Client Name</th>
                  <th className="p-3.5">Area</th>
                  <th className="p-3.5 text-center">Total Delivered 19L</th>
                  <th className="p-3.5 text-center">Total Returned 19L</th>
                  <th className="p-3.5 text-center font-bold text-amber-600">Bottles Currently Held</th>
                  <th className="p-3.5 text-right">Security Deposit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                    <td className="p-3.5 font-bold text-gray-900 dark:text-white">{c.name}</td>
                    <td className="p-3.5 text-gray-500">{c.area || '-'}</td>
                    <td className="p-3.5 text-center font-semibold">{c.total_19l_delivered || 0}</td>
                    <td className="p-3.5 text-center font-semibold">{c.total_19l_returned || 0}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-3 py-1 rounded-full font-black text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        {c.bottles_held_19l || 0} bottles
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatPKR(c.deposit_amount || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
