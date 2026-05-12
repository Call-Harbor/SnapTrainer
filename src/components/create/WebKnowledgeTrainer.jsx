import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Globe, HelpCircle, Plus, Trash2 } from 'lucide-react';

const emptyWebSource = {
  url: '',
  crawl_mode: 'smart',
  crawl_depth: 'page',
  include_patterns: '',
  exclude_patterns: '',
  notes: '',
};

const emptyFaq = {
  question: '',
  answer: '',
  tags: '',
};

export default function WebKnowledgeTrainer({
  webSources,
  onWebSourcesChange,
  faqItems,
  onFaqItemsChange,
  disabled = false,
}) {
  const updateWebSource = (index, key, value) => {
    onWebSourcesChange(webSources.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const updateFaq = (index, key, value) => {
    onFaqItemsChange(faqItems.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">Web crawling & FAQ training</h3>
              <Badge variant="outline" className="text-[10px]">for everyone</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Add URLs, documentation pages, sitemap rules and FAQs, so the AIFace can use them in its knowledge sweep.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            URLs to crawl
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={disabled}
            onClick={() => onWebSourcesChange([...webSources, emptyWebSource])}
          >
            <Plus className="w-3.5 h-3.5" />
            Add URL
          </Button>
        </div>

        {webSources.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
            No URLs yet. Add a website, docs page, sitemap or knowledge base.
          </div>
        ) : (
          <div className="space-y-3">
            {webSources.map((source, index) => (
              <div key={index} className="rounded-xl border border-border/50 p-4 space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={source.url}
                    disabled={disabled}
                    placeholder="https://example.com/docs or https://example.com/sitemap.xml"
                    onChange={(e) => updateWebSource(index, 'url', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={disabled}
                    onClick={() => onWebSourcesChange(webSources.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Crawl mode</Label>
                    <Select
                      value={source.crawl_mode}
                      disabled={disabled}
                      onValueChange={(value) => updateWebSource(index, 'crawl_mode', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smart">Smart crawl</SelectItem>
                        <SelectItem value="single">Single page</SelectItem>
                        <SelectItem value="sitemap">Sitemap</SelectItem>
                        <SelectItem value="docs">Docs / knowledge base</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Depth</Label>
                    <Select
                      value={source.crawl_depth}
                      disabled={disabled}
                      onValueChange={(value) => updateWebSource(index, 'crawl_depth', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="page">Only this page</SelectItem>
                        <SelectItem value="section">This section</SelectItem>
                        <SelectItem value="site">Relevant site crawl</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Textarea
                    className="min-h-[68px] resize-y bg-secondary/20"
                    disabled={disabled}
                    placeholder="Include patterns: /docs/*, /help/*"
                    value={source.include_patterns}
                    onChange={(e) => updateWebSource(index, 'include_patterns', e.target.value)}
                  />
                  <Textarea
                    className="min-h-[68px] resize-y bg-secondary/20"
                    disabled={disabled}
                    placeholder="Exclude patterns: /pricing, /login, /legal"
                    value={source.exclude_patterns}
                    onChange={(e) => updateWebSource(index, 'exclude_patterns', e.target.value)}
                  />
                </div>

                <Input
                  value={source.notes}
                  disabled={disabled}
                  placeholder="What should the AIFace learn from this source?"
                  onChange={(e) => updateWebSource(index, 'notes', e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            FAQ training
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={disabled}
            onClick={() => onFaqItemsChange([...faqItems, emptyFaq])}
          >
            <Plus className="w-3.5 h-3.5" />
            Add FAQ
          </Button>
        </div>

        {faqItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
            No FAQs yet. Add question/answer pairs so the AIFace learns concrete answer patterns.
          </div>
        ) : (
          <div className="space-y-3">
            {faqItems.map((faq, index) => (
              <div key={index} className="rounded-xl border border-border/50 p-4 space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={faq.question}
                    disabled={disabled}
                    placeholder="Question"
                    onChange={(e) => updateFaq(index, 'question', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={disabled}
                    onClick={() => onFaqItemsChange(faqItems.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                <Textarea
                  className="min-h-[84px] resize-y bg-secondary/20"
                  disabled={disabled}
                  placeholder="Answer"
                  value={faq.answer}
                  onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                />
                <Input
                  value={faq.tags}
                  disabled={disabled}
                  placeholder="Tags: onboarding, pricing, support..."
                  onChange={(e) => updateFaq(index, 'tags', e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
