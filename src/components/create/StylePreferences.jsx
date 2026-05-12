import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function StylePreferences({ preferences, onChange }) {
  const update = (key, value) => {
    onChange({ ...preferences, [key]: value });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tone</Label>
        <Input
          placeholder="F.eks. venlig, professionel, humoristisk..."
          value={preferences.tone || ''}
          onChange={(e) => update('tone', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Sprog</Label>
        <Input
          placeholder="F.eks. dansk, engelsk, blandet..."
          value={preferences.language || ''}
          onChange={(e) => update('language', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Detaljering</Label>
          <Select
            value={preferences.verbosity || 'medium'}
            onValueChange={(v) => update('verbosity', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kort">Kort og præcis</SelectItem>
              <SelectItem value="medium">Balanceret</SelectItem>
              <SelectItem value="detaljeret">Detaljeret</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Formalitet</Label>
          <Select
            value={preferences.formality || 'neutral'}
            onValueChange={(v) => update('formality', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uformel">Uformel</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="formel">Formel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}