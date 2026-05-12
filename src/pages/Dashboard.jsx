import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AIFaceCard from '@/components/dashboard/AIFaceCard';
import EmptyState from '@/components/dashboard/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data: faces, isLoading } = useQuery({
    queryKey: ['aifaces'],
    queryFn: () => base44.entities.AIFace.list('-updated_date'),
    initialData: [],
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
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">Dine AIFaces</h1>
        <p className="text-muted-foreground mt-1">
          {faces.length} personlig{faces.length !== 1 ? 'e' : ''} AI-agent{faces.length !== 1 ? 'er' : ''}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {faces.map((face, index) => (
          <AIFaceCard key={face.id} face={face} index={index} />
        ))}
      </div>
    </div>
  );
}