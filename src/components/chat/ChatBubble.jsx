import React from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Sparkles, User } from 'lucide-react';

export default function ChatBubble({ message, aiFaceName }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
      )}
      <div className={cn("max-w-[80%]", isUser && "flex flex-col items-end")}>
        {!isUser && (
          <span className="text-[11px] text-muted-foreground mb-1 ml-1">{aiFaceName}</span>
        )}
        <div className={cn(
          "rounded-2xl px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-border/50 rounded-bl-md"
        )}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              className="text-sm prose prose-sm prose-slate dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              components={{
                p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="my-0.5">{children}</li>,
                code: ({ inline, children }) =>
                  inline ? (
                    <code className="px-1 py-0.5 rounded bg-secondary text-xs font-mono">{children}</code>
                  ) : (
                    <pre className="bg-secondary rounded-lg p-3 overflow-x-auto my-2">
                      <code className="text-xs font-mono">{children}</code>
                    </pre>
                  ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}