import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState() {
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
      <h2 className="text-2xl font-bold mb-2">Velkommen til AIFaces</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Opret dit første AIFace — en personlig AI-agent der lærer at forstå dig, din stil og dine behov over tid.
      </p>
      <Link to="/create">
        <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
          <Plus className="w-5 h-5" />
          Opret dit første AIFace
        </Button>
      </Link>
    </motion.div>
  );
}