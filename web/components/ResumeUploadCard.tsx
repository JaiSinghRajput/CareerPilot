"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useChat } from "./chat-provider";
import { toast } from "sonner";

export function ResumeUploadCard() {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth();
  const { handleHiddenSubmit, updateChatState, chatState } = useChat();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    toast.promise(uploadPromise(), {
      loading: "Uploading and analyzing your resume...",
      success: () => {
        setFileName(file.name);
        if (chatState === "CHOOSING_RESUME_SOURCE" || chatState === "UPLOAD_RESUME") {
           updateChatState("READY_FOR_CHAT");
        }
        
        // Notify the AI in background
        handleHiddenSubmit("I have uploaded my resume. Please provide a summary, feedback, and let me know if any information is missing.");
        return "Resume parsed successfully!";
      },
      error: (err) => err.message || "Failed to upload resume"
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (fileName) {
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

  return (
    <div className="w-full max-w-sm border-2 border-dashed border-primary/40 rounded-xl p-6 bg-primary/5 flex flex-col items-center text-center mt-2 mb-4 transition-colors hover:bg-primary/10">
      <input 
        type="file" 
        accept=".pdf,.docx" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleUpload}
      />
      
      <UploadCloud className="w-10 h-10 text-primary mb-3" />
      <h4 className="text-text-primary font-medium mb-2">Upload your Resume</h4>
      <p className="text-xs text-text-secondary mb-4">PDF or DOCX up to 5MB</p>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
      >
        Select File
      </button>
    </div>
  );
}
