import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModelSelector from '@/components/create/ModelSelector';
import StylePreferences from '@/components/create/StylePreferences';
import FileUploader from '@/components/create/FileUploader';
import AdvancedTrainingPanel from '@/components/create/AdvancedTrainingPanel';
import WebKnowledgeTrainer from '@/components/create/WebKnowledgeTrainer';
import { defaultAdvancedTrainingConfig, summarizeAdvancedTrainingForPrompt } from '@/lib/advanced-training';
import {
  buildFaqSummary,
  buildWebSourceSummary,
  getValidFaqItems,
  getValidWebSources,
} from '@/lib/knowledge-sources';

const roles = [
  'Business advisor',
  'Study partner',
  'Planner',
  'Creative partner',
  'Support specialist',
  'Personal assistant',
];

export default function CreateAIFace() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [role, setRole] = useState('Personal assistant');
  const [preferences, setPreferences] = useState({
    tone: '', language: 'English', verbosity: 'medium', formality: 'neutral', role: 'Personal assistant',
  });
  const [advancedTraining, setAdvancedTraining] = useState(defaultAdvancedTrainingConfig);
  const [files, setFiles] = useState([]);
  const [webSources, setWebSources] = useState([]);
  const [faqItems, setFaqItems] = useState([]);

  const steps = [
    { title: 'Name', subtitle: 'Give your AIFace an identity and role' },
    { title: 'Choose model', subtitle: 'Choose freely between all models - everything is free to use' },
    { title: 'Style preferences', subtitle: 'Tell your AI how it should communicate' },
    { title: 'Advanced training', subtitle: 'Optional expert layer for AI/ML specialists' },
    { title: 'Knowledge sources', subtitle: 'Upload files, crawl URLs and add FAQs' },
  ];

  const canNext = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return model !== '';
    return true;
  };

  const handleCreate = async () => {
    setCreating(true);

    // Build identity prompt from preferences
    let identityParts = [];
    if (preferences.tone) identityParts.push(`Tone: ${preferences.tone}`);
    if (preferences.language) identityParts.push(`Language: ${preferences.language}`);
    if (role) identityParts.push(`Role: ${role}`);
    identityParts.push(`Detail level: ${preferences.verbosity}`);
    identityParts.push(`Formality: ${preferences.formality}`);
    const advancedTrainingSummary = summarizeAdvancedTrainingForPrompt(advancedTraining);
    if (advancedTrainingSummary) identityParts.push(advancedTrainingSummary);

    const validWebSources = getValidWebSources(webSources);
    const validFaqItems = getValidFaqItems(faqItems);
    const totalKnowledgeItems = files.length + validWebSources.length + validFaqItems.length;

    const face = await base44.entities.AIFace.create({
      name,
      model,
      role,
      status: totalKnowledgeItems > 0 ? 'training' : 'ready',
      identity_prompt: identityParts.join('\n'),
      style_preferences: { ...preferences, role },
      advanced_training: advancedTraining,
      total_files: totalKnowledgeItems,
    });

    if (totalKnowledgeItems > 0) {
      setUploading(true);

      for (const item of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: item.file });
        await base44.entities.KnowledgeItem.create({
          aiface_id: face.id,
          file_name: item.file.name,
          file_url,
          file_type: item.type,
          status: 'processing',
        });
      }

      for (const source of validWebSources) {
        const summary = buildWebSourceSummary(source);
        await base44.entities.KnowledgeItem.create({
          aiface_id: face.id,
          file_name: source.url,
          file_url: source.url,
          file_type: source.crawl_mode === 'sitemap' ? 'sitemap' : 'url',
          source_url: source.url,
          crawl_mode: source.crawl_mode,
          crawl_depth: source.crawl_depth,
          include_patterns: source.include_patterns,
          exclude_patterns: source.exclude_patterns,
          tags: source.notes,
          training_text: summary,
          extracted_summary: summary,
          status: 'ready',
        });
      }

      for (const item of validFaqItems) {
        const summary = buildFaqSummary(item);
        await base44.entities.KnowledgeItem.create({
          aiface_id: face.id,
          file_name: item.question.slice(0, 80),
          file_url: `faq:${item.question.slice(0, 80)}`,
          file_type: 'faq',
          question: item.question,
          answer: item.answer,
          tags: item.tags,
          training_text: summary,
          extracted_summary: summary,
          status: 'ready',
        });
      }

      const summaryPrompt = `You are an AI assistant analyzing the user's training sources to build a user profile.
Files: ${files.map(f => f.file.name).join(', ') || 'none'}.
Web sources: ${validWebSources.map(source => source.url).join(', ') || 'none'}.
FAQ training: ${validFaqItems.length} FAQ pairs.
User preferences: ${identityParts.join(', ')}.
Write a short summary (2-3 sentences) of what this AI agent has learned about the user's style, knowledge sources and needs.`;

      const summary = await base44.integrations.Core.InvokeLLM({ prompt: summaryPrompt });
      await base44.entities.AIFace.update(face.id, {
        knowledge_summary: summary,
        status: 'ready',
      });
    }

    navigate(`/chat/${face.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" className="gap-2 mb-6 text-muted-foreground" onClick={() => navigate('/')}>
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-2 ${i <= step ? 'text-foreground' : 'text-muted-foreground/40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-primary text-primary-foreground' :
                i === step ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' :
                'bg-secondary text-muted-foreground'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{s.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px ${i < step ? 'bg-primary' : 'bg-border'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="p-8 border-border/50">
            <h2 className="text-xl font-bold mb-1">{steps[step].title}</h2>
            <p className="text-sm text-muted-foreground mb-6">{steps[step].subtitle}</p>

            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Name</Label>
                  <Input
                    placeholder="E.g. 'My work assistant', 'Creative writer'..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-lg h-12"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Role</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {roles.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setRole(item);
                          setPreferences((current) => ({ ...current, role: item }));
                        }}
                        className={`rounded-xl border px-3 py-2 text-left text-sm transition-all ${
                          role === item
                            ? 'border-primary bg-primary/5 text-primary shadow-sm'
                            : 'border-border/50 hover:bg-secondary/60'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <ModelSelector selected={model} onSelect={setModel} />
            )}

            {step === 2 && (
              <StylePreferences preferences={preferences} onChange={setPreferences} />
            )}

            {step === 3 && (
              <AdvancedTrainingPanel value={advancedTraining} onChange={setAdvancedTraining} />
            )}

            {step === 4 && (
              <div className="space-y-4">
                <FileUploader files={files} onFilesChange={setFiles} uploading={uploading} />
                <WebKnowledgeTrainer
                  webSources={webSources}
                  onWebSourcesChange={setWebSources}
                  faqItems={faqItems}
                  onFaqItemsChange={setFaqItems}
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground">
                  You can always add more files, URLs and FAQs later. SnapTrainer uses the material in your AIFace knowledge sweep.
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </Button>

        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="gap-2 shadow-lg shadow-primary/20"
          >
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            disabled={creating || !canNext()}
            className="gap-2 shadow-lg shadow-primary/20"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {uploading ? 'Uploading files...' : 'Creating...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Create AIFace
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}