import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Sparkles, Loader2 } from 'lucide-react';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import FeedbackBar from '@/components/chat/FeedbackBar';


function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function ChatWithAIFace() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [sessionId] = useState(() => generateSessionId());
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const { data: face, isLoading: loadingFace } = useQuery({
    queryKey: ['aiface', id],
    queryFn: async () => {
      const faces = await base44.entities.AIFace.filter({ id });
      return faces[0];
    },
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => base44.entities.ChatMessage.filter({ aiface_id: id }, '-created_date', 100),
    initialData: [],
  });

  const { data: feedbackEntries = [] } = useQuery({
    queryKey: ['feedback', id],
    queryFn: () => base44.entities.FeedbackEntry.filter({ aiface_id: id }),
    initialData: [],
  });

  const { data: knowledgeItems = [] } = useQuery({
    queryKey: ['knowledge', id],
    queryFn: () => base44.entities.KnowledgeItem.filter({ aiface_id: id }),
    initialData: [],
  });

  // Sort messages chronologically
  const sortedMessages = [...messages].sort((a, b) =>
    new Date(a.created_date) - new Date(b.created_date)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sortedMessages.length, streamingContent]);

  const buildSystemPrompt = () => {
    let systemParts = [
      `Du er et personligt AIFace ved navn "${face?.name}". Du er brugerens personlige AI-agent.`,
    ];

    if (face?.identity_prompt) {
      systemParts.push(`Brugerens præferencer:\n${face.identity_prompt}`);
    }

    if (face?.knowledge_summary) {
      systemParts.push(`Hvad du har lært om brugeren:\n${face.knowledge_summary}`);
    }

    // Add feedback-based adaptations
    const styleHints = feedbackEntries
      .filter(f => f.feedback_type === 'style_hint' && f.feedback_text)
      .map(f => f.feedback_text);
    
    if (styleHints.length > 0) {
      systemParts.push(`Brugeren har givet disse stilhints (tilpas dig dem):\n- ${styleHints.join('\n- ')}`);
    }

    // Add knowledge context
    const readySummaries = knowledgeItems
      .filter(k => k.extracted_summary)
      .map(k => k.extracted_summary);
    
    if (readySummaries.length > 0) {
      systemParts.push(`Kontekst fra brugerens filer:\n${readySummaries.join('\n\n')}`);
    }

    return systemParts.join('\n\n');
  };

  const handleSend = async (content) => {
    setSending(true);
    setStreamingContent('');

    // Save user message
    await base44.entities.ChatMessage.create({
      aiface_id: id,
      role: 'user',
      content,
      session_id: sessionId,
    });

    queryClient.invalidateQueries({ queryKey: ['messages', id] });

    // Build conversation history for context
    const recentMessages = sortedMessages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));
    recentMessages.push({ role: 'user', content });

    const systemPrompt = buildSystemPrompt();
    const fullPrompt = `${systemPrompt}\n\nSamtalehistorik:\n${recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nSvar som AI-agenten:`;

    // Call AI
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      model: face?.model || 'gpt_5_mini',
    });

    // Save AI response
    await base44.entities.ChatMessage.create({
      aiface_id: id,
      role: 'assistant',
      content: response,
      session_id: sessionId,
    });

    // Update message count
    await base44.entities.AIFace.update(id, {
      total_messages: (face?.total_messages || 0) + 2,
    });

    queryClient.invalidateQueries({ queryKey: ['messages', id] });
    queryClient.invalidateQueries({ queryKey: ['aiface', id] });
    setSending(false);
  };

  if (loadingFace) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!face) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground">AIFace ikke fundet</p>
        <Link to="/"><Button variant="outline">Tilbage til dashboard</Button></Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Chat header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">{face.name}</h2>
            <p className="text-xs text-muted-foreground">
              {face.status === 'ready' ? 'Online' : 'Træner...'}
            </p>
          </div>
        </div>
        <Link to={`/profile/${id}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {sortedMessages.length === 0 && !sending && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Start en samtale</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Skriv en besked til {face.name}. Jo mere du chatter, jo bedre lærer din AI dig at kende.
            </p>
          </div>
        )}

        {sortedMessages.map((msg) => (
          <div key={msg.id}>
            <ChatBubble message={msg} aiFaceName={face.name} />
            {msg.role === 'assistant' && (
              <FeedbackBar messageId={msg.id} aifaceId={id} />
            )}
          </div>
        ))}

        {sending && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-muted-foreground">Tænker...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={sending} />
    </div>
  );
}