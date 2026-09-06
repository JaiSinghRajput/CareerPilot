"use client";

import { useState, useEffect, use } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { Briefcase, MapPin, Building2, Calendar, Link as LinkIcon, ArrowLeft, ArrowUpRight, DollarSign, Clock, Users } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_url: string;
  description: string;
  date_posted: string;
  site: string;
  company_logo: string;
  company_url: string;
  job_type: string;
  is_remote: boolean;
  min_amount: number;
  max_amount: number;
  currency: string;
  interval: string;
  emails: string[];
}

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        if (!token) return;

        const result = await apiRequest(`/api/v1/jobs/${id}`, token);
        
        if (result.success && result.data) {
          setJob(result.data);
        } else {
          toast.error(result.error || "Failed to load job details.");
        }
      } catch (error: any) {
        console.error("Failed to fetch job", error);
        toast.error(error.message || "Failed to fetch job details.");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchJob();
    }
  }, [id, isLoaded, isSignedIn]);

  if (!isLoaded || !isSignedIn) return null;

  if (loading) {
    return (
      <div className="min-h-screen p-6 md:p-10 animate-pulse">
        <div className="mx-auto max-w-4xl">
          <div className="h-6 w-24 bg-border rounded-lg mb-8"></div>
          <div className="bg-surface border border-border rounded-3xl p-8 mb-8 shadow-sm">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-20 h-20 bg-border rounded-2xl shrink-0"></div>
              <div className="flex-1">
                <div className="h-8 bg-border rounded-lg w-2/3 mb-4"></div>
                <div className="h-5 bg-border rounded-lg w-1/3 mb-2"></div>
                <div className="h-5 bg-border rounded-lg w-1/4"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-border rounded-2xl"></div>)}
            </div>
            <div className="h-6 bg-border rounded-lg w-48 mb-6"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-4 bg-border rounded-lg w-full"></div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center text-center">
        <Briefcase className="w-16 h-16 text-text-muted mb-4" />
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <p className="text-text-secondary mb-6">This job might have expired or doesn't exist in your recommendations cache.</p>
        <Link href="/jobs" className="primary-button px-6 py-2">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Job Explorer
        </Link>

        {/* Header Card */}
        <div className="bg-surface border border-border rounded-3xl p-6 md:p-10 mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between mb-8">
            <div className="flex items-start gap-6">
              {job.company_logo ? (
                <div className="w-20 h-20 rounded-2xl bg-white border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-2">
                  <img src={job.company_logo} alt={`${job.company} logo`} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-10 h-10" />
                </div>
              )}
              
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{job.title}</h1>
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border bg-blue-500/10 text-blue-500 border-blue-500/20 mt-1 md:mt-0">
                    {job.site}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-text-secondary font-medium">
                  <a href={job.company_url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Building2 className="w-4 h-4" /> {job.company}
                  </a>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {job.location || "Remote"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> {job.date_posted ? new Date(job.date_posted).toLocaleDateString() : "Recently posted"}
                  </div>
                </div>
              </div>
            </div>
            
            <a 
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-button px-8 py-3 shrink-0 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              Apply Now <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-background rounded-2xl border border-border">
            <div className="flex flex-col gap-1 p-3">
              <span className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3"/> Job Type</span>
              <span className="font-semibold text-text-primary capitalize">{job.job_type?.replace(/_/g, ' ') || "Full-time"}</span>
            </div>
            <div className="flex flex-col gap-1 p-3">
              <span className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3"/> Workplace</span>
              <span className="font-semibold text-text-primary">{job.is_remote ? "Remote" : "On-site"}</span>
            </div>
            <div className="flex flex-col gap-1 p-3">
              <span className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><DollarSign className="w-3 h-3"/> Salary Range</span>
              <span className="font-semibold text-text-primary">
                {job.min_amount && job.max_amount 
                  ? `${job.currency === 'USD' ? '$' : job.currency || ''}${job.min_amount.toLocaleString()} - ${job.max_amount.toLocaleString()} ${job.interval === 'yearly' ? '/yr' : ''}`
                  : "Not specified"}
              </span>
            </div>
            <div className="flex flex-col gap-1 p-3">
              <span className="text-text-muted text-xs font-semibold uppercase tracking-wider flex items-center gap-1"><Users className="w-3 h-3"/> Contact Emails</span>
              <span className="font-semibold text-text-primary truncate">
                {job.emails && job.emails.length > 0 ? job.emails[0] : "None provided"}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-surface border border-border rounded-3xl p-6 md:p-10 shadow-xs">
          <h2 className="text-xl font-bold mb-6 text-text-primary border-b border-border pb-4">Job Description</h2>
          <div className="prose prose-invert max-w-none prose-p:text-text-secondary prose-li:text-text-secondary prose-headings:text-text-primary prose-a:text-primary hover:prose-a:text-primary/80 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3">
            {job.description ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {job.description
                  .replace(/\\n/g, '\n')
                  .replace(/\\([#*_\-&])/g, '$1')
                  .replace(/\n+/g, '\n\n')}
              </ReactMarkdown>
            ) : (
              <p className="text-text-muted italic">No detailed description was provided for this job. You can view the full details on the original listing.</p>
            )}
          </div>
          
          <div className="mt-10 pt-6 border-t border-border flex justify-between items-center">
             <span className="text-sm text-text-muted">Job ID: {job.id}</span>
             <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium text-sm">View Original Listing</a>
          </div>
        </div>
      </div>
    </div>
  );
}
