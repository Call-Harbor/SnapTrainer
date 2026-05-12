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
          placeholder="E.g. friendly, professional, humorous..."
          value={preferences.tone || ''}
          onChange={(e) => update('tone', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Language</Label>
        <Input
          placeholder="E.g. English, Danish, mixed..."
          value={preferences.language || ''}
          onChange={(e) => update('language', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Detail level</Label>
          <Select
            value={preferences.verbosity || 'medium'}
            onValueChange={(v) => update('verbosity', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kort">Short and precise</SelectItem>
              <SelectItem value="medium">Balanced</SelectItem>
              <SelectItem value="detaljeret">Detailed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Formality</Label>
          <Select
            value={preferences.formality || 'neutral'}
            onValueChange={(v) => update('formality', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uformel">Informal</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="formel">Formal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}