'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Loader2, Mail, MoreHorizontal, ShieldCheck, UserRound } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { updateCustomerRole } from '@/features/shop/actions/customer';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CustomerActionsProps {
  customer: {
    id: number;
    email: string;
    role: 'admin' | 'customer' | null;
  };
}

export function CustomerActions({ customer }: CustomerActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(customer.role);

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(customer.email);
      toast.success('Email copied to clipboard.');
    } catch (error) {
      toast.error('Could not copy email.');
    }
  }

  async function handleRoleChange(nextRole: 'admin' | 'customer') {
    setLoading(true);
    const result = await updateCustomerRole(customer.id, nextRole);

    if (result.success) {
      toast.success(nextRole === 'admin' ? 'Customer promoted to admin.' : 'Admin changed back to customer.');
      setRole(nextRole);
    } else {
      toast.error(result.error || 'Role update failed.');
    }

    setLoading(false);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-900" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MoreHorizontal className="w-5 h-5" />}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={handleCopyEmail}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Email
        </DropdownMenuItem>
        <DropdownMenuItem render={<a href={`mailto:${customer.email}`} />}>
          <Mail className="w-4 h-4 mr-2" />
          Send Email
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {role === 'admin' ? (
          <DropdownMenuItem onClick={() => handleRoleChange('customer')}>
            <UserRound className="w-4 h-4 mr-2" />
            Make Customer
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => handleRoleChange('admin')}>
            <ShieldCheck className="w-4 h-4 mr-2" />
            Promote To Admin
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

