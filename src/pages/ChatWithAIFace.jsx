import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Sparkles, Loader2, PanelLeft } from 'lucide-react';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import FeedbackBar from '@/components/chat/FeedbackBar';
import ConversationSidebar from '@/components/chat/ConversationSidebar';
import OrchestrationActivity from '@/components/chat/OrchestrationActivity';
import { buildOrchestrationPlan, buildOrchestrationPrompt } from '@/lib/orchestration';

function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function ChatWithAIFace() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const [activeSessionId, setActiveSessionId] = useState(() => generateSessionId());
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePlan, setActivePlan] = useState(null);

  const { data: face, isLoading: loadingFace } = useQuery({
    queryKey: ['aiface', id],
    queryFn: async () => {
      const faces = await base44.entities.AIFace.filter({ id });
      return faces[0];
    },
  });

  // Load ALL messages for this AIFace (all sessions)
  const { data: allMessages = [] } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => base44.entities.ChatMessage.filter({ aiface_id: id }, '-created_date', 500),
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

  // Build sessions list from all messages
  const sessions = useMemo(() => {
    const map = {};
    allMessages.forEach((m) => {
      const sid = m.session_id || 'default';
      if (!map[sid]) map[sid] = { id: sid, messages: [], lastDate: m.created_date };
      map[sid].messages.push(m);
      if (new Date(m.created_date) > new Date(map[sid].lastDate)) {
        map[sid].lastDate = m.created_date;
      }
    });
    return Object.values(map)
      .map((s) => ({
        ...s,
        messages: s.messages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)),
        messageCount: s.messages.length,
        preview: s.messages.find(m => m.role === 'user')?.content?.slice(0, 60) || 'Tom samtale',
      }))
      .sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
  }, [allMessages]);

  // Messages for the active session
  const sessionMessages = useMemo(() => {
    const session = sessions.find(s => s.id === activeSessionId);
    return session ? session.messages : [];
  }, [sessions, activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionMessages.length, sending]);

  const handleNewChat = () => {
    setActiveSessionId(generateSessionId());
    setSidebarOpen(false);
  };

  const buildSystemPrompt = () => {
    const parts = [
      `Du er et personligt AIFace ved navn "${face?.name}" i SnapTrainer. Du er brugerens samlede AI-identitet.`,
    ];
    if (face?.role) parts.push(`Din rolle: ${face.role}`);
    if (face?.identity_prompt) parts.push(`Brugerens præferencer:\n${face.identity_prompt}`);
    if (face?.knowledge_summary) parts.push(`Hvad du har lært om brugeren:\n${face.knowledge_summary}`);

    const styleHints = feedbackEntries
      .filter(f => f.feedback_type === 'style_hint' && f.feedback_text)
      .map(f => f.feedback_text);
    if (styleHints.length > 0) parts.push(`Stilhints fra brugeren:\n- ${styleHints.join('\n- ')}`);

    const summaries = knowledgeItems.filter(k => k.extracted_summary).map(k => k.extracted_summary);
    if (summaries.length > 0) parts.push(`Kontekst fra brugerens filer:\n${summaries.join('\n\n')}`);

    return parts.join('\n\n');
  };

  const handleSend = async (content) => {
    setSending(true);
    const orchestrationPlan = buildOrchestrationPlan(content);
    setActivePlan(orchestrationPlan);

    await base44.entities.ChatMessage.create({
      aiface_id: id,
      role: 'user',
      content,
      session_id: activeSessionId,
    });

    queryClient.invalidateQueries({ queryKey: ['messages', id] });

    // Full history for this session as context
    const historyForContext = sessionMessages.map(m => `${m.role}: ${m.content}`).join('\n');
    const systemPrompt = buildSystemPrompt();
    const orchestrationPrompt = buildOrchestrationPrompt(orchestrationPlan);
    const fullPrompt = `${systemPrompt}\n\n${orchestrationPrompt}\n\nFuldstændig samtalehistorik for denne session:\n${historyForContext}\nuser: ${content}\n\nSvar som AI-agenten:`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      model: face?.model || 'gpt_5_mini',
    });

    await base44.entities.ChatMessage.create({
      aiface_id: id,
      role: 'assistant',
      content: response,
      session_id: activeSessionId,
      orchestration_mode: orchestrationPlan.mode,
      orchestration_summary: orchestrationPlan.summary,
      agent_trace: orchestrationPlan.trace,
    });

    await base44.entities.AIFace.update(id, {
      total_messages: (face?.total_messages || 0) + 2,
    });

    queryClient.invalidateQueries({ queryKey: ['messages', id] });
    queryClient.invalidateQueries({ queryKey: ['aiface', id] });
    setSending(false);
    setActivePlan(null);
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
    <div className="flex h-[calc(100vh-5rem)] -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden">
      {/* Sidebar */}
      <ConversationSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hidden lg:flex"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">{face.name}</h2>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {face.status === 'ready' ? 'Online' : 'Træner...'} · {sessions.length} samtale{sessions.length !== 1 ? 'r' : ''}
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
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
          {sessionMessages.length === 0 && !sending && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Ny samtale</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Skriv til {face.name}. Dit AIFace svarer som én personlig AI, mens SnapTrainer kan route større opgaver gennem specialistagenter.
              </p>
            </div>
          )}

          {sessionMessages.map((msg) => (
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
                {activePlan && <OrchestrationActivity plan={activePlan} compact />}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={sending} />
      </div>
    </div>
  );
}