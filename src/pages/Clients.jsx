import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ClientModal } from '../components/ClientModal';
import { formatPKR } from '../utils/helpers';
import { Link } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  MapPin, 
  Container 
} from 'lucide-react';

export const Clients = () => {
  const { authFetch } = useAuth();
  const { t } = useLanguage();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);

      const res = await authFetch(`/api/clients?${queryParams.toString()}`);
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, statusFilter]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingClient) {
        await authFetch(`/api/clients/${editingClient.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await authFetch('/api/clients', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      setEditingClient(null);
      fetchClients();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will remove all history records.`)) {
      try {
        await authFetch(`/api/clients/${id}`, { method: 'DELETE' });
        fetchClients();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center space-x-2">
            <Users className="w-7 h-7 text-sky-500" />
            <span>{t('clients')}</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage customer accounts, custom bottle rates, and bottle stock
          </p>
        </div>

        <button
          onClick={() => {
            setEditingClient(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center space-x-2 text-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('addClient')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchClients')}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:outline-none"
        >
          <option value="all">All Clients</option>
          <option value="active">{t('active')}</option>
          <option value="inactive">{t('inactive')}</option>
        </select>
      </div>

      {/* Clients Directory List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">No clients found</h3>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search query or add a new client.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                    {c.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md ${
                      c.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {c.phone && (
                    <div className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.area && (
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{c.area}</span>
                    </div>
                  )}
                </div>

                {/* Custom Rates Badge Row */}
                <div className="bg-sky-50/50 dark:bg-sky-950/30 p-2.5 rounded-xl border border-sky-100 dark:border-sky-900 text-xs mb-4">
                  <div className="font-semibold text-sky-800 dark:text-sky-300 text-[11px] mb-1">
                    Bottle Rates (PKR):
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[11px] text-center font-medium text-gray-700 dark:text-gray-300">
                    <div>19L: Rs.{c.rate_19l}</div>
                    <div>6L: Rs.{c.rate_6l}</div>
                    <div>1.5L: Rs.{c.rate_1_5l}</div>
                    <div>500m: Rs.{c.rate_500ml}</div>
                  </div>
                </div>

                {/* Financial & Bottle Balance Row */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-xl">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">{t('runningBalance')}</span>
                    <span className={`font-extrabold ${c.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {formatPKR(c.balance)}
                    </span>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-2.5 rounded-xl">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold flex items-center space-x-1">
                      <Container className="w-3 h-3 text-amber-500" />
                      <span>19L Held</span>
                    </span>
                    <span className="font-extrabold text-gray-800 dark:text-gray-200">
                      {c.bottles_held_19l || 0} bottles
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <Link
                  to={`/clients/${c.id}`}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800 dark:text-sky-400 flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </Link>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingClient(c);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-gray-700"
                    title={t('editClient')}
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-700"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleCreateOrUpdate}
        initialData={editingClient}
      />

    </div>
  );
};
