import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GitBranch, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import DonationButton from '@/components/DonationButton';
import { useLanguage } from '@/lib/i18n';

export default function EmptyState() {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-24 px-4"
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
        <GitBranch className="w-3.5 h-3.5" />
        SnapTrainer
      </div>
      <h2 className="text-2xl font-bold mb-2">{t('empty.title')}</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        {t('empty.text')}
      </p>
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center max-w-lg mb-6">
        <p className="text-sm text-muted-foreground">{t('donation.message')}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/create">
          <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
            <Plus className="w-5 h-5" />
            {t('empty.cta')}
          </Button>
        </Link>
        <DonationButton size="lg" />
      </div>
    </motion.div>
  );
}