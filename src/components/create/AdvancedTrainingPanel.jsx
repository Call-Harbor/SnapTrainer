import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Brain, FlaskConical, ShieldCheck, Workflow } from 'lucide-react';
import { normalizeAdvancedTrainingConfig } from '@/lib/advanced-training';

const fieldClassName = 'min-h-[84px] resize-y bg-secondary/20';

export default function AdvancedTrainingPanel({ value, onChange }) {
  const config = normalizeAdvancedTrainingConfig(value);

  const update = (key, nextValue) => {
    onChange({ ...config, [key]: nextValue });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">Advanced training mode</h3>
                <Badge variant="outline" className="text-[10px]">AI/ML</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Aktiver ekspertstyring af instruktioner, output-kontrakter, eval-kriterier, memory og agent-routing.
              </p>
            </div>
          </div>
          <Switch checked={config.enabled} onCheckedChange={(checked) => update('enabled', checked)} />
        </div>
      </div>

      {config.enabled && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Træningsprofil</Label>
              <Select value={config.mode} onValueChange={(v) => update('mode', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guided">Guided expert</SelectItem>
                  <SelectItem value="strict">Strict spec</SelectItem>
                  <SelectItem value="experimental">Experimental</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Foretrukken orkestrering</Label>
              <Select
                value={config.preferred_collaboration_mode}
                onValueChange={(v) => update('preferred_collaboration_mode', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-routing</SelectItem>
                  <SelectItem value="parallel">Parallel</SelectItem>
                  <SelectItem value="sequential">Sequential</SelectItem>
                  <SelectItem value="debate">Debate</SelectItem>
                  <SelectItem value="hierarchical">Hierarchical</SelectItem>
                  <SelectItem value="broadcast">Broadcast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Training objective</Label>
            <Input
              placeholder="F.eks. 'Svar som en senior ML engineer med fokus på evals, tradeoffs og produktionsrisiko.'"
              value={config.training_objective}
              onChange={(e) => update('training_objective', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <FlaskConical className="w-3.5 h-3.5 text-primary" />
                System directives
              </Label>
              <Textarea
                className={fieldClassName}
                placeholder="Ekspertinstruktioner, ræsonneringsstil, antagelsespolitik, domænegrænser..."
                value={config.system_directives}
                onChange={(e) => update('system_directives', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Output contract</Label>
              <Textarea
                className={fieldClassName}
                placeholder="Formatkrav, sektioner, JSON/Markdown-kontrakt, beslutningsstruktur..."
                value={config.output_contract}
                onChange={(e) => update('output_contract', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                Negative constraints
              </Label>
              <Textarea
                className={fieldClassName}
                placeholder="Hvad AIFacet ikke må gøre: ingen hallucinerede kilder, ingen skjulte antagelser..."
                value={config.negative_constraints}
                onChange={(e) => update('negative_constraints', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Evaluation criteria</Label>
              <Textarea
                className={fieldClassName}
                placeholder="Kriterier for godt output: korrekthed, calibration, edge cases, testbarhed..."
                value={config.evaluation_criteria}
                onChange={(e) => update('evaluation_criteria', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Few-shot examples</Label>
            <Textarea
              className="min-h-[110px] resize-y bg-secondary/20"
              placeholder="Indsæt eksempler på input -> godt output, dårligt output -> rettelse, eller eval cases."
              value={config.few_shot_examples}
              onChange={(e) => update('few_shot_examples', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Memory-policy</Label>
              <Select value={config.memory_policy} onValueChange={(v) => update('memory_policy', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="adaptive">Adaptive</SelectItem>
                  <SelectItem value="strict">Strict curated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Context strategy</Label>
              <Select value={config.context_strategy} onValueChange={(v) => update('context_strategy', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="deep">Deep retrieval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Confidence policy</Label>
              <Select value={config.confidence_policy} onValueChange={(v) => update('confidence_policy', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="state_uncertainty">State uncertainty</SelectItem>
                  <SelectItem value="ask_when_unclear">Ask when unclear</SelectItem>
                  <SelectItem value="cite_assumptions">Cite assumptions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Workflow className="w-3.5 h-3.5 text-primary" />
              Specialist routing notes
            </Label>
            <Textarea
              className={fieldClassName}
              placeholder="Regler for hvornår research, debate, reviewer, guardrail eller broadcast skal bruges."
              value={config.specialist_routing_notes}
              onChange={(e) => update('specialist_routing_notes', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
