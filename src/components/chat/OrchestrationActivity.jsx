import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  GitBranch,
  Layers,
  PenLine,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react';

const icons = {
  intent: Search,
  orchestrator: Workflow,
  planner: GitBranch,
  research: Search,
  analyst: Brain,
  strategist: Brain,
  writer: PenLine,
  creative: Sparkles,
  organizer: GitBranch,
  reviewer: ShieldCheck,
  memory: Layers,
  context: Layers,
  guardrail: AlertTriangle,
  synthesizer: Workflow,
  proactive: Sparkles,
  executor: Zap,
};

export default function OrchestrationActivity({ plan, compact = false }) {
  const trace = plan?.trace || plan?.agent_trace || [];
  const lifecycle = plan?.lifecycle || [];
  const subtasks = plan?.subtasks || [];
  const handoffs = plan?.handoffs || [];
  const qualityGates = plan?.quality_gates || [];
  const recoveryPolicy = plan?.recovery_policy;
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
        <div className="flex items-center gap-1.5">
          {plan?.collaboration_mode && (
            <Badge variant="outline" className="text-[10px]">
              {plan.collaboration_mode}
            </Badge>
          )}
          {plan?.execution_mode && (
            <Badge variant="outline" className="text-[10px]">
              {plan.execution_mode}
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px]">
            {trace.length} agenter
          </Badge>
        </div>
      </div>
      {(plan?.workflow_type || plan?.intelligence_layer) && !compact && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-background/70 px-2.5 py-2 text-[11px] text-muted-foreground">
          <Workflow className="w-3.5 h-3.5 text-primary" />
          <span className="font-medium text-foreground">Intelligence layer:</span>
          <span>{plan.intelligence_layer || 'AIFace'}</span>
          <span className="text-muted-foreground/60">/</span>
          <span className="font-medium text-foreground">Workflow:</span>
          <span>{plan.workflow_type}</span>
        </div>
      )}
      {!compact && lifecycle.length > 0 && (
        <div className="mb-3 grid grid-cols-2 md:grid-cols-3 gap-1.5">
          {lifecycle.map((stage, index) => (
            <div key={stage.id} className="rounded-lg border border-border/50 bg-background/60 px-2 py-1.5">
              <p className="text-[10px] font-semibold">
                {index + 1}. {stage.title}
              </p>
              <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">
                {stage.description}
              </p>
            </div>
          ))}
        </div>
      )}
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
                  {step.execution === 'parallel' && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0">parallel</Badge>
                  )}
                  {step.stance && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{step.stance}</Badge>
                  )}
                </div>
                {!compact && (
                  <p className="text-muted-foreground leading-snug">
                    {step.output || step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!compact && subtasks.length > 0 && (
        <div className="mt-3 border-t border-border/50 pt-3">
          <p className="text-[11px] font-semibold mb-2">Task decomposition</p>
          <div className="grid gap-1.5">
            {subtasks.map((task, index) => (
              <div key={task.id} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="w-5 h-5 rounded-md bg-background border border-border/60 flex items-center justify-center text-[10px] text-foreground">
                  {index + 1}
                </span>
                <span className="flex-1">{task.title}</span>
                <Badge variant="outline" className="text-[9px] px-1 py-0">
                  {task.execution}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      {!compact && handoffs.length > 0 && (
        <div className="mt-3 border-t border-border/50 pt-3">
          <p className="text-[11px] font-semibold mb-2">Context handoffs</p>
          <div className="grid gap-1.5">
            {handoffs.slice(0, 6).map((handoff) => (
              <div key={`${handoff.from}-${handoff.to}`} className="text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">{handoff.from}</span>
                <span>{' -> '}</span>
                <span className="font-medium text-foreground">{handoff.to}</span>
                <p className="leading-snug">{handoff.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {!compact && qualityGates.length > 0 && (
        <div className="mt-3 border-t border-border/50 pt-3">
          <p className="text-[11px] font-semibold mb-2">Quality gates</p>
          <div className="flex flex-wrap gap-1.5">
            {qualityGates.map((gate) => (
              <Badge key={gate} variant="outline" className="text-[10px] font-normal">
                {gate}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {!compact && recoveryPolicy && (
        <div className="mt-3 border-t border-border/50 pt-3 grid gap-1.5 text-[11px] text-muted-foreground">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-primary" />
            Retry, fallback and escalation
          </p>
          <p><span className="font-medium text-foreground">Retry:</span> {recoveryPolicy.retry}</p>
          <p><span className="font-medium text-foreground">Fallback:</span> {recoveryPolicy.fallback}</p>
          <p><span className="font-medium text-foreground">Escalation:</span> {recoveryPolicy.escalation}</p>
          {plan?.proactive_insight_policy && (
            <p><span className="font-medium text-foreground">Proactive:</span> {plan.proactive_insight_policy}</p>
          )}
        </div>
      )}
    </div>
  );
}
