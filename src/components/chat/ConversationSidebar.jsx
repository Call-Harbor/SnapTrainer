import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Search, MessageSquare, X } from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { cn } from '@/lib/utils';

function groupSessions(sessions) {
  const groups = { Today: [], Yesterday: [], 'This week': [], Earlier: [] };
  sessions.forEach((s) => {
    const d = new Date(s.lastDate);
    if (isToday(d)) groups.Today.push(s);
    else if (isYesterday(d)) groups.Yesterday.push(s);
    else if (isThisWeek(d)) groups['This week'].push(s);
    else groups.Earlier.push(s);
  });
  return groups;
}

export default function ConversationSidebar({ sessions, activeSessionId, onSelectSession, onNewChat, open, onClose }) {
  const [query, setQuery] = useState('');

  const filtered = sessions.filter((s) =>
    s.preview.toLowerCase().includes(query.toLowerCase())
  );

  const groups = groupSessions(filtered);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed lg:relative top-0 left-0 h-full z-40 lg:z-auto",
        "w-72 bg-card border-r border-border/50 flex flex-col",
        "transition-transform duration-300",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border/50 flex items-center justify-between gap-2">
          <span className="font-semibold text-sm">Conversations</span>
          <div className="flex items-center gap-1">
            <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={onNewChat}>
              <Plus className="w-3.5 h-3.5" /> New
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 h-8 text-sm bg-secondary/50"
            />
          </div>
        </div>

        {/* Sessions list */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-4">
            {Object.entries(groups).map(([label, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={label}>
                  <p className="text-[10px] font-semibold uppercase text-muted-foreground px-2 mb-1 tracking-wider">
                    {label}
                  </p>
                  <div className="space-y-0.5">
                    {items.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => { onSelectSession(session.id); onClose(); }}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group",
                          session.id === activeSessionId
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-secondary/70 text-foreground"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <MessageSquare className={cn(
                            "w-3.5 h-3.5 mt-0.5 shrink-0",
                            session.id === activeSessionId ? "text-primary" : "text-muted-foreground"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate leading-tight">
                              {session.preview || 'Empty conversation'}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {session.messageCount} messages · {format(new Date(session.lastDate), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  {query ? 'No results' : 'No conversations yet'}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}