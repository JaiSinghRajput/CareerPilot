"use client";

import { useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { apiRequest } from "@/lib/api";
import { ChatJobCard } from "./ChatJobCard";

import { useChat } from "./chat-provider";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatInterface() {
  const { 
    messages, 
    input, 
    setInput, 
    isLoading, 
    loadingText, 
    chatId, 
    isInitializing, 
    handleSubmit 
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-[calc(100dvh-4rem)] bg-linear-to-br from-background to-surface/80 overflow-hidden relative">
      <div className="flex flex-col flex-1 h-full relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />

        {isInitializing ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-text-secondary text-sm">Loading your conversation...</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-in fade-in duration-700 slide-in-from-bottom-4">
                  <div className="w-20 h-20 bg-linear-to-tr from-primary/20 to-primary/5 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-primary/10 rotate-3 transition-transform hover:rotate-6">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-text-primary to-text-secondary tracking-tight">
                    Meet CareerPilot AI
                  </h3>
                  <p className="text-text-secondary max-w-lg mt-4 text-lg leading-relaxed">
                    Your personal career architect. I can analyze your resume, hunt down the perfect job, and outline actionable career recommendations.
                  </p>
                  <div className="mt-10 flex flex-wrap justify-center gap-3">
                    {["Review my resume", "Find me software jobs", "Recommend a new project"].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="px-4 py-2 rounded-full bg-surface border border-border text-sm font-medium text-text-secondary hover:text-primary hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className={`flex max-w-[85%] md:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} gap-4 items-end`}>

                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${msg.role === "user"
                        ? "bg-linear-to-br from-primary to-primary/80 text-primary-foreground border-primary/20"
                        : "bg-surface text-primary border-border"
                        }`}>
                        {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
                      </div>

                      {/* Message Bubble */}
                      <div className={`px-6 py-4 rounded-3xl shadow-sm ${msg.role === "user"
                        ? "bg-linear-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm"
                        : "bg-surface border border-border text-text-primary rounded-bl-sm"
                        }`}>
                        <div className={`prose prose-sm md:prose-base max-w-none prose-p:text-current prose-headings:text-current prose-strong:text-current prose-li:text-current ${msg.role === "user" ? "text-white prose-invert" : "text-text-primary"}`}>
                          <ReactMarkdown
                            components={{
                              p: ({ node, ...props }) => <div className="mb-4" {...props} />,
                              a: ({ node, ...props }) => {
                                if (props.href?.startsWith("/job/")) {
                                  const jobId = props.href.replace("/job/", "");
                                  return <ChatJobCard jobId={jobId} />;
                                }
                                return <a {...props} />;
                              }
                            }}
                          >
                            {msg.content.replace(/\[JOB_CARD:([a-zA-Z0-9-_]+)\]/g, '[Job Card](/job/$1)')}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex w-full justify-start animate-in fade-in">
                  <div className="flex gap-4 items-end">
                    <div className="w-10 h-10 rounded-full bg-surface border border-border text-primary flex items-center justify-center shrink-0 shadow-sm">
                      <Bot size={18} />
                    </div>
                    <div className="px-6 py-4 bg-surface border border-border text-text-primary rounded-3xl rounded-bl-sm shadow-sm flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-sm font-medium animate-pulse text-text-secondary">{loadingText}</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            <div className="p-4 md:p-6 bg-surface/80 backdrop-blur-md border-t border-border z-10">
              <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-end gap-3">
                <div className="relative flex-1 bg-background border focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 rounded-2xl shadow-sm transition-all duration-300">
                  <textarea
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything... (Press Enter to send)"
                    className="w-full bg-transparent pl-5 pr-14 py-4 min-h-14 max-h-37.5 resize-none focus:outline-none placeholder:text-text-secondary/70"
                    disabled={isLoading}
                    rows={1}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-14 h-14 shrink-0 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Send size={20} className={input.trim() && !isLoading ? "ml-1" : ""} />
                </button>
              </form>
              <div className="text-center mt-3">
                <p className="text-xs text-text-secondary/60">CareerPilot AI can make mistakes. Consider verifying important information.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
