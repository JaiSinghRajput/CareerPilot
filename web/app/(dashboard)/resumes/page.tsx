"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { FileText, Star, BrainCircuit, Calendar, ChevronRight, Trash2 } from "lucide-react";

export default function ResumesPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchResumes();
    } else if (isLoaded && !isSignedIn) {
      // Use setTimeout to avoid synchronous setState warning
      setTimeout(() => setLoading(false), 0);
    }
  }, [isLoaded, isSignedIn]);

  async function fetchResumes() {
    try {
      const token = await getToken();
      if (!token) return;
      const result = await apiRequest("/api/v1/ai/resumes", token);
      if (result.success) {
        setResumes(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      toast.error("Failed to load your resumes.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze(id: number) {
    setAnalyzingId(id);
    const toastId = toast.loading("Analyzing your resume... This may take a few seconds.", {
      position: "bottom-right",
    });
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const result = await apiRequest(`/api/v1/ai/resume/${id}/analyze`, token, {
        method: "POST"
      });
      if (result.success) {
        toast.dismiss(toastId);
        toast.success("Resume analyzed successfully!", { position: "bottom-right" });
        fetchResumes(); // Refresh the list
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error instanceof Error ? error.message : "Failed to analyze resume", { position: "bottom-right" });
    } finally {
      setAnalyzingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this resume? This action cannot be undone.")) return;
    
    setDeletingId(id);
    const toastId = toast.loading("Deleting resume...", { position: "bottom-right" });
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const result = await apiRequest(`/api/v1/ai/resume/${id}`, token, {
        method: "DELETE"
      });
      if (result.success) {
        toast.dismiss(toastId);
        toast.success("Resume deleted successfully!", { position: "bottom-right" });
        fetchResumes(); // Refresh the list
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error instanceof Error ? error.message : "Failed to delete resume", { position: "bottom-right" });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6 md:p-10 min-h-screen">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold">My Resumes</h1>
          <p className="mt-2 text-text-secondary">
            Manage your uploaded resumes and view AI insights.
          </p>
        </div>
        <Link href="/resumes/upload" className="primary-button text-sm px-4 py-2">
          Upload New Resume
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-text-secondary animate-pulse">
          Loading resumes...
        </div>
      ) : resumes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center glass-card">
          <FileText className="mx-auto h-12 w-12 text-text-muted mb-4" />
          <h3 className="text-xl font-semibold">No resumes found</h3>
          <p className="mt-2 text-text-secondary">
            Upload your first resume to get started with CareerPilot.
          </p>
          <Link href="/resumes/upload" className="mt-6 inline-block primary-button">
            Go to Resume Builder
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <div key={resume.id} className="rounded-3xl border border-border bg-surface p-6 shadow-sm glass-card flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary truncate max-w-37.5" title={resume.originalFileName}>
                      {resume.originalFileName || "Untitled Resume"}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(resume.id)}
                  disabled={deletingId === resume.id}
                  className={`p-2 text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors ${deletingId === resume.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Delete Resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {resume.atsScore ? (
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-secondary">ATS Match</span>
                    <span className="text-lg font-bold text-primary">{resume.atsScore}/100</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 mb-4 border border-border overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${resume.atsScore}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-3">
                    {resume.summary || "No summary available."}
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                  <BrainCircuit className="w-10 h-10 text-text-muted mb-3 opacity-50" />
                  <p className="text-sm text-text-secondary mb-4">
                    Not analyzed yet. Analyze this resume to get an ATS score and insights.
                  </p>
                  <button
                    onClick={() => handleAnalyze(resume.id)}
                    disabled={analyzingId === resume.id}
                    className={`w-full secondary-button py-2 ${analyzingId === resume.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {analyzingId === resume.id ? "Analyzing..." : "Analyze Resume"}
                  </button>
                </div>
              )}

              {resume.atsScore && (
                <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                  <button
                    onClick={() => handleAnalyze(resume.id)}
                    disabled={analyzingId === resume.id}
                    className={`text-xs font-medium text-primary hover:underline ${analyzingId === resume.id ? 'opacity-50' : ''}`}
                  >
                    {analyzingId === resume.id ? "Re-analyzing..." : "Re-analyze"}
                  </button>
                  <div className="flex items-center gap-3">
                    <Link href={`/resumes/${resume.id}/feedback`} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline transition-colors">
                      View Feedback
                    </Link>
                    <Link href={`/resumes/${resume.id}`} className="flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">
                      View Details <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
