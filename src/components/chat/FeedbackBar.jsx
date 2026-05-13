import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThumbsUp, ThumbsDown, MessageSquare, Send, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { getOwnerFields } from '@/lib/ownership';

export default function FeedbackBar({ messageId, aifaceId, aifaceOwnerFields = {} }) {
  const { user } = useAuth();
  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(null);

  const submitFeedback = async (type, feedbackText) => {
    await base44.entities.FeedbackEntry.create({
      aiface_id: aifaceId,
      ...getOwnerFields(user),
      ...aifaceOwnerFields,
      message_id: messageId,
      feedback_type: type,
      feedback_text: feedbackText || '',
    });
    setSubmitted(type);
    setShowInput(false);
    setText('');
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-11">
        {submitted === 'thumbs_up' && <ThumbsUp className="w-3 h-3 text-emerald-500" />}
        {submitted === 'thumbs_down' && <ThumbsDown className="w-3 h-3 text-destructive" />}
        {(submitted === 'correction' || submitted === 'style_hint') && <MessageSquare className="w-3 h-3 text-primary" />}
        <span>Feedback received</span>
      </div>
    );
  }

  return (
    <div className="ml-11 space-y-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-emerald-500"
          onClick={() => submitFeedback('thumbs_up')}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => submitFeedback('thumbs_down')}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-7 text-xs text-muted-foreground gap-1", showInput && "text-primary")}
          onClick={() => setShowInput(!showInput)}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Adjust
        </Button>
      </div>

      {showInput && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="E.g. 'shorter', 'more English', 'more technical'..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && text.trim() && submitFeedback('style_hint', text)}
          />
          <Button
            size="icon"
            className="h-8 w-8 shrink-0"
            disabled={!text.trim()}
            onClick={() => submitFeedback('style_hint', text)}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setShowInput(false)}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}