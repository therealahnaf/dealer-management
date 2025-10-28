import React from 'react';
import { DealerDetails } from '../../types/purchaseOrder';
import { Building2, Phone, Mail, MapPin } from 'lucide-react';

interface DealerInfoCardProps {
  dealer: DealerDetails | null;
}

const DealerInfoCard: React.FC<DealerInfoCardProps> = ({ dealer }) => {
  if (!dealer) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-800">Dealer Information</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center py-4">Dealer information not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-bold text-gray-800">Dealer Information</h2>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{dealer.company_name}</h3>
            <p className="text-gray-600">{dealer.contact_person}</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
              <span className="text-sm text-gray-600">{dealer.contact_number}</span>
            </div>
            {dealer.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <span className="text-sm text-gray-600">{dealer.email}</span>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Billing Address:</p>
                <p className="leading-relaxed">{dealer.billing_address}</p>
                {dealer.shipping_address && dealer.shipping_address !== dealer.billing_address && (
                  <>
                    <p className="font-medium mt-3 mb-1">Shipping Address:</p>
                    <p className="leading-relaxed">{dealer.shipping_address}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerInfoCard;
