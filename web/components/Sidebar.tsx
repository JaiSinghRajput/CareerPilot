"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/ThemeToggle";
import { LayoutDashboard, FileText, Compass, ChevronLeft, ChevronRight, Menu, X, Lightbulb, Briefcase, Plus, MessageSquare, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMode } from "./mode-provider";
import { useChat } from "./chat-provider";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { mode } = useMode();
  const { chatsList, chatId, loadChat, createNewChat, deleteChat } = useChat();

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/resumes", label: "My Resumes", icon: FileText },
    { href: "/resume-builder", label: "Resume Builder", icon: Compass },
    { href: "/recommendations", label: "Project Ideas", icon: Lightbulb },
    { href: "/jobs", label: "Job Explorer", icon: Briefcase },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-surface sticky top-0 z-40 print:hidden">
        <Link href="/" className="brand text-lg">
          Career<span>Pilot</span> <b>AI</b>
        </Link>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-text-primary rounded-md hover:bg-surface-hover">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Content (Desktop + Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 transform bg-surface border-r border-border transition-all duration-300 md:sticky md:top-0 md:translate-x-0 print:hidden ${
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full"
        } ${isCollapsed ? "md:w-20" : "md:w-64"} flex flex-col h-screen overflow-hidden`}
      >
        <div className={`border-b border-border p-6 flex items-center ${isCollapsed ? 'md:justify-center px-4 md:px-0' : 'justify-between'}`}>
          <div className={`${isCollapsed ? 'md:hidden' : 'block'}`}>
            <Link href="/" className="brand text-xl">
              Career<span>Pilot</span> <b>AI</b>
            </Link>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block p-1 rounded-md text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 rounded-md text-text-muted hover:bg-surface-hover hover:text-text-primary"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {mode === 'chat' ? (
            <>
              <button
                onClick={() => { createNewChat(); setIsMobileOpen(false); }}
                className={`w-full py-2.5 px-4 mb-4 bg-primary text-primary-foreground rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm font-medium ${isCollapsed ? 'px-0' : ''}`}
                title={isCollapsed ? "New Chat" : undefined}
              >
                <Plus size={18} />
                {!isCollapsed && "New Chat"}
              </button>
              {chatsList?.length === 0 ? (
                <p className={`text-sm text-text-secondary/70 text-center mt-6 ${isCollapsed ? 'hidden' : 'block'}`}>No chat history yet.</p>
              ) : (
                chatsList?.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => { 
                      if (chatId !== chat.id) loadChat(chat.id); 
                      setIsMobileOpen(false);
                    }}
                    className={`group relative flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      chatId === chat.id ? 'bg-primary/10 text-primary' : 'hover:bg-surface text-text-secondary hover:text-text-primary'
                    } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                    title={isCollapsed ? (chat.title || 'New Conversation') : undefined}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare size={16} className="shrink-0" />
                      {!isCollapsed && (
                        <span className="truncate text-sm font-medium">
                          {chat.title || 'New Conversation'}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <button
                        onClick={(e) => deleteChat(e, chat.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-text-secondary hover:text-destructive hover:bg-destructive/10 rounded-md transition-all shrink-0"
                        title="Delete Chat"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </>
          ) : (
            navItems.map((item) => {
              const isActive = pathname.startsWith(item.href) && item.href !== "#";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center rounded-lg px-3 py-3 font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  } ${isCollapsed ? "md:justify-center justify-start gap-3" : "justify-start gap-3"}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className={`${isCollapsed ? 'md:hidden' : 'block'}`}>{item.label}</span>
                </Link>
              );
            })
          )}
        </nav>

        <div className={`border-t border-border p-4 flex items-center ${isCollapsed ? 'md:flex-col md:gap-4 justify-between' : 'justify-between'}`}>
          <UserButton />
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
