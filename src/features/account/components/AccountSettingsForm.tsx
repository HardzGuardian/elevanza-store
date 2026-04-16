'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { Loader2, Save } from 'lucide-react';
import { updateAccountSettings } from '../actions/account-actions';

const accountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountSettingsFormProps {
  initialData: {
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
  };
}

export function AccountSettingsForm({ initialData }: AccountSettingsFormProps) {
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: initialData.name,
      phone: initialData.phone || '',
      address: initialData.address || '',
    },
  });

  const onSubmit = async (data: AccountFormData) => {
    setIsPending(true);
    try {
      const result = await updateAccountSettings(data);
      if (result.success) {
        toast.success('Settings updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update settings');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            {...register('name')} 
            className="rounded-2xl border-gray-100 focus:ring-indigo-600/5"
          />
          {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name.message}</p>}
        </div>

        <div className="space-y-2 text-gray-400">
          <Label htmlFor="email" className="opacity-50">Email Address (Read Only)</Label>
          <Input 
            id="email" 
            defaultValue={initialData.email} 
            disabled 
            className="rounded-2xl border-gray-50 bg-gray-50/50 cursor-not-allowed italic"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone" 
            {...register('phone')} 
            placeholder="+1 (555) 000-0000"
            className="rounded-2xl border-gray-100 focus:ring-indigo-600/5"
          />
          {errors.phone && <p className="text-xs text-red-500 font-bold">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Shipping Address</Label>
          <Textarea 
            id="address" 
            {...register('address')} 
            placeholder="123 Luxury Lane, Fashion District..."
            className="rounded-2xl border-gray-100 focus:ring-indigo-600/5 min-h-[100px] resize-none"
          />
          {errors.address && <p className="text-xs text-red-500 font-bold">{errors.address.message}</p>}
        </div>
      </div>

      <div className="pt-4">
        <Button 
          type="submit" 
          disabled={isPending || !isDirty}
          className="w-full md:w-auto px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 font-bold uppercase tracking-widest text-[10px] h-12 shadow-lg shadow-indigo-100"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
