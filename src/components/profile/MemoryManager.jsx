import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, Pin, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getOwnerFields } from '@/lib/ownership';

const emptyMemory = {
  memory_type: 'preference',
  title: '',
  content: '',
  source: 'manual',
  confidence: 0.8,
  pinned: false,
};

export default function MemoryManager({ aifaceId, memoryItems, isOwner = false }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(emptyMemory);
  const [saving, setSaving] = useState(false);

  const saveMemory = async () => {
    if (!isOwner) return;
    if (!draft.title.trim() || !draft.content.trim()) return;
    setSaving(true);
    await base44.entities.MemoryItem.create({
      aiface_id: aifaceId,
      ...getOwnerFields(user),
      ...draft,
      status: 'active',
    });
    setDraft(emptyMemory);
    setSaving(false);
    queryClient.invalidateQueries({ queryKey: ['memory', aifaceId] });
  };

  const archiveMemory = async (item) => {
    if (!isOwner) return;
    await base44.entities.MemoryItem.update(item.id, { status: 'archived' });
    queryClient.invalidateQueries({ queryKey: ['memory', aifaceId] });
  };

  const togglePinned = async (item) => {
    if (!isOwner) return;
    await base44.entities.MemoryItem.update(item.id, { pinned: !item.pinned });
    queryClient.invalidateQueries({ queryKey: ['memory', aifaceId] });
  };

  const activeItems = memoryItems.filter((item) => item.status !== 'archived');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Long-term memory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={draft.memory_type} onValueChange={(value) => setDraft({ ...draft, memory_type: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="preference">Preference</SelectItem>
                  <SelectItem value="fact">Fact</SelectItem>
                  <SelectItem value="style">Style</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="constraint">Constraint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Preferred answer style" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Memory</Label>
            <Textarea
              className="min-h-[90px]"
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              placeholder="What should this AIFace remember long-term?"
            />
          </div>
          <Button onClick={saveMemory} disabled={!isOwner || saving || !draft.title.trim() || !draft.content.trim()} className="gap-2">
            <Plus className="w-4 h-4" />
            Add memory
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {activeItems.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">No long-term memories yet.</div>
        ) : (
          activeItems.map((item) => (
            <div key={item.id} className="rounded-xl border border-border/50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    <Badge variant="outline" className="text-[10px]">{item.memory_type}</Badge>
                    {item.pinned && <Badge variant="outline" className="text-[10px]">Pinned</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.content}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" disabled={!isOwner} onClick={() => togglePinned(item)}>
                    <Pin className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" disabled={!isOwner} onClick={() => archiveMemory(item)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
