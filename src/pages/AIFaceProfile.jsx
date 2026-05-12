import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Brain, FileText, MessageSquare, Settings,
  Trash2, Loader2, Image, Mic, Upload, Sparkles,
  ThumbsUp, ThumbsDown, GitBranch, PenLine, Search, ShieldCheck, Workflow, CheckCircle2,
  Globe, HelpCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import FileUploader from '@/components/create/FileUploader';
import WebKnowledgeTrainer from '@/components/create/WebKnowledgeTrainer';
import StylePreferences from '@/components/create/StylePreferences';
import ModelSelector from '@/components/create/ModelSelector';
import AdvancedTrainingPanel from '@/components/create/AdvancedTrainingPanel';
import {
  defaultAdvancedTrainingConfig,
  normalizeAdvancedTrainingConfig,
  summarizeAdvancedTrainingForPrompt,
} from '@/lib/advanced-training';
import {
  buildFaqSummary,
  buildWebSourceSummary,
  getValidFaqItems,
  getValidWebSources,
} from '@/lib/knowledge-sources';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ExportPDFButton from '@/components/profile/ExportPDFButton';

const fileTypeIcons = {
  pdf: FileText,
  text: FileText,
  image: Image,
  audio: Mic,
  url: Globe,
  website: Globe,
  sitemap: Globe,
  faq: HelpCircle,
  other: FileText,
};

const roles = [
  'Business advisor',
  'Study partner',
  'Planner',
  'Creative partner',
  'Support specialist',
  'Personal assistant',
];

const specialistAgents = [
  { name: 'Orchestrator', icon: Workflow, text: 'Selects workflow, execution mode and which agents should activate.' },
  { name: 'Memory', icon: Brain, text: 'Retrieves relevant profile, feedback, files and conversation history.' },
  { name: 'Planner', icon: GitBranch, text: 'Turns goals into subtasks, order and next actions.' },
  { name: 'Research', icon: Search, text: 'Finds relevant angles and knowledge needs in context.' },
  { name: 'Analyst', icon: Brain, text: 'Prioritizes insights and decision points.' },
  { name: 'Writer', icon: PenLine, text: 'Shapes the answer in the AIFace tone and language.' },
  { name: 'Organizer', icon: GitBranch, text: 'Makes output actionable with structure and follow-up.' },
  { name: 'Reviewer', icon: ShieldCheck, text: 'Checks output for clarity, relevance and gaps.' },
  { name: 'Guardrail', icon: ShieldCheck, text: 'Flags data boundaries, uncertainty and clarification needs.' },
];

const orchestrationFeatures = [
  'Intent parse',
  'Knowledge sweep',
  'Context sweep',
  'Causal reasoning',
  'Unified synthesis',
  'Proactive insight',
  'Task decomposition',
  'Dynamic routing',
  'Context handoff',
  'Evaluation gates',
  'Retry/fallback/escalation',
  'Single AIFace result',
];

const collaborationModes = [
  { label: 'Auto-routing', text: 'Automatically selects the relevant specialist agents.' },
  { label: 'Parallel', text: 'Runs independent perspectives at the same time and synthesizes them.' },
  { label: 'Sequential', text: 'Passes output from one step as context to the next.' },
  { label: 'Debate', text: 'Balances opposing expert viewpoints before recommending.' },
  { label: 'Hierarchical', text: 'A supervisor decomposes complex goals and aggregates results.' },
  { label: 'Broadcast', text: 'Scans broadly for maximum coverage and fewer blind spots.' },
];

