import React from 'react';
import { cn } from '@/lib/utils';
import { Zap, Brain, Crown, Sparkles, Gem, HeartHandshake } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const models = [
  {
    id: 'gpt_5_mini',
    name: 'GPT-5 Mini',
    descriptionKey: 'model.gptMini',
    icon: Zap,
    tier: 'Free',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'gemini_3_flash',
    name: 'Gemini 3 Flash',
    descriptionKey: 'model.gemini',
    icon: Sparkles,
    tier: 'Free',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'gpt_5_4',
    name: 'GPT-5.4',
    descriptionKey: 'model.gptAdvanced',
    icon: Brain,
    tier: 'Free',
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 'claude_sonnet_4_6',
    name: 'Claude Sonnet',
    descriptionKey: 'model.claudeSonnet',
    icon: Gem,
    tier: 'Free',
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 'claude_opus_4_6',
    name: 'Claude Opus',
    descriptionKey: 'model.claudeOpus',
    icon: Crown,
    tier: 'Free',
    color: 'from-rose-500 to-pink-500',
  },
];

export default function ModelSelector({ selected, onSelect }) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-3">
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-start gap-3">
        <HeartHandshake className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium">{t('model.freeTitle')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('model.freeText')}
          </p>
        </div>
      </div>
      {models.map((model) => {
        const isSelected = selected === model.id;
        return (
          <button
            key={model.id}
            onClick={() => onSelect(model.id)}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200",
              isSelected
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                : "border-border/50 hover:border-border hover:bg-secondary/50"
            )}
          >
            <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0", model.color)}>
              <model.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{model.name}</span>
                <span className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                  "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                )}>
                  {model.tier}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{t(model.descriptionKey)}</p>
            </div>
            <div className={cn(
              "w-5 h-5 rounded-full border-2 shrink-0 transition-all",
              isSelected
                ? "border-primary bg-primary"
                : "border-muted-foreground/30"
            )}>
              {isSelected && (
                <svg viewBox="0 0 20 20" fill="white" className="w-full h-full p-0.5">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}