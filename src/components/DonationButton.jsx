import React from 'react';
import { Button } from '@/components/ui/button';
import { HeartHandshake } from 'lucide-react';
import { paypalDonationUrl } from '@/lib/donations';
import { useLanguage } from '@/lib/i18n';

export default function DonationButton({ size = 'default', variant = 'outline', className = '' }) {
  const { t } = useLanguage();

  return (
    <a href={paypalDonationUrl} target="_blank" rel="noreferrer">
      <Button size={size} variant={variant} className={`gap-2 ${className}`}>
        <HeartHandshake className="w-4 h-4" />
        {t('donation.button')}
      </Button>
    </a>
  );
}
