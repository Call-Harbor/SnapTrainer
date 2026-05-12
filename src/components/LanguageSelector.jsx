import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/lib/i18n';

export default function LanguageSelector() {
  const { language, setLanguage, languages } = useLanguage();

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="h-9 w-[118px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((item) => (
          <SelectItem key={item.code} value={item.code}>
            {item.short} · {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
