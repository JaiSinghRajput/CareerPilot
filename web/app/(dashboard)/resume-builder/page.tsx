"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Code, Link, Sparkles, Loader2, Compass } from "lucide-react";

export default function ResumeBuilderPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [isBuilding, setIsBuilding] = useState(false);

  async function handleBuild(e: React.FormEvent) {
    e.preventDefault();

    if (!linkedInUrl && !githubUsername) {
      toast.error("Please provide at least a LinkedIn URL or GitHub username.");
      return;
    }

    setIsBuilding(true);
    const toastId = toast.loading("Scraping profiles and building your resume... This may take a minute or two.", {
      position: "bottom-right",
    });

    try {
      if (!isLoaded || !isSignedIn) {
        throw new Error("You must be logged in to build a resume.");
      }

      const token = await getToken();
      if (!token) throw new Error("Authentication error.");

      const result = await apiRequest("/api/v1/builder/generate", token, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedInUrl, githubUsername }),
      });

      if (result.success && result.data?.id) {
        toast.dismiss(toastId);
        toast.success("Resume built successfully!", { position: "bottom-right" });
        router.push(`/resumes/${result.data.id}/templates`);
      } else {
        throw new Error("Failed to return the generated resume.");
      }
    } catch (error: any) {
      console.error("Builder error:", error);
      toast.dismiss(toastId);
      toast.error(error.message || "An error occurred while building the resume.", { position: "bottom-right" });
    } finally {
      setIsBuilding(false);
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10 flex items-center justify-center relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-120 h-120 bg-indigo-500/10 rounded-full blur-3xl opacity-50 mix-blend-multiply pointer-events-none"></div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-primary/20 to-indigo-500/20 mb-6 border border-primary/20 shadow-sm">
            <Compass className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-indigo-500">
            AI Resume Builder
          </h1>
          <p className="mt-4 text-text-secondary text-lg max-w-lg mx-auto">
            Provide your public profiles, and our AI will instantly craft a highly professional, structured resume for you.
          </p>
        </div>

        <form onSubmit={handleBuild} className="glass-card bg-surface/80 p-8 md:p-10 rounded-3xl border border-border shadow-xl backdrop-blur-xl">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-2">
                <Link className="w-4 h-4 text-blue-600" /> LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/yourprofile"
                className="w-full rounded-2xl border bg-background p-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-text-primary"
                disabled={isBuilding}
              />
              <p className="text-xs text-text-muted mt-2">Required for extracting your work experience, education, and skills.</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-2">
                <Code className="w-4 h-4 text-gray-800 dark:text-gray-200" /> GitHub Username
              </label>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="e.g. torvalds"
                className="w-full rounded-2xl border bg-background p-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-text-primary"
                disabled={isBuilding}
              />
              <p className="text-xs text-text-muted mt-2">Optional. We will pull your top repositories and inject them into the Projects section.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isBuilding || (!linkedInUrl && !githubUsername)}
            className={`mt-10 w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform ${isBuilding
                ? 'bg-surface-hover text-text-muted cursor-not-allowed border border-border'
                : (!linkedInUrl && !githubUsername)
                  ? 'bg-surface-hover text-text-muted cursor-not-allowed border border-border'
                  : 'bg-linear-to-r from-primary to-indigo-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
              }`}
          >
            {isBuilding ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Crafting Your Resume...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Build My Resume
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-8">
          By clicking build, you allow CareerPilot to extract your public profile data.
        </p>
      </div>
    </div>
  );
}
