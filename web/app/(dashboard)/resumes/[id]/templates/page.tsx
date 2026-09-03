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
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(null);

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

  if (selectedTemplateIndex === null) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border p-4 shadow-sm flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-surface-hover rounded-full transition-colors text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-primary" />
              Template Selection
            </h1>
            <p className="text-sm text-text-secondary hidden md:block">Choose a template for your resume.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6 md:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEMPLATES.map((template, idx) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplateIndex(idx)}
                className="cursor-pointer group rounded-2xl border border-border bg-surface overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300 w-70 mx-auto"
              >
                {/* Preview Area - scales down the actual template */}
                <div className="bg-slate-100 dark:bg-slate-900 h-100 overflow-hidden flex justify-center relative border-b border-border">
                  <div className="absolute top-4 w-[210mm] transform scale-[0.35] origin-top pointer-events-none shadow-xl bg-white">
                    <template.component data={resumeData} />
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-slate-100/80 via-transparent to-transparent dark:from-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                    <span className="bg-primary text-white px-4 py-2 rounded-full font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                      Select Template
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-text-primary mb-2">{template.name}</h3>
                  <p className="text-text-secondary">{template.description}</p>
                </div>
              </div>
            ))}
          </div>
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
          <button onClick={() => setSelectedTemplateIndex(null)} className="p-2 hover:bg-surface-hover rounded-full transition-colors text-text-secondary hover:text-text-primary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-primary" />
              {TEMPLATES[selectedTemplateIndex].name} Template
            </h1>
            <p className="text-sm text-text-secondary hidden md:block">Preview and export your resume as a PDF.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
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
        <div className="shadow-2xl print:shadow-none print:w-full bg-white w-full max-w-[210mm]">
          <ActiveTemplateComponent data={resumeData} />
        </div>
      </div>
    </div>
  );
}
