"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@clerk/nextjs";
import { apiRequest } from "@/lib/api";
import { Lightbulb, Rocket, ChevronRight, Layers, Star, Code2, Loader2, X } from "lucide-react";

interface ProjectRecommendation {
  title: string;
  description: string;
  technologies: string[];
  difficulty: string;
  reasonToBuild: string;
}

export function ChatProjectRecommendations() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<ProjectRecommendation[]>([]);
  const [hasFetched, setHasFetched] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectRecommendation | null>(null);

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
            setLoading(true);
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

    checkStatus();

    if (isGenerating) {
      interval = setInterval(() => {
        checkStatus();
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [isGenerating, getToken]);

  const getDifficultyColor = (difficulty: string) => {
    const diff = difficulty.toLowerCase();
    if (diff.includes("advanced") || diff.includes("hard")) return "bg-red-500/10 text-red-500 border-red-500/20";
    if (diff.includes("intermediate") || diff.includes("medium")) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    return "bg-green-500/10 text-green-500 border-green-500/20";
  };

  if (loading && !hasFetched) {
    return (
      <div className="my-4 p-6 rounded-3xl border border-border bg-surface flex flex-col items-center justify-center animate-pulse not-prose text-center max-w-2xl">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-text-primary font-medium">Generating Personalized Project Ideas...</p>
        <p className="text-sm text-text-secondary mt-1">This might take a minute.</p>
      </div>
    );
  }

  if (!loading && hasFetched && recommendations.length === 0) {
    return (
      <div className="my-4 p-6 rounded-3xl border border-border bg-surface flex flex-col items-center text-center max-w-2xl not-prose">
        <Layers className="w-10 h-10 text-text-secondary mb-3 opacity-50" />
        <p className="text-text-secondary font-medium">No recommendations found.</p>
      </div>
    );
  }

  return (
    <div className="my-4 space-y-4 max-w-2xl not-prose relative">
      <div className="flex items-center gap-3 mb-2 px-2">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
          <Lightbulb size={18} />
        </div>
        <h3 className="font-bold text-lg m-0">Recommended Projects</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 px-2">
        {recommendations.map((project, idx) => (
          <div 
            key={idx} 
            className="w-full group rounded-3xl border border-border bg-surface hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col cursor-pointer"
            onClick={() => setSelectedProject(project)}
          >
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors pr-2 line-clamp-2">
                  {project.title}
                </h3>
              </div>
              <div className="mb-3">
                 <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getDifficultyColor(project.difficulty)}`}>
                   {project.difficulty}
                 </span>
              </div>
              
              <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-3 flex-1">
                {project.description}
              </p>

              <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-border">
                 <div className="flex items-center gap-1.5 text-text-secondary">
                   <Code2 className="w-4 h-4" /> 
                   <span>{project.technologies.length} Tech</span>
                 </div>
                 <span className="text-primary font-medium flex items-center gap-1 group-hover:underline">
                   View Detail <ChevronRight className="w-4 h-4" />
                 </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedProject && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col relative animate-in zoom-in-95 duration-200 overflow-hidden">
             <div className="flex items-center justify-between p-4 border-b border-border bg-surface/50 shrink-0">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                   <Rocket className="w-4 h-4" />
                 </div>
                 <h2 className="text-lg font-bold text-text-primary line-clamp-1">{selectedProject.title}</h2>
               </div>
               <button 
                 onClick={() => setSelectedProject(null)}
                 className="p-1.5 rounded-full hover:bg-surface-hover text-text-secondary transition-colors shrink-0"
               >
                 <X className="w-4 h-4" />
               </button>
             </div>
             
             <div className="p-4 sm:p-5">
               <div className="mb-4">
                 <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getDifficultyColor(selectedProject.difficulty)}`}>
                   {selectedProject.difficulty}
                 </span>
               </div>

               <div className="space-y-4">
                 <div>
                   <h3 className="text-base font-semibold text-text-primary mb-1.5">Project Overview</h3>
                   <p className="text-text-secondary text-xs leading-relaxed">{selectedProject.description}</p>
                 </div>

                 <div>
                   <h3 className="text-base font-semibold text-text-primary mb-1.5 flex items-center gap-1.5">
                     <Code2 className="w-4 h-4 text-primary" /> Tools & Technologies
                   </h3>
                   <div className="flex flex-wrap gap-1.5">
                     {selectedProject.technologies.map((tech, tIdx) => (
                       <span key={tIdx} className="bg-surface-hover text-text-primary px-2 py-1 rounded-md text-[10px] border border-border font-medium">
                         {tech}
                       </span>
                     ))}
                   </div>
                 </div>

                 <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                   <h3 className="text-base font-semibold text-text-primary mb-1.5 flex items-center gap-1.5">
                     <Star className="w-4 h-4 text-yellow-500" /> Benefits & Skills Gained
                   </h3>
                   <p className="text-text-secondary text-xs leading-relaxed">
                     {selectedProject.reasonToBuild}
                   </p>
                 </div>
               </div>
             </div>
             
             <div className="p-4 bg-surface border-t border-border mt-auto flex justify-end shrink-0">
               <button 
                 onClick={() => setSelectedProject(null)}
                 className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
               >
                 Close
               </button>
             </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
