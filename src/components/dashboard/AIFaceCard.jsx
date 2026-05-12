import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, MessageSquare, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const modelLabels = {
  gpt_5_mini: 'GPT-5 Mini',
  gemini_3_flash: 'Gemini 3 Flash',
  gpt_5_4: 'GPT-5.4',
  claude_sonnet_4_6: 'Claude Sonnet',
  claude_opus_4_6: 'Claude Opus',
};

const statusConfig = {
  building: { label: 'Building', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  ready: { label: 'Ready', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  training: { label: 'Training', color: 'bg-primary/10 text-primary border-primary/20' },
};

export default function AIFaceCard({ face, index }) {
  const status = statusConfig[face.status] || statusConfig.building;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link to={`/chat/${face.id}`}>
        <Card className="group relative overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer">
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {face.avatar_url ? (
                  <img src={face.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg leading-tight">{face.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {face.role || 'Personal AI'} · {modelLabels[face.model] || face.model}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={cn("text-xs", status.color)}>
                {status.label}
              </Badge>
            </div>

            {face.knowledge_summary && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {face.knowledge_summary}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {face.total_messages || 0}
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  {face.total_files || 0}
                </span>
                <span className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5" />
                  agents
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}