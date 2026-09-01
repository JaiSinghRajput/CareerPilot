"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MessageSquare, AlertCircle, Sparkles, BrainCircuit } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function ResumeFeedbackPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const params = useParams();
  const router = useRouter();
  const resumeId = params.id as string;

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [resumeName, setResumeName] = useState<string>("");

  useEffect(() => {
    if (resumeId && isLoaded && isSignedIn) {
      fetchResumeDetails(resumeId);
    }
  }, [resumeId, isLoaded, isSignedIn]);

  async function fetchResumeDetails(id: string) {
    try {
      const token = await getToken();
      if (!token) return;
      const result = await apiRequest(`/api/v1/ai/resume/${id}`, token);
      if (result.success && result.data) {
        setAtsScore(result.data.atsScore);
        setResumeName(result.data.originalFileName || "Your Resume");
        
        if (result.data.feedback && Array.isArray(result.data.feedback)) {
          setFeedback(result.data.feedback);
        } else {
           setFeedback([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch resume:", error);
      toast.error("Failed to load resume feedback.");
      router.push("/resumes");
    } finally {
      setIsLoadingData(false);
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="animate-pulse text-text-secondary flex flex-col items-center gap-4">
          <BrainCircuit className="w-8 h-8 text-primary" />
          <p>Loading AI Feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href="/resumes" className="text-text-muted hover:text-text-primary flex items-center text-sm font-medium transition-colors mb-4 inline-flex">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to My Resumes
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="text-3xl font-bold flex items-center gap-3">
                 <MessageSquare className="w-8 h-8 text-primary" />
                 AI Feedback
               </h1>
               <p className="mt-2 text-text-secondary">
                 Personalized feedback for <span className="font-semibold text-text-primary">{resumeName}</span>
               </p>
            </div>
            {atsScore !== null && (
              <div className="bg-primary/10 text-primary border border-primary/20 px-6 py-3 rounded-2xl font-bold text-xl shadow-sm text-center">
                <div className="text-xs uppercase tracking-wider font-semibold opacity-70 mb-1">ATS Match</div>
                {atsScore}/100
              </div>
            )}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-8 rounded-3xl border border-border bg-surface p-8 shadow-sm glass-card">
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">Actionable Insights</h2>
          </div>

          {feedback.length > 0 ? (
            <div className="space-y-6">
              {feedback.map((point: any, index: number) => {
                const title = typeof point === 'object' && point.title ? point.title : `Feedback Point ${index + 1}`;
                const desc = typeof point === 'object' && point.description ? point.description : point;
                return (
                  <div key={index} className="flex items-start gap-4 p-5 rounded-2xl bg-background border border-border hover:border-primary/30 transition-colors">
                    <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary text-lg mb-1">{title}</h4>
                      <p className="text-text-secondary leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mb-4">
                 <MessageSquare className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Feedback Generated</h3>
              <p className="text-text-secondary max-w-md mx-auto mb-6">
                It looks like this resume hasn't been analyzed with the new detailed feedback system yet, or no feedback was found.
              </p>
              <Link href="/resumes" className="primary-button inline-flex">
                Go back and Re-analyze
              </Link>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-border flex justify-between items-center">
             <p className="text-sm text-text-muted">
               Use this feedback to improve your resume before applying for your next role.
             </p>
             <Link href={`/resumes/${resumeId}`} className="secondary-button text-sm px-4 py-2">
               View Parsed Data
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
