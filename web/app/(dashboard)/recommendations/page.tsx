"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { Lightbulb, Rocket, ChevronRight, Layers, Star, Code2 } from "lucide-react";

interface ProjectRecommendation {
  title: string;
  description: string;
  technologies: string[];
  difficulty: string;
  reasonToBuild: string;
}

export default function RecommendationsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [loading, setLoading] = useState(true); // Default to true while checking initial status
  const [recommendations, setRecommendations] = useState<ProjectRecommendation[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Poll for status
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const token = await getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const result = await apiRequest(`/api/v1/ai/projects/recommend`, token);

        if (result.success && result.data) {
          if (result.data.isGenerating) {
            setIsGenerating(true);
            setLoading(true); // Keep loading state active
          } else {
            setIsGenerating(false);
            setLoading(false);
            if (result.data.recommendations) {
              setRecommendations(result.data.recommendations);
              setHasFetched(true);
            }
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to check status", error);
        setLoading(false);
      }
    };

    // Check immediately on mount
    if (isLoaded && isSignedIn) {
      checkStatus();
    }

    if (isGenerating) {
      interval = setInterval(() => {
        checkStatus();
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [isGenerating, isLoaded, isSignedIn, getToken]);

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      setIsGenerating(true); // Optimistically start polling
      const token = await getToken();
      if (!token) return;

      const result = await apiRequest(`/api/v1/ai/projects/recommend`, token, { method: "POST" });

      if (!result.success) {
        throw new Error(result.message || "Failed to start generation.");
      } else {
        toast.success("Started generating project ideas...");
      }
    } catch (error: any) {
      console.error(error);
      setIsGenerating(false);
      setLoading(false);
      toast.error(error.message || "Failed to start project ideas generation.");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const diff = difficulty.toLowerCase();
    if (diff.includes("advanced") || diff.includes("hard")) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (diff.includes("intermediate") || diff.includes("medium")) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    return "bg-green-500/10 text-green-500 border-green-500/20";
  };

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <Lightbulb className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">AI Project Ideas</h1>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Level up your career with tailored project recommendations. Our AI analyzes your existing projects and skills across all your resumes to suggest ideas that help you stand out.
          </p>

          <div className="mt-8">
            <button
              onClick={generateRecommendations}
              disabled={loading}
              className={`primary-button text-lg px-8 py-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Profile & Generating Ideas...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  {hasFetched ? "Regenerate Project Ideas" : "Get Project Ideas"}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && !hasFetched && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-3xl border border-border bg-surface p-8 shadow-sm animate-pulse">
                <div className="h-6 bg-border rounded-lg w-2/3 mb-4"></div>
                <div className="h-4 bg-border rounded-lg w-full mb-2"></div>
                <div className="h-4 bg-border rounded-lg w-4/5 mb-6"></div>
                <div className="flex gap-2 mb-6">
                  <div className="h-8 w-16 bg-border rounded-full"></div>
                  <div className="h-8 w-16 bg-border rounded-full"></div>
                </div>
                <div className="h-16 bg-border rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations Grid */}
        {!loading && hasFetched && recommendations.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {recommendations.map((project, idx) => (
              <div key={idx} className="group rounded-3xl border border-border bg-surface hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden flex flex-col">
                <div className="p-8 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold text-text-primary group-hover:text-primary transition-colors pr-4">
                      {project.title}
                    </h3>
                    <span className={`shrink-0 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getDifficultyColor(project.difficulty)}`}>
                      {project.difficulty}
                    </span>
                  </div>

                  <p className="text-text-secondary leading-relaxed mb-6">
                    {project.description}
                  </p>

                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
                      <Code2 className="w-4 h-4 text-primary" /> Suggested Tech Stack
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, tIdx) => (
                        <span key={tIdx} className="bg-surface-hover text-text-secondary px-3 py-1.5 rounded-lg text-sm border border-border font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-linear-to-r from-primary/5 to-indigo-500/5 border-t border-border mt-auto">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white dark:bg-black rounded-lg shadow-sm border border-border shrink-0 mt-1">
                      <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text-primary mb-1">Why build this?</h4>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {project.reasonToBuild}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && hasFetched && recommendations.length === 0 && (
          <div className="text-center p-12 border border-border border-dashed rounded-3xl text-text-secondary">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recommendations could be generated. Please ensure you have parsed resumes with valid data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
