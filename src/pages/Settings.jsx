import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Settings as SettingsIcon, 
  Languages, 
  Sun, 
  Moon, 
  Database, 
  Download, 
  Upload, 
  Lock, 
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const Settings = () => {
  const { authFetch } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  const [restoreMsg, setRestoreMsg] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });

    try {
      const res = await authFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPassMsg({ type: 'success', text: t('successMessage') });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPassMsg({ type: 'error', text: err.message });
    }
  };

  const handleDownloadBackup = () => {
    window.location.href = '/api/backup/download';
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!window.confirm('Warning: Restoring a database file will overwrite all current data. Proceed?')) {
      return;
    }

    setUploading(true);
    setRestoreMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('database', file);

      const token = localStorage.getItem('wsm_token');
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setRestoreMsg({ type: 'success', text: json.message });
    } catch (err) {
      setRestoreMsg({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleClearDemoData = async () => {
    if (window.confirm('Are you sure you want to delete all sample clients, deliveries, and payment data? This cannot be undone.')) {
      try {
        const res = await authFetch('/api/backup/reset', { method: 'POST' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);

        setRestoreMsg({ type: 'success', text: json.message });
      } catch (err) {
        setRestoreMsg({ type: 'error', text: err.message });
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center space-x-2">
          <SettingsIcon className="w-7 h-7 text-sky-500" />
          <span>{t('settings')}</span>
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Customize language, theme, security and database backup options
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Language & Theme Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Languages className="w-5 h-5 text-sky-500" />
            <span>Preferences</span>
          </h3>

          {/* Language Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">{t('languageToggle')}</p>
              <p className="text-[11px] text-gray-400">Switch between English and Roman Urdu</p>
            </div>
            <button
              onClick={() => toggleLanguage()}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
            >
              {lang === 'en' ? 'Roman Urdu' : 'English'}
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">{t('themeToggle')}</p>
              <p className="text-[11px] text-gray-400">Toggle light or dark appearance</p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-amber-400 flex items-center space-x-2 text-xs font-bold"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>
        </div>

        {/* Database Backup & Restore Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-emerald-500" />
            <span>{t('backupRestore')}</span>
          </h3>

          <p className="text-xs text-gray-400">
            Download a backup copy of your database, restore from file, or clear all sample test data.
          </p>

          {restoreMsg.text && (
            <div className={`p-3 text-xs rounded-xl font-semibold ${restoreMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : 'bg-red-50 text-red-600 dark:bg-red-950/40'}`}>
              {restoreMsg.text}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleDownloadBackup}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{t('downloadBackup')}</span>
            </button>

            <label className="w-full py-2.5 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Restoring...' : t('restoreBackup')}</span>
              <input type="file" accept=".sqlite,.db" onChange={handleRestoreFile} className="hidden" />
            </label>

            {/* Clear All Demo Data Button */}
            <button
              onClick={handleClearDemoData}
              className="w-full py-2.5 px-4 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-900 flex items-center justify-center space-x-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Demo Data (Start Fresh)</span>
            </button>
          </div>
        </div>

        {/* Change Admin Password */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Lock className="w-5 h-5 text-indigo-500" />
            <span>{t('changePassword')}</span>
          </h3>

          {passMsg.text && (
            <div className={`p-3 text-xs rounded-xl font-semibold ${passMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : 'bg-red-50 text-red-600 dark:bg-red-950/40'}`}>
              {passMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
              >
                {t('save')}
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
