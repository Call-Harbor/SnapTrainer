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

const roles = [
  'Business advisor',
  'Studiemakker',
  'Planner',
  'Creative partner',
  'Support specialist',
  'Personlig assistent',
];

const steps = [
  { title: 'Navngiv', subtitle: 'Giv dit AIFace en identitet og rolle' },
  { title: 'Vælg model', subtitle: 'Vælg den AI-motor der passer dig' },
  { title: 'Stilpræferencer', subtitle: 'Fortæl hvordan din AI skal kommunikere' },
  { title: 'Upload materiale', subtitle: 'Giv din AI kontekst og viden' },
];

export default function CreateAIFace() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [role, setRole] = useState('Personlig assistent');
  const [preferences, setPreferences] = useState({
    tone: '', language: 'dansk', verbosity: 'medium', formality: 'neutral', role: 'Personlig assistent',
  });
  const [files, setFiles] = useState([]);

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
    if (preferences.language) identityParts.push(`Sprog: ${preferences.language}`);
    if (role) identityParts.push(`Rolle: ${role}`);
    identityParts.push(`Detaljering: ${preferences.verbosity}`);
    identityParts.push(`Formalitet: ${preferences.formality}`);

    const face = await base44.entities.AIFace.create({
      name,
      model,
      role,
      status: files.length > 0 ? 'training' : 'ready',
      identity_prompt: identityParts.join('\n'),
      style_preferences: { ...preferences, role },
      total_files: files.length,
    });

    // Upload files
    if (files.length > 0) {
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

      // Process files with AI to build knowledge summary
      const summaryPrompt = `Du er en AI-assistent der analyserer uploadede filer for at opbygge en brugerprofil. 
Filerne er: ${files.map(f => f.file.name).join(', ')}. 
Brugeren foretrækker: ${identityParts.join(', ')}. 
Skriv en kort opsummering (2-3 sætninger) af hvad denne AI-agent har lært om brugerens stil og behov.`;

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
        <ArrowLeft className="w-4 h-4" /> Tilbage
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
                  <Label className="text-sm font-medium">Navn</Label>
                  <Input
                    placeholder="F.eks. 'Min arbejdsassistent', 'Kreativ skribent'..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-lg h-12"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Rolle</Label>
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
              <div className="space-y-4">
                <FileUploader files={files} onFilesChange={setFiles} uploading={uploading} />
                <p className="text-xs text-muted-foreground">
                  Du kan altid uploade flere filer senere. SnapTrainer bruger materialet til at gøre dit AIFace mere præcist over tid.
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
          <ArrowLeft className="w-4 h-4" /> Forrige
        </Button>

        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="gap-2 shadow-lg shadow-primary/20"
          >
            Næste <ArrowRight className="w-4 h-4" />
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
                {uploading ? 'Uploader filer...' : 'Opretter...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Opret AIFace
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}