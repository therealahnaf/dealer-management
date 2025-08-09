import React from 'react';
import { DealerBase } from '../../types/api';
import { Building2, User, Phone, MapPin, Edit } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface DealerProfileViewProps {
  dealer: DealerBase;
  onEdit: () => void;
}

const DealerProfileView: React.FC<DealerProfileViewProps> = ({ dealer, onEdit }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dealer Profile</h1>
          <p className="text-gray-600 mt-2">Your registered dealer information</p>
        </div>
        <Button onClick={onEdit} className="flex items-center space-x-2">
          <Edit className="h-4 w-4" />
          <span>Edit Profile</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-blue-600" />
              Company Information
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Customer Code
              </label>
              <p className="text-gray-900 font-medium">
                {dealer.customer_code || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Company Name
              </label>
              <p className="text-gray-900 font-medium">
                {dealer.company_name || 'Not specified'}
              </p>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Contact Information
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Contact Person
              </label>
              <p className="text-gray-900 font-medium">
                {dealer.contact_person || 'Not specified'}
              </p>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Contact Number
                </label>
                <p className="text-gray-900 font-medium">
                  {dealer.contact_number || 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Address Information */}
        <Card className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Address Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Billing Address
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-line">
                  {dealer.billing_address || 'Not specified'}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Shipping Address
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-line">
                  {dealer.shipping_address || 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DealerProfileView;