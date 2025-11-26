import React from 'react';
import { DealerDetails } from '../../types/purchaseOrder';
import { Building2, Phone, Mail, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface DealerInfoCardProps {
  dealer: DealerDetails | null;
}

const DealerInfoCard: React.FC<DealerInfoCardProps> = ({ dealer }) => {
  if (!dealer) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-gray-600" />
            <CardTitle className="text-lg text-gray-800">Dealer Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">Dealer information not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-gray-600" />
          <CardTitle className="text-md text-gray-800">Dealer</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Company Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">{dealer.company_name}</h3>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">{dealer.contact_person}</p>
            </div>
          </div>

          <Separator />
          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Information</h4>
            <div className="space-y-2">
              {dealer.contact_number && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-700">{dealer.contact_number}</span>
                </div>
              )}
              {dealer.email && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-700">{dealer.email}</span>
                </div>
              )}
            </div>
          </div>

          {dealer.billing_address && (
            <>
              <Separator />
              {/* Address Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address Information</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-700 mb-1">Billing Address:</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{dealer.billing_address}</p>
                    </div>
                  </div>
                  
                  {dealer.shipping_address && dealer.shipping_address !== dealer.billing_address && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700 mb-1">Shipping Address:</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{dealer.shipping_address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DealerInfoCard;
