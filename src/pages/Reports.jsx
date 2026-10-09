import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPKR, formatDate } from '../utils/helpers';
import { BarChart3, Download, Calendar, Banknote, Truck } from 'lucide-react';

export const Reports = () => {
  const { authFetch } = useAuth();
  const { t } = useLanguage();

  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`/api/reports/range?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const handleExportCSV = () => {
    window.location.href = `/api/reports/export-csv?startDate=${startDate}&endDate=${endDate}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center space-x-2">
            <BarChart3 className="w-7 h-7 text-sky-500" />
            <span>{t('reports')}</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Custom date range delivery logs, revenue reports and CSV exports
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 text-sm"
        >
          <Download className="w-4 h-4" />
          <span>{t('exportCSV')}</span>
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('dateRange')}:</span>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Summary Stat Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase">Total Sales Billed</p>
              <h3 className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">{formatPKR(report.totalSales)}</h3>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase">Total Cash Wasool</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatPKR(report.totalCollected)}</h3>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase">Total 19L Delivered</p>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{report.totals.qty_19l} bottles</h3>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase">19L Returned</p>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{report.totals.returned_19l} bottles</h3>
            </div>
          </div>

          {/* Delivery Logs in Selected Range */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Deliveries Log ({report.deliveries.length} entries)
              </h3>
            </div>

            {report.deliveries.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No deliveries found in selected date range.</p>
            ) : (
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
                      <th className="p-3.5 text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {report.deliveries.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                        <td className="p-3.5 font-semibold text-gray-900 dark:text-white">{formatDate(d.delivery_date)}</td>
                        <td className="p-3.5 font-bold text-gray-900 dark:text-white">{d.client_name}</td>
                        <td className="p-3.5 font-bold text-sky-600">{d.qty_19l}</td>
                        <td className="p-3.5">{d.qty_6l}</td>
                        <td className="p-3.5">{d.qty_1_5l}</td>
                        <td className="p-3.5">{d.qty_500ml}</td>
                        <td className="p-3.5 text-amber-600 font-bold">{d.returned_19l}</td>
                        <td className="p-3.5 text-right font-extrabold text-gray-900 dark:text-white">{formatPKR(d.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}

    </div>
  );
};
