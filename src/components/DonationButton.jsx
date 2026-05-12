import React from 'react';
import { Button } from '@/components/ui/button';
import { HeartHandshake } from 'lucide-react';
import { paypalDonationUrl } from '@/lib/donations';

export default function DonationButton({ size = 'default', variant = 'outline', className = '' }) {
  return (
    <a href={paypalDonationUrl} target="_blank" rel="noreferrer">
      <Button size={size} variant={variant} className={`gap-2 ${className}`}>
        <HeartHandshake className="w-4 h-4" />
        Support via PayPal
      </Button>
    </a>
  );
}
