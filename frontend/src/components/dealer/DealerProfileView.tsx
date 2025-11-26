import React from 'react';
import { DealerBase } from '../../types/api';
import { Building2, User, Phone, MapPin, Edit } from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface DealerProfileViewProps {
  dealer: DealerBase;
  onEdit: () => void;
}

const DealerProfileView: React.FC<DealerProfileViewProps> = ({ dealer, onEdit }) => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Minimal Header with Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-orange" />
            <h1 className="text-2xl font-bold text-brand-brown">Dealer Profile</h1>
          </div>
          <Button onClick={onEdit} className="">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-brand-brown flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-brand-orange" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Customer Code
                  </label>
                  <p className="text-gray-700 font-medium">
                    {dealer.customer_code || 'Not specified'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Company Name
                  </label>
                  <p className="text-gray-700 font-medium">
                    {dealer.company_name || 'Not specified'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-brand-brown flex items-center">
                  <User className="h-5 w-5 mr-2 text-brand-orange" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Contact Person
                  </label>
                  <p className="text-gray-700 font-medium">
                    {dealer.contact_person || 'Not specified'}
                  </p>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Contact Number
                    </label>
                    <p className="text-gray-700 font-medium">
                      {dealer.contact_number || 'Not specified'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-brand-brown flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-brand-orange" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Billing Address
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-line">
                        {dealer.billing_address || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Shipping Address
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-line">
                        {dealer.shipping_address || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerProfileView;