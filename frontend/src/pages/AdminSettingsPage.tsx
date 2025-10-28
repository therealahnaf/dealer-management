import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { settingsApi } from '../services/api';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';

interface AppSettings {
  vat: number;
  commission: number;
}

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({ vat: 0.15, commission: 0.15 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await settingsApi.get('/settings/');
      setSettings(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AppSettings, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setSettings(prev => ({
        ...prev,
        [field]: numValue
      }));
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      await settingsApi.put('/settings/', settings);
      
      setSuccess('Settings updated successfully!');
      setHasChanges(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <Loader message="Loading Settings..." />
          ) : error ? (
            <div className="max-w-2xl mx-auto">
              <Alert type="error" className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
                {error}
              </Alert>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">

              {/* Success Alert */}
              {success && (
                <Alert type="success" className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-6">
                  {success}
                </Alert>
              )}

              {/* Settings Form */}
              <div className="bg-white rounded-2xl shadow-lg border border-brand-orange/20 overflow-hidden">
                <div className="bg-brand-light-orange px-8 py-6 border-b border-brand-orange/20">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-brand-orange" />
                    <h2 className="text-lg font-bold text-brand-brown">Financial Settings</h2>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* VAT Setting */}
                  <div className="space-y-3">
                    <label htmlFor="vat" className="block text-sm font-bold text-brand-brown uppercase">
                      VAT Rate (%)
                    </label>
                    <div className="relative">
                      <input
                        id="vat"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={settings.vat * 100}
                        onChange={(e) => handleInputChange('vat', (parseFloat(e.target.value) / 100).toString())}
                        className="w-full px-4 py-3 border border-brand-orange/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all duration-200"
                        placeholder="15"
                      />
                      <span className="absolute right-4 top-3 text-brand-gray-orange font-semibold">%</span>
                    </div>
                    <p className="text-sm text-brand-gray-orange/70">Current VAT rate applied to all purchase orders</p>
                  </div>

                  {/* Commission Setting */}
                  <div className="space-y-3">
                    <label htmlFor="commission" className="block text-sm font-bold text-brand-brown uppercase">
                      Commission Rate (%)
                    </label>
                    <div className="relative">
                      <input
                        id="commission"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={settings.commission * 100}
                        onChange={(e) => handleInputChange('commission', (parseFloat(e.target.value) / 100).toString())}
                        className="w-full px-4 py-3 border border-brand-orange/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all duration-200"
                        placeholder="15"
                      />
                      <span className="absolute right-4 top-3 text-brand-gray-orange font-semibold">%</span>
                    </div>
                    <p className="text-sm text-brand-gray-orange/70">Commission rate for dealer transactions</p>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-brand-light-orange rounded-lg p-6 border border-brand-orange/20">
                    <h3 className="font-bold text-brand-brown mb-4">Current Settings Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-brand-orange/20">
                        <p className="text-xs font-bold text-brand-gray-orange uppercase mb-2">VAT Rate</p>
                        <p className="text-2xl font-bold text-brand-brown">{(settings.vat * 100).toFixed(2)}%</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-brand-orange/20">
                        <p className="text-xs font-bold text-brand-gray-orange uppercase mb-2">Commission Rate</p>
                        <p className="text-2xl font-bold text-brand-brown">{(settings.commission * 100).toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-brand-orange/20">
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || saving}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                        hasChanges && !saving
                          ? 'bg-brand-orange text-white hover:shadow-lg'
                          : 'bg-brand-pastel-gray-orange/30 text-brand-brown/50 cursor-not-allowed'
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        fetchSettings();
                        setHasChanges(false);
                      }}
                      disabled={!hasChanges || saving}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                        hasChanges && !saving
                          ? 'bg-brand-light-orange text-brand-brown hover:bg-brand-pastel-gray-orange/50'
                          : 'bg-brand-light-orange/50 text-brand-brown/40 cursor-not-allowed'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-8 bg-brand-light-orange border border-brand-orange/30 rounded-lg p-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-brand-brown mb-2">About These Settings</h3>
                    <ul className="text-sm text-brand-brown/80 space-y-1">
                      <li>• VAT Rate: Applied to all purchase orders automatically</li>
                      <li>• Commission Rate: Used for dealer transaction calculations</li>
                      <li>• Changes take effect immediately for new transactions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminSettingsPage;
