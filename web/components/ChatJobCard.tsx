"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Building2, MapPin, Calendar, Link as LinkIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_url: string;
  description: string;
  date_posted: string;
  site: string;
  company_logo?: string;
}

const jobCache: Record<string, Job> = {};

export function ChatJobCard({ jobId }: { jobId: string }) {
  const { getToken } = useAuth();
  const [job, setJob] = useState<Job | null>(jobCache[jobId] || null);
  const [loading, setLoading] = useState(!jobCache[jobId]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (jobCache[jobId]) {
      setJob(jobCache[jobId]);
      setLoading(false);
      return;
    }

    let mounted = true;
    
    const fetchJob = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        if (!token) return;
        
        const result = await apiRequest(`/api/v1/jobs/${jobId}`, token);
        if (result.success && result.data) {
          jobCache[jobId] = result.data;
          if (mounted) setJob(result.data);
        } else {
          if (mounted) setError(true);
        }
      } catch (e) {
        console.error("Failed to fetch job", e);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchJob();
    
    return () => { mounted = false; };
  }, [jobId, getToken]);

  if (loading) {
    return (
      <div className="my-4 rounded-3xl border border-border bg-surface p-6 shadow-sm animate-pulse max-w-sm not-prose">
        <div className="flex gap-4 mb-4">
          <div className="w-12 h-12 bg-border rounded-lg shrink-0"></div>
          <div className="w-full">
            <div className="h-5 bg-border rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-border rounded w-1/2"></div>
          </div>
        </div>
        <div className="h-4 bg-border rounded w-full mb-2"></div>
        <div className="h-4 bg-border rounded w-4/5"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="my-4 p-4 border border-red-200 bg-red-50 text-red-600 rounded-xl max-w-sm not-prose">
        Failed to load job details.
      </div>
    );
  }

  return (
    <Link 
      href={`/jobs/${job.id}`} 
      className="my-4 block max-w-md group rounded-3xl border border-border bg-surface hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden not-prose"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-4 items-start">
            {job.company_logo ? (
              <div className="w-12 h-12 bg-white rounded-lg border border-border flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-sm">
                <img src={job.company_logo} alt={job.company} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg border border-primary/20 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors pr-2 line-clamp-2 m-0 leading-tight">
                {job.title}
              </h3>
              <div className="flex items-center gap-2 text-text-secondary text-sm mt-1.5">
                <span className="font-medium text-text-primary">{job.company}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-text-secondary text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span>{job.location || "Remote"}</span>
        </div>

        <p className="text-text-secondary text-sm leading-relaxed mb-4 line-clamp-3 m-0">
          {job.description ? job.description.replace(/(\*\*|__|\*|_)/g, '').substring(0, 120) + "..." : "No description available."}
        </p>
      </div>

      <div className="p-4 bg-surface-hover border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Calendar className="w-4 h-4" />
          {job.date_posted || "Recently"}
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
          View Details <LinkIcon className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
