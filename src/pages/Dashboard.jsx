import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { StatCard } from '../components/StatCard';
import { formatPKR } from '../utils/helpers';
import { 
  Truck, 
  Banknote, 
  AlertCircle, 
  Users, 
  TrendingUp, 
  PieChart as PieIcon,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { authFetch } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await authFetch('/api/reports/dashboard');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          {t('dashboard')}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('appSubtitle')}
        </p>
      </div>

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('todayDeliveries')}
          value={data.today_deliveries_count || 0}
          icon={Truck}
          color="sky"
          subtext="Total delivery orders completed today"
        />
        <StatCard
          title={t('todaySales')}
          value={formatPKR(data.today_sales || 0)}
          icon={Banknote}
          color="green"
          subtext="Revenue generated today"
        />
        <StatCard
          title={t('totalPending')}
          value={formatPKR(data.total_pending_amount || 0)}
          icon={AlertCircle}
          color="rose"
          subtext="Uncollected balance across all clients"
        />
        <StatCard
          title={t('activeClients')}
          value={data.total_active_clients || 0}
          icon={Users}
          color="indigo"
          subtext="Registered active customers"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Sales Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-sky-500" />
              <span>{t('monthlySalesChart')}</span>
            </h3>
          </div>

          <div className="space-y-3">
            {data.monthly_sales && data.monthly_sales.length > 0 ? (
              data.monthly_sales.map((item) => {
                const maxVal = Math.max(...data.monthly_sales.map((m) => m.total_sales || 1));
                const percentage = Math.round(((item.total_sales || 0) / maxVal) * 100);

                return (
                  <div key={item.month} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <span>{item.month}</span>
                      <span className="text-sky-600 dark:text-sky-400 font-bold">{formatPKR(item.total_sales)} ({item.total_deliveries} deliveries)</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 text-center py-6">No sales history logged yet.</p>
            )}
          </div>
        </div>

        {/* Bottle Split */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
            <PieIcon className="w-5 h-5 text-amber-500" />
            <span>{t('salesByBottleSize')}</span>
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-100 dark:border-sky-900">
              <span className="text-xs font-bold text-sky-800 dark:text-sky-300">19 Liter Jug</span>
              <span className="text-sm font-extrabold text-sky-600 dark:text-sky-400">{data.bottle_split['19L']} units</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900">
              <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300">6 Liter Bottle</span>
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{data.bottle_split['6L']} units</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">1.5 Liter Bottle</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{data.bottle_split['1.5L']} units</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">500 ml Bottle</span>
              <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">{data.bottle_split['500ml']} units</span>
            </div>
          </div>
        </div>

      </div>

      {/* Top Clients & Top Defaulters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top 5 Clients */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {t('topClients')}
            </h3>
            <Link to="/clients" className="text-xs text-sky-500 hover:text-sky-600 font-semibold flex items-center">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.top_clients && data.top_clients.length > 0 ? (
              data.top_clients.map((c) => (
                <div key={c.id} className="py-3 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{c.name}</h4>
                    <p className="text-xs text-gray-400">{c.area || 'N/A'}</p>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                    {formatPKR(c.total_spent)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4">No top clients data.</p>
            )}
          </div>
        </div>

        {/* Top 5 Defaulters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              {t('topDefaulters')}
            </h3>
            <Link to="/payments" className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center">
              View Dues <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.top_defaulters && data.top_defaulters.length > 0 ? (
              data.top_defaulters.map((c) => (
                <div key={c.id} className="py-3 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{c.name}</h4>
                    <p className="text-xs text-gray-400">{c.phone || c.area || 'N/A'}</p>
                  </div>
                  <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg">
                    {formatPKR(c.balance)} Due
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4">No pending accounts!</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
