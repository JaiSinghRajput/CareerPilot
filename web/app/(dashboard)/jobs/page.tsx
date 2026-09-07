"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { Briefcase, MapPin, Building2, Calendar, Link as LinkIcon, Layers, Settings2, X } from "lucide-react";
import Link from "next/link";

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

export default function JobsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  // Search Preferences State
  const [showPreferences, setShowPreferences] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");

  const fetchJobs = async (customSearch = false) => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      let url = `/api/v1/jobs`;
      if (customSearch && (searchTerm || location)) {
        const params = new URLSearchParams();
        if (searchTerm) params.append("searchTerm", searchTerm);
        if (location) params.append("location", location);
        url += `?${params.toString()}`;
      }

      const result = await apiRequest(url, token);
      
      if (result.success && result.data && result.data.jobs) {
        setJobs(result.data.jobs);
        setHasFetched(true);
        if (customSearch) setShowPreferences(false);
      } else {
        toast.error("Failed to load jobs.");
      }
      setLoading(false);
    } catch (error: any) {
      console.error("Failed to fetch jobs", error);
      setLoading(false);
      toast.error(error.message || "Failed to fetch matching jobs.");
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && !hasFetched) {
      fetchJobs();
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">AI Job Explorer</h1>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Discover jobs automatically matched to your skills, experience, and compatible job roles based on your parsed resume.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => fetchJobs(false)}
              disabled={loading}
              className={`primary-button text-lg px-8 py-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Finding Matches...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Auto Refresh
                </span>
              )}
            </button>
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="px-6 py-3 rounded-xl border border-border bg-surface hover:bg-surface-hover text-text-primary transition-colors flex items-center gap-2 font-semibold"
            >
              <Settings2 className="w-5 h-5" />
              Edit Search
            </button>
          </div>
        </div>

        {/* Search Preferences Panel */}
        {showPreferences && (
          <div className="mb-10 bg-surface border border-primary/20 rounded-2xl p-6 shadow-lg shadow-primary/5 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" />
                Custom Search Preferences
              </h3>
              <button onClick={() => setShowPreferences(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Target Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Developer"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-hidden focus:border-primary/50 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Preferred Location</label>
                <input
                  type="text"
                  placeholder="e.g. Alwar, Rajasthan, India"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-hidden focus:border-primary/50 transition-colors"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setLocation("");
                }}
                className="px-5 py-2.5 rounded-xl border border-border hover:bg-surface-hover transition-colors font-medium text-sm"
              >
                Clear
              </button>
              <button 
                onClick={() => fetchJobs(true)}
                disabled={loading || (!searchTerm && !location)}
                className={`primary-button px-6 py-2.5 text-sm ${loading || (!searchTerm && !location) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Search Jobs
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-3xl border border-border bg-surface p-8 shadow-sm animate-pulse">
                <div className="h-6 bg-border rounded-lg w-2/3 mb-4"></div>
                <div className="h-4 bg-border rounded-lg w-full mb-2"></div>
                <div className="h-4 bg-border rounded-lg w-4/5 mb-6"></div>
                <div className="flex gap-2 mb-6">
                  <div className="h-8 w-24 bg-border rounded-full"></div>
                  <div className="h-8 w-24 bg-border rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Jobs List */}
        {!loading && hasFetched && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Link 
                href={`/jobs/${job.id}`} 
                key={job.id} 
                className="group rounded-3xl border border-border bg-surface hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-1">
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
                        <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors pr-2 line-clamp-2">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-text-secondary text-sm mt-1">
                          <span className="font-medium text-text-primary">{job.company}</span>
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border bg-blue-500/10 text-blue-500 border-blue-500/20">
                      {job.site}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-text-secondary text-sm mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location || "Remote"}</span>
                  </div>

                  <p className="text-text-secondary text-sm leading-relaxed mb-6 line-clamp-3">
                    {job.description ? job.description.replace(/(\*\*|__|\*|_)/g, '').substring(0, 150) + "..." : "No description available."}
                  </p>
                </div>

                <div className="p-5 bg-surface-hover border-t border-border mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Calendar className="w-4 h-4" />
                    {job.date_posted || "Recently"}
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
                    View Details <LinkIcon className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && hasFetched && jobs.length === 0 && (
          <div className="text-center p-12 border border-border border-dashed rounded-3xl text-text-secondary">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No matching jobs found. Try updating your resume or broadening your custom search preferences.</p>
          </div>
        )}
      </div>
    </div>
  );
}
