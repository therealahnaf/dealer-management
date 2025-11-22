import React, { useState, useEffect } from 'react';
import { DealerBase } from '../types/api';
import { dealerApi } from '../services/api';
import Layout from '../components/layout/Layout';
import DealerProfileForm from '../components/dealer/DealerProfileForm';
import DealerProfileView from '../components/dealer/DealerProfileView';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';

const DealerPage: React.FC = () => {
  const [dealer, setDealer] = useState<DealerBase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'view' | 'create' | 'edit'>('view');

  const fetchDealerProfile = async () => {
    setLoading(true);
    try {
      const response = await dealerApi.get<DealerBase>('/dealers/my-profile');
      setDealer(response.data);
      setMode('view');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setMode('create');
      } else {
        setError('Failed to fetch dealer profile');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealerProfile();
  }, []);

  const handleSuccess = () => {
    fetchDealerProfile();
  };

  const handleEdit = () => {
    setMode('edit');
  };

  if (loading) {
    return (
      <Layout>
        <Loader message="Loading dealer profile..." fullScreen={true} />
      </Layout>
    );
  }

  return (
    <Layout>
      {error && (
        <Alert type="error" className="mb-6">
          {error}
        </Alert>
      )}

      {mode === 'view' && dealer && (
        <DealerProfileView dealer={dealer} onEdit={handleEdit} />
      )}

      {mode === 'create' && (
        <DealerProfileForm mode="create" onSuccess={handleSuccess} />
      )}

      {mode === 'edit' && dealer && (
        <DealerProfileForm 
          mode="edit" 
          dealer={dealer} 
          onSuccess={handleSuccess} 
        />
      )}
    </Layout>
  );
};

export default DealerPage;