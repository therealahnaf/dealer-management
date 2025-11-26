import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, User, Building2, Phone, MapPin } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Textarea } from '../ui/textarea';

const dealerFormSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 chars'),
  confirmPassword: z.string(),
  full_name: z.string().min(1, 'Required'),
  contact_number: z.string().optional(),
  company_name: z.string().min(1, 'Required'),
  contact_person: z.string().optional(),
  billing_address: z.string().optional(),
  shipping_address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "No match",
  path: ["confirmPassword"],
});

type DealerFormValues = z.infer<typeof dealerFormSchema>;

interface CreateDealerFormProps {
  onSubmit: (data: Omit<DealerFormValues, 'confirmPassword'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CreateDealerForm: React.FC<CreateDealerFormProps> = ({ onSubmit, onCancel, loading = false }) => {
  const form = useForm<DealerFormValues>({
    resolver: zodResolver(dealerFormSchema),
    defaultValues: {
      email: '', password: '', confirmPassword: '', full_name: '', contact_number: '',
      company_name: '', contact_person: '', billing_address: '', shipping_address: '',
    },
  });

  const handleSubmit = async (data: DealerFormValues) => {
    const { confirmPassword, ...submitData } = data;
    await onSubmit(submitData);
  };

  return (
    <Form {...form}>
      {/* Container set to w-full to expand horizontally */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full">
        <Card className="border-brand-orange/20 shadow-sm bg-white">
          <CardContent className="p-6">
            
            {/* Horizontal Split Layout: 50% Left | Divider | 50% Right */}
            <div className="flex flex-col xl:flex-row gap-8">
              
              {/* --- LEFT SIDE: USER INFO --- */}
              <div className="flex-1 space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b pb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-orange" /> User Credentials
                </h3>

                <div className="space-y-3">
                  {/* Row 1: Name & Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="full_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-600">Full Name</FormLabel>
                        <div className="relative">
                          <User className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                          <FormControl><Input placeholder="John Doe" className="pl-8 h-9 text-sm" {...field} /></FormControl>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="contact_number" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-600">Phone Number</FormLabel>
                        <div className="relative">
                          <Phone className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                          <FormControl><Input placeholder="+880..." className="pl-8 h-9 text-sm" {...field} /></FormControl>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                  </div>

                  {/* Row 2: Email (Full Width) */}
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-600">Email Address</FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                        <FormControl><Input placeholder="dealer@example.com" className="pl-8 h-9 text-sm" {...field} /></FormControl>
                      </div>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />

                  {/* Row 3: Passwords */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-600">Password</FormLabel>
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                          <FormControl><Input type="password" placeholder="••••••••" className="pl-8 h-9 text-sm" {...field} /></FormControl>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-600">Confirm Password</FormLabel>
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                          <FormControl><Input type="password" placeholder="••••••••" className="pl-8 h-9 text-sm" {...field} /></FormControl>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="hidden xl:block w-px bg-gray-200 self-stretch"></div>

              {/* --- RIGHT SIDE: DEALER INFO --- */}
              <div className="flex-1 space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brand-orange" /> Dealer Details
                </h3>

                <div className="space-y-3">
                  {/* Row 1: Company & Contact Person */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="company_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-600">Company Name</FormLabel>
                        <div className="relative">
                          <Building2 className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                          <FormControl><Input placeholder="Company Ltd" className="pl-8 h-9 text-sm" {...field} /></FormControl>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="contact_person" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-600">Contact Person</FormLabel>
                        <div className="relative">
                          <User className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                          <FormControl><Input placeholder="Manager Name" className="pl-8 h-9 text-sm" {...field} /></FormControl>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                  </div>

                  {/* Row 2: Addresses Side-by-Side */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="billing_address" render={({ field }) => (
                      <FormItem className="h-full">
                        <FormLabel className="text-xs font-semibold text-gray-600">Billing Address</FormLabel>
                        <div className="relative h-full">
                          <MapPin className="absolute left-2.5 top-3 h-3.5 w-3.5 text-gray-400" />
                          <FormControl>
                            <Textarea 
                              placeholder="Street address..." 
                              className="pl-8 text-sm min-h-[88px] resize-none" 
                              {...field} 
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="shipping_address" render={({ field }) => (
                      <FormItem className="h-full">
                        <FormLabel className="text-xs font-semibold text-gray-600">Shipping Address</FormLabel>
                        <div className="relative h-full">
                          <MapPin className="absolute left-2.5 top-3 h-3.5 w-3.5 text-gray-400" />
                          <FormControl>
                            <Textarea 
                              placeholder="Delivery address..." 
                              className="pl-8 text-sm min-h-[88px] resize-none" 
                              {...field} 
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={loading}
                className="text-gray-500 hover:text-gray-900"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-brand-orange hover:bg-brand-gray-orange text-white px-8"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Create Dealer Account'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default CreateDealerForm;