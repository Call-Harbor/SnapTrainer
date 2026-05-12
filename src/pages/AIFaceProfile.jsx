import React, { useState, useEffect } from 'react';
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
  ThumbsUp, ThumbsDown,
} from 'lucide-react';
import { format } from 'date-fns';
import FileUploader from '@/components/create/FileUploader';
import StylePreferences from '@/components/create/StylePreferences';
import ModelSelector from '@/components/create/ModelSelector';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const fileTypeIcons = { pdf: FileText, text: FileText, image: Image, audio: Mic, other: FileText };

export default function AIFaceProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [newFiles, setNewFiles] = useState([]);
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

  React.useEffect(() => {
    if (face && !preferences) {
      setPreferences(face.style_preferences || {});
      setModel(face.model);
    }
  }, [face]);

  const handleSave = async () => {
    setSaving(true);

    let identityParts = [];
    if (preferences?.tone) identityParts.push(`Tone: ${preferences.tone}`);
    if (preferences?.language) identityParts.push(`Sprog: ${preferences.language}`);
    if (preferences?.verbosity) identityParts.push(`Detaljering: ${preferences.verbosity}`);
    if (preferences?.formality) identityParts.push(`Formalitet: ${preferences.formality}`);

    await base44.entities.AIFace.update(id, {
      model,
      style_preferences: preferences,
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
              <p className="text-sm text-muted-foreground">Profil & indstillinger</p>
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Slet AIFace?</AlertDialogTitle>
              <AlertDialogDescription>
                Dette sletter "{face.name}" og al tilhørende data permanent.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuller</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Slet
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 text-center">
          <MessageSquare className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{face.total_messages || 0}</p>
          <p className="text-xs text-muted-foreground">Beskeder</p>
        </Card>
        <Card className="p-4 text-center">
          <FileText className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{face.total_files || 0}</p>
          <p className="text-xs text-muted-foreground">Filer</p>
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
                <p className="text-sm font-medium mb-1">Hvad din AI har lært</p>
                <p className="text-sm text-muted-foreground">{face.knowledge_summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="w-3.5 h-3.5" /> Indstillinger
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Viden
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-1.5">
            <Brain className="w-3.5 h-3.5" /> Adaptation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI-model</CardTitle>
            </CardHeader>
            <CardContent>
              {model && <ModelSelector selected={model} onSelect={setModel} />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stilpræferencer</CardTitle>
            </CardHeader>
            <CardContent>
              {preferences && <StylePreferences preferences={preferences} onChange={setPreferences} />}
            </CardContent>
          </Card>
          <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-lg shadow-primary/20">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Gem ændringer
          </Button>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Uploadede filer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {knowledgeItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Ingen filer endnu</p>
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
                        {item.status === 'ready' ? 'Klar' : item.status === 'processing' ? 'Behandles' : 'Fejl'}
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
                <Upload className="w-4 h-4" /> Upload flere filer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploader files={newFiles} onFilesChange={setNewFiles} uploading={uploading} />
              {newFiles.length > 0 && (
                <Button onClick={handleUploadMore} disabled={uploading} className="gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload {newFiles.length} fil{newFiles.length !== 1 ? 'er' : ''}
                </Button>
              )}
            </CardContent>
          </Card>
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
                <CardTitle className="text-base">Stilhints fra dig</CardTitle>
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
              <p className="text-sm">Ingen feedback endnu. Chat med dit AIFace og giv feedback for at gøre det mere personligt.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}