export default function AIFaceProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [newFiles, setNewFiles] = useState([]);
  const [newWebSources, setNewWebSources] = useState([]);
  const [newFaqItems, setNewFaqItems] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { data: face, isLoading } = useQuery({
    queryKey: ['aiface', id],
    queryFn: async () => {
      const faces = await base44.entities.AIFace.filter({ id });
      return faces[0];
    },
  });

  const { data: knowledgeItems = [] } = useQuery({
    queryKey: ['knowledge', id],
    queryFn: () => base44.entities.KnowledgeItem.filter({ aiface_id: id }),
    initialData: [],
  });

  const { data: feedbackEntries = [] } = useQuery({
    queryKey: ['feedback', id],
    queryFn: () => base44.entities.FeedbackEntry.filter({ aiface_id: id }),
    initialData: [],
  });

  const [preferences, setPreferences] = useState(null);
  const [model, setModel] = useState(null);
  const [role, setRole] = useState(null);
  const [advancedTraining, setAdvancedTraining] = useState(defaultAdvancedTrainingConfig);

  React.useEffect(() => {
    if (face && !preferences) {
      setPreferences(face.style_preferences || {});
      setModel(face.model);
      setRole(face.role || face.style_preferences?.role || 'Personal assistant');
      setAdvancedTraining(normalizeAdvancedTrainingConfig(face.advanced_training));
    }
  }, [face]);

  const handleSave = async () => {
    setSaving(true);

    let identityParts = [];
    if (preferences?.tone) identityParts.push(`Tone: ${preferences.tone}`);
    if (preferences?.language) identityParts.push(`Language: ${preferences.language}`);
    if (role) identityParts.push(`Role: ${role}`);
    if (preferences?.verbosity) identityParts.push(`Detail level: ${preferences.verbosity}`);
    if (preferences?.formality) identityParts.push(`Formality: ${preferences.formality}`);
    const advancedTrainingSummary = summarizeAdvancedTrainingForPrompt(advancedTraining);
    if (advancedTrainingSummary) identityParts.push(advancedTrainingSummary);

    await base44.entities.AIFace.update(id, {
      model,
      role,
      style_preferences: { ...preferences, role },
      advanced_training: advancedTraining,
      identity_prompt: identityParts.join('\n'),
    });

    queryClient.invalidateQueries({ queryKey: ['aiface', id] });
    setSaving(false);
  };

  const handleUploadMore = async () => {
    if (newFiles.length === 0) return;
    setUploading(true);

    for (const item of newFiles) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: item.file });
      await base44.entities.KnowledgeItem.create({
        aiface_id: id,
        file_name: item.file.name,
        file_url,
        file_type: item.type,
        status: 'processing',
      });
    }

    await base44.entities.AIFace.update(id, {
      total_files: (face?.total_files || 0) + newFiles.length,
    });

    setNewFiles([]);
    setUploading(false);
    queryClient.invalidateQueries({ queryKey: ['knowledge', id] });
    queryClient.invalidateQueries({ queryKey: ['aiface', id] });
  };

  const handleAddWebKnowledge = async () => {
    const validWebSources = getValidWebSources(newWebSources);
    const validFaqItems = getValidFaqItems(newFaqItems);
    const totalNewItems = validWebSources.length + validFaqItems.length;
    if (totalNewItems === 0) return;

    setUploading(true);

    for (const source of validWebSources) {
      const summary = buildWebSourceSummary(source);
      await base44.entities.KnowledgeItem.create({
        aiface_id: id,
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
        aiface_id: id,
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

    await base44.entities.AIFace.update(id, {
      total_files: (face?.total_files || 0) + totalNewItems,
    });

    setNewWebSources([]);
    setNewFaqItems([]);
    setUploading(false);
    queryClient.invalidateQueries({ queryKey: ['knowledge', id] });
    queryClient.invalidateQueries({ queryKey: ['aiface', id] });
  };

  const handleDelete = async () => {
    await base44.entities.AIFace.delete(id);
    navigate('/');
  };

  if (isLoading || !face) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const thumbsUp = feedbackEntries.filter(f => f.feedback_type === 'thumbs_up').length;
  const thumbsDown = feedbackEntries.filter(f => f.feedback_type === 'thumbs_down').length;
  const hints = feedbackEntries.filter(f => f.feedback_type === 'style_hint' && f.feedback_text);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/chat/${id}`}>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{face.name}</h1>
              <p className="text-sm text-muted-foreground">{face.role || 'Personal AI identity'} · Profile & settings</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExportPDFButton
            face={face}
            knowledgeItems={knowledgeItems}
            feedbackEntries={feedbackEntries}
          />
          <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete AIFace?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes "{face.name}" and all related data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 text-center">
          <MessageSquare className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{face.total_messages || 0}</p>
          <p className="text-xs text-muted-foreground">Messages</p>
        </Card>
        <Card className="p-4 text-center">
          <FileText className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{face.total_files || 0}</p>
          <p className="text-xs text-muted-foreground">Files</p>
        </Card>
        <Card className="p-4 text-center">
          <Brain className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{feedbackEntries.length}</p>
          <p className="text-xs text-muted-foreground">Feedback</p>
        </Card>
      </div>

      {face.knowledge_summary && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">What your AI has learned</p>
                <p className="text-sm text-muted-foreground">{face.knowledge_summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="w-3.5 h-3.5" /> Settings
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Knowledge
          </TabsTrigger>
          <TabsTrigger value="orchestration" className="gap-1.5">
            <Workflow className="w-3.5 h-3.5" /> Orchestration
          </TabsTrigger>
          <TabsTrigger value="training" className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Training
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-1.5">
            <Brain className="w-3.5 h-3.5" /> Adaptation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AIFace role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roles.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRole(item)}
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
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI model</CardTitle>
            </CardHeader>
            <CardContent>
              {model && <ModelSelector selected={model} onSelect={setModel} />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Style preferences</CardTitle>
            </CardHeader>
            <CardContent>
              {preferences && <StylePreferences preferences={preferences} onChange={setPreferences} />}
            </CardContent>
          </Card>
          <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-lg shadow-primary/20">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save changes
          </Button>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Uploaded files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {knowledgeItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No files yet</p>
              ) : (
                knowledgeItems.map((item) => {
                  const Icon = fileTypeIcons[item.file_type] || FileText;
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(item.created_date), 'd. MMM yyyy')}
                        </p>
                      </div>
                      <Badge variant="outline" className={
                        item.status === 'ready' ? 'text-emerald-600 border-emerald-200' :
                        item.status === 'processing' ? 'text-amber-600 border-amber-200' :
                        'text-destructive border-destructive/20'
                      }>
                        {item.status === 'ready' ? 'Ready' : item.status === 'processing' ? 'Processing' : 'Failed'}
                      </Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="w-4 h-4" /> Upload more files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploader files={newFiles} onFilesChange={setNewFiles} uploading={uploading} />
              {newFiles.length > 0 && (
                <Button onClick={handleUploadMore} disabled={uploading} className="gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload {newFiles.length} file{newFiles.length !== 1 ? 's' : ''}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4" /> Train with URLs and FAQs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <WebKnowledgeTrainer
                webSources={newWebSources}
                onWebSourcesChange={setNewWebSources}
                faqItems={newFaqItems}
                onFaqItemsChange={setNewFaqItems}
                disabled={uploading}
              />
              {(getValidWebSources(newWebSources).length > 0 || getValidFaqItems(newFaqItems).length > 0) && (
                <Button onClick={handleAddWebKnowledge} disabled={uploading} className="gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  Save web/FAQ training
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orchestration" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {orchestrationFeatures.map((feature) => (
              <Card key={feature} className="p-3 border-border/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-2" />
                <p className="text-xs font-medium leading-snug">{feature}</p>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Workflow className="w-4 h-4" /> Multi-agent intelligence layer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {face.name} is the only user-facing surface, while SnapTrainer interprets goals, selects collaboration mode, distributes work, hands off context and returns one consistent answer.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {collaborationModes.map((mode) => (
                  <div key={mode.label} className="rounded-xl border border-border/50 p-3">
                    <p className="text-sm font-medium">{mode.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{mode.text}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-3">
                {specialistAgents.map((agent) => (
                  <div key={agent.name} className="flex items-start gap-3 rounded-xl border border-border/50 p-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <agent.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{agent.name}</p>
                        <Badge variant="outline" className="text-[10px]">active when needed</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{agent.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Advanced training
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdvancedTrainingPanel value={advancedTraining} onChange={setAdvancedTraining} />
            </CardContent>
          </Card>
          <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-lg shadow-primary/20">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save training
          </Button>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium">Positive</span>
              </div>
              <p className="text-2xl font-bold">{thumbsUp}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsDown className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium">Negative</span>
              </div>
              <p className="text-2xl font-bold">{thumbsDown}</p>
            </Card>
          </div>

          {hints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Style hints from you</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {hints.map((hint) => (
                  <div key={hint.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                    <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-sm">"{hint.feedback_text}"</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(hint.created_date), 'd. MMM')}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {hints.length === 0 && thumbsUp === 0 && thumbsDown === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No feedback yet. Chat with your AIFace and give feedback to make it more personal.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}