import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AIFaceCard from '@/components/dashboard/AIFaceCard';
import EmptyState from '@/components/dashboard/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, GitBranch, HeartHandshake, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import DonationButton from '@/components/DonationButton';
import { openSourceMessage } from '@/lib/donations';
import { useAuth } from '@/lib/AuthContext';
import { filterAccessibleAIFaces } from '@/lib/ownership';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: faces, isLoading } = useQuery({
    queryKey: ['aifaces', user?.id, user?.email],
    queryFn: async () => {
      const allFaces = await base44.entities.AIFace.list('-updated_date');
      return filterAccessibleAIFaces(allFaces, user);
    },
    initialData: [],
    enabled: Boolean(user),
  });

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (faces.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-3xl border border-border/50 bg-card p-6 sm:p-8 overflow-hidden relative"
      >
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            SnapTrainer
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Your personal AI identity with an invisible agent team
          </h1>
          <p className="text-muted-foreground mt-3">
            Build an AIFace that learns your tone, files and preferences - and let SnapTrainer route complex tasks through specialists.
          </p>
          <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <HeartHandshake className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm text-muted-foreground flex-1">{openSourceMessage}</p>
            <DonationButton size="sm" />
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/create">
              <Button className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                Create AIFace
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground self-center">
              {faces.length} active AI identit{faces.length === 1 ? 'y' : 'ies'}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: Brain,
            title: 'Personal learning',
            text: 'Your AIFace uses files, preferences, history and feedback to become more accurate.',
          },
          {
            icon: GitBranch,
            title: 'Orchestration',
            text: 'Complex prompts are decomposed, routed and can run through sequential or parallel specialist lanes.',
          },
          {
            icon: ShieldCheck,
            title: 'Transparent control',
            text: 'You can inspect profile, knowledge, feedback, agent steps, quality gates and fallback logic.',
          },
        ].map((item) => (
          <Card key={item.title} className="p-4 border-border/50">
            <item.icon className="w-5 h-5 text-primary mb-3" />
            <h2 className="font-semibold text-sm">{item.title}</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.text}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {faces.map((face, index) => (
          <AIFaceCard key={face.id} face={face} index={index} />
        ))}
      </div>
    </div>
  );
}