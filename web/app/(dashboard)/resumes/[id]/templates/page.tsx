"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, Download, LayoutTemplate, Printer, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ClassicTemplate, ModernTemplate, MinimalistTemplate } from "@/components/templates";

const TEMPLATES = [
  { id: "classic", name: "Classic", description: "A timeless, single-column design perfect for traditional industries.", component: ClassicTemplate },
  { id: "modern", name: "Modern", description: "A sleek, two-column layout with a dedicated sidebar for contact info.", component: ModernTemplate },
  { id: "minimalist", name: "Minimalist", description: "An ultra-clean, spacious layout focused on beautiful typography.", component: MinimalistTemplate },
];

export default function ResumeTemplatesPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resumeData, setResumeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);

  async function fetchResume() {
    try {
      const token = await getToken();
      if (!token) return;
      const result = await apiRequest(`/api/v1/ai/resume/${id}`, token);
      if (result.success && result.data?.parsedData) {
        setResumeData(result.data.parsedData);
      } else {
        throw new Error("Failed to load resume data");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your resume.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn && id) {
      fetchResume();
    } else if (isLoaded && !isSignedIn) {
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, id]);

  const handlePrint = () => {
    window.print();
  };

  const nextTemplate = () => {
    setSelectedTemplateIndex((prev) => (prev + 1) % TEMPLATES.length);
  };

  const prevTemplate = () => {
    setSelectedTemplateIndex((prev) => (prev - 1 + TEMPLATES.length) % TEMPLATES.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center print:hidden">
        <div className="animate-pulse text-text-secondary flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5 animate-bounce" />
          Loading Templates...
        </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center print:hidden">
        <div className="text-center text-text-secondary">
          <p>Resume not found or could not be loaded.</p>
          <Link href="/resumes" className="text-primary hover:underline mt-4 inline-block">Return to Resumes</Link>
        </div>
      </div>
    );
  }

  const ActiveTemplateComponent = TEMPLATES[selectedTemplateIndex].component;

  return (
    <div className="min-h-screen bg-background">
      {/* Non-printable Top Bar */}
      <div className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border p-4 print:hidden shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-surface-hover rounded-full transition-colors text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-primary" />
              Template Selection
            </h1>
            <p className="text-sm text-text-secondary hidden md:block">Choose a template and export your resume as a PDF.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden p-1 shadow-sm">
            <button onClick={prevTemplate} className="p-2 hover:bg-surface-hover rounded-md transition-colors text-text-secondary hover:text-text-primary">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 text-center min-w-35">
              <div className="font-semibold text-sm text-text-primary">{TEMPLATES[selectedTemplateIndex].name}</div>
              <div className="text-[10px] text-text-muted">{selectedTemplateIndex + 1} of {TEMPLATES.length}</div>
            </div>
            <button onClick={nextTemplate} className="p-2 hover:bg-surface-hover rounded-md transition-colors text-text-secondary hover:text-text-primary">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Save as PDF
          </button>
        </div>
      </div>

      {/* Non-printable Template Info */}
      <div className="p-4 text-center print:hidden bg-indigo-50 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-200 text-sm">
        <Printer className="w-4 h-4 inline-block mr-2" />
        <strong>Pro Tip:</strong> When the print dialog opens, ensure &quot;Background graphics&quot; is enabled and &quot;Headers and footers&quot; is disabled for the best result.
      </div>

      {/* Printable Area Container */}
      <div className="py-10 flex justify-center print:py-0 bg-slate-100 dark:bg-slate-900 overflow-x-auto min-h-[calc(100vh-140px)]">
        <div className="shadow-2xl print:shadow-none print:w-full">
          <ActiveTemplateComponent data={resumeData} />
        </div>
      </div>
    </div>
  );
}
