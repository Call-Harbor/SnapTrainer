import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Share2, Users } from 'lucide-react';
import { normalizeShareList } from '@/lib/ownership';

export default function ShareAIFacePanel({ face, isOwner }) {
  const queryClient = useQueryClient();
  const [emails, setEmails] = useState(normalizeShareList(face.shared_with_emails).join('\n'));
  const [saving, setSaving] = useState(false);

  const sharedEmails = normalizeShareList(face.shared_with_emails);

  const saveSharing = async () => {
    setSaving(true);
    await base44.entities.AIFace.update(face.id, {
      shared_with_emails: normalizeShareList(emails),
      visibility: normalizeShareList(emails).length > 0 ? 'shared' : 'private',
    });
    queryClient.invalidateQueries({ queryKey: ['aiface', face.id] });
    queryClient.invalidateQueries({ queryKey: ['aifaces'] });
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Sharing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-border/50 bg-secondary/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Access</span>
            <Badge variant="outline" className="text-[10px]">{face.visibility || 'private'}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            The AIFace and training data belong to the creator. Shared users can access the AIFace, but ownership stays with the original owner.
          </p>
        </div>

        {isOwner ? (
          <>
            <div className="space-y-2">
              <Label>Share with emails</Label>
              <Textarea
                className="min-h-[110px]"
                value={emails}
                onChange={(event) => setEmails(event.target.value)}
                placeholder="teammate@example.com&#10;partner@example.com"
              />
              <p className="text-xs text-muted-foreground">One email per line or comma-separated.</p>
            </div>
            <Button onClick={saveSharing} disabled={saving} className="gap-2">
              <Share2 className="w-4 h-4" />
              Save sharing
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Only the owner can edit sharing settings.</p>
        )}

        {sharedEmails.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sharedEmails.map((email) => (
              <Badge key={email} variant="outline">{email}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
