import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle2, GitBranch, PenLine, Search, ShieldCheck, Workflow } from 'lucide-react';

const icons = {
  orchestrator: Workflow,
  planner: GitBranch,
  research: Search,
  analyst: Brain,
  writer: PenLine,
  organizer: GitBranch,
  reviewer: ShieldCheck,
};

export default function OrchestrationActivity({ plan, compact = false }) {
  const trace = plan?.trace || plan?.agent_trace || [];
  if (trace.length === 0) return null;

  return (
    <div className="mt-3 rounded-xl border border-border/50 bg-secondary/30 p-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <p className="text-xs font-semibold">Agentaktivitet</p>
          {!compact && plan?.summary && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{plan.summary}</p>
          )}
        </div>
        <Badge variant="outline" className="text-[10px]">
          {trace.length} trin
        </Badge>
      </div>
      <div className="grid gap-2">
        {trace.map((step) => {
          const Icon = icons[step.agent_id] || Workflow;
          return (
            <div key={step.agent_id} className="flex items-start gap-2 text-xs">
              <div className="w-6 h-6 rounded-lg bg-background border border-border/60 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">{step.agent_name}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                </div>
                {!compact && (
                  <p className="text-muted-foreground leading-snug">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
