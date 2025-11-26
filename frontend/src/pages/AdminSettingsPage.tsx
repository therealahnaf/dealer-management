import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Lock } from 'lucide-react';
import { settingsApi } from '../services/api';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

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
              <Card className="overflow-hidden">
                <CardContent className="p-8 space-y-8">
                  {/* VAT Setting - Non-configurable */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-bold text-brand-brown uppercase">
                        VAT Rate
                      </label>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-300">
                        <Lock className="w-3 h-3 mr-1" />
                        Fixed
                      </Badge>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-brand-brown">{(settings.vat * 100).toFixed(2)}%</span>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Standard VAT Rate</p>
                          <p className="text-xs text-gray-500">Applied to all purchase orders</p>
                        </div>
                      </div>
                    </div>
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

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <Button
                      onClick={handleSave}
                      loading={saving}
                      disabled={!hasChanges}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        fetchSettings();
                        setHasChanges(false);
                      }}
                      disabled={!hasChanges || saving}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminSettingsPage;
