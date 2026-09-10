"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Bot, User, Loader2, Sparkles, FileText, UploadCloud } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatJobCard } from "./ChatJobCard";
import { ResumeUploadCard } from "./ResumeUploadCard";
import { ChatProjectRecommendations } from "./ChatProjectRecommendations";
import { useAuth } from "@clerk/nextjs";

import { toast } from "sonner";

import { useChat } from "./chat-provider";

const markdownComponents = {
  p: ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className="mb-4" {...props} />,
  a: ({ ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (props.href?.startsWith("/job/")) {
      const jobId = props.href.replace("/job/", "");
      return <ChatJobCard jobId={jobId} />;
    }
    if (props.href === "/resume/upload/input") {
      return <ResumeUploadCard />;
    }
    if (props.href === "/project/recommendations") {
      return <ChatProjectRecommendations />;
    }
    if (props.href?.startsWith("/resume/upload/success")) {
      const url = new URL(props.href, "http://localhost");
      const fileName = url.searchParams.get("file");
      return (
        <div className="w-full max-w-sm border border-border rounded-xl p-4 bg-surface/50 flex items-center gap-4 mt-2 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
            <FileText size={20} />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-text-primary font-medium text-sm truncate">{fileName}</h4>
            <p className="text-xs text-text-secondary">Uploaded successfully</p>
          </div>
        </div>
      );
    }
    return <a className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  code: ({ className, children, ...props }: any) => {
    return <code className={`bg-surface-hover text-primary px-1.5 py-0.5 rounded-md font-mono text-sm border border-border ${className || ''}`} {...props}>{children}</code>;
  },
  table: ({ ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-4 w-full border border-border rounded-lg">
      <table className="w-full text-left border-collapse text-sm" {...props} />
    </div>
  ),
  thead: ({ ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className="bg-surface/50 border-b border-border" {...props} />,
  th: ({ ...props }: React.HTMLAttributes<HTMLTableCellElement>) => <th className="p-3 font-semibold text-text-primary whitespace-nowrap" {...props} />,
  td: ({ ...props }: React.HTMLAttributes<HTMLTableCellElement>) => <td className="p-3 border-b border-border/50 text-text-secondary" {...props} />,
  tr: ({ ...props }: React.HTMLAttributes<HTMLTableRowElement>) => <tr className="hover:bg-surface/30 transition-colors" {...props} />,
};

export function ChatInterface() {

  const {
    messages,
    input,
    setInput,
    isLoading,
    loadingText,
    isInitializing,
    chatState,
    updateChatState,
    handleSubmit,
    handleHiddenSubmit
  } = useChat();

  const { getToken } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-[calc(100dvh-4rem)] bg-linear-to-br from-background to-surface/80 overflow-hidden relative">
      <div className="flex flex-col flex-1 h-full relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />

        {/* Global hidden file input so it can be triggered from anywhere */}
        <input
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          ref={fileInputRef}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

            const uploadPromise = async () => {
              const token = await getToken();
              if (!token) throw new Error("Not authenticated");

              const formData = new FormData();
              formData.append("resume", file);

              const res = await fetch(`${API_URL}/api/v1/ai/resume/upload`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
              });
              const data = await res.json();
              if (!data.success) {
                throw new Error(data.message || "Upload failed");
              }
              return data;
            };

            setIsUploading(true);
            toast.promise(uploadPromise(), {
              loading: "Uploading and analyzing your resume...",
              success: () => {
                setIsUploading(false);
                if (chatState === "CHOOSING_RESUME_SOURCE" || chatState === "UPLOAD_RESUME") {
                  updateChatState("READY_FOR_CHAT");
                }

                // If the user uploads from the chat interface, let the AI know.
                if (chatState !== "UPLOAD_RESUME") {
                  handleHiddenSubmit("I have uploaded my resume. Please use it for our discussion.");
                }
                return "Resume parsed and analyzed successfully.";
              },
              error: (err) => {
                setIsUploading(false);
                return err.message;
              }
            });

            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          }}
        />

        {isInitializing ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-text-secondary text-sm">Loading your conversation...</p>
          </div>
        ) : chatState === "CHOOSING_RESUME_SOURCE" ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-in fade-in duration-500 z-10">
            <div className="w-20 h-20 bg-linear-to-tr from-primary/20 to-primary/5 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-primary/10">
              <Sparkles className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-bold text-text-primary tracking-tight mb-2">
              How would you like to continue?
            </h3>
            <p className="text-text-secondary max-w-md mb-8">
              To give you the best career advice, I need to know your professional background.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
              <button
                onClick={() => updateChatState("UPLOAD_RESUME")}
                className="flex-1 group relative flex flex-col items-center justify-center p-6 bg-surface border-2 border-border hover:border-primary/50 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <UploadCloud className="w-8 h-8 text-primary mb-3 group-hover:-translate-y-1 transition-transform" />
                <span className="font-semibold text-text-primary">I already have a resume</span>
                <span className="text-xs text-text-secondary mt-1">Upload PDF or DOCX</span>
              </button>
              <button
                onClick={() => {
                  updateChatState("COLLECTING_MISSING_INFO");
                  setInput("I want to build a new resume.");
                }}
                className="flex-1 group relative flex flex-col items-center justify-center p-6 bg-surface border-2 border-border hover:border-primary/50 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <FileText className="w-8 h-8 text-primary mb-3 group-hover:-translate-y-1 transition-transform" />
                <span className="font-semibold text-text-primary">Build a new resume</span>
                <span className="text-xs text-text-secondary mt-1">Create from scratch</span>
              </button>
            </div>
          </div>
        ) : chatState === "UPLOAD_RESUME" ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-in fade-in duration-500 z-10">
            <h3 className="text-2xl font-bold text-text-primary mb-2">Upload your resume</h3>
            <p className="text-text-secondary mb-8">We&apos;ll parse and analyze it instantly.</p>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex flex-col items-center justify-center w-full max-w-md p-12 border-2 border-dashed border-primary/40 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <span className="text-lg font-medium text-primary">Uploading & Analyzing...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-12 h-12 text-primary mb-4" />
                  <span className="text-lg font-medium text-primary mb-1">Click to select file</span>
                  <span className="text-sm text-text-secondary">PDF or DOCX up to 5MB</span>
                </>
              )}
            </button>
            {!isUploading && (
              <button
                onClick={() => updateChatState("CHOOSING_RESUME_SOURCE")}
                className="mt-6 text-sm text-text-secondary hover:text-primary transition-colors"
              >
                Cancel and go back
              </button>
            )}
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
                          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                            {msg.content
                              .replace(/\[JOB_CARD:([a-zA-Z0-9-_]+)\]/g, '[Job Card](/job/$1)')
                              .replace(/\[RESUME_UPLOAD_INPUT\]/g, '[Resume Upload](/resume/upload/input)')
                              .replace(/\[UPLOAD_SUCCESS\("([^"]+)"\)\]/g, '[Upload Success](/resume/upload/success?file=$1)')
                              .replace(/\[PROJECT_RECOMMENDATIONS\]/g, '[Project Recommendations](/project/recommendations)')
                            }
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
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || chatState === "CHOOSING_RESUME_SOURCE" || chatState === "UPLOAD_RESUME"}
                  className="w-14 h-14 shrink-0 bg-surface border border-border text-text-secondary hover:text-primary hover:border-primary/50 rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  title="Upload Resume (PDF/DOCX)"
                >
                  <UploadCloud size={24} />
                </button>
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
                  disabled={!input.trim() || isLoading || chatState === "CHOOSING_RESUME_SOURCE" || chatState === "UPLOAD_RESUME"}
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
