"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Search Preferences State
  const [showPreferences, setShowPreferences] = useState(false);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [location, setLocation] = useState("");
  const [isRemote, setIsRemote] = useState(false);

  // Job Title Autocomplete State
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [fetchingTitles, setFetchingTitles] = useState(false);
  const titleDropdownRef = useRef<HTMLDivElement>(null);

  // City Autocomplete State
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [fetchingCities, setFetchingCities] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
      if (titleDropdownRef.current && !titleDropdownRef.current.contains(event.target as Node)) {
        setShowTitleDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTitles = async (query: string) => {
    if (query.length < 2) {
      setTitleSuggestions([]);
      return;
    }
    setFetchingTitles(true);
    try {
      const token = await getToken();
      const res = await apiRequest(`/api/v1/jobs/titles/suggest?q=${encodeURIComponent(query)}`, token || "");
      if (res.success && res.data) {
        setTitleSuggestions(res.data);
      }
    } catch (e) {
      console.error("Failed to fetch job titles", e);
    } finally {
      setFetchingTitles(false);
    }
  };

  const fetchCities = async (query: string) => {
    if (query.length < 3) {
      setCitySuggestions([]);
      return;
    }
    setFetchingCities(true);
    try {
      // Using Nominatim API for broader location search (cities, states, countries, counties)
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setCitySuggestions(data || []);
      }
    } catch (e) {
      console.error("Failed to fetch cities", e);
    } finally {
      setFetchingCities(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showCityDropdown) {
        fetchCities(location);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [location, showCityDropdown]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showTitleDropdown && searchInputValue) {
        fetchTitles(searchInputValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInputValue, showTitleDropdown]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastJobElementRef = useCallback((node: HTMLAnchorElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchJobs(false, true);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const fetchJobs = async (customSearch = false, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setOffset(0);
        setHasMore(true);
      }

      const token = await getToken();
      if (!token) {
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      const currentOffset = isLoadMore ? offset + 20 : 0;
      let url = `/api/v1/jobs?offset=${currentOffset}`;

      if (customSearch) {
        if (searchTerms.length > 0) {
          searchTerms.forEach(t => url += `&searchTerms=${encodeURIComponent(t)}`);
        }
        if (location) url += `&location=${encodeURIComponent(location)}`;
        url += `&isRemote=${isRemote}`;
      }

      const result = await apiRequest(url, token);

      if (result.success && result.data && result.data.jobs) {
        const newJobs = result.data.jobs;
        // deduplicate newJobs itself to prevent any immediate duplicate keys
        const uniqueIds = new Set();
        const deduplicatedNewJobs = newJobs.filter((j: Job) => {
          if (uniqueIds.has(j.id)) return false;
          uniqueIds.add(j.id);
          return true;
        });

        if (isLoadMore) {
          setJobs(prev => {
            const existingIds = new Set(prev.map(j => j.id));
            const uniqueAppend = deduplicatedNewJobs.filter((j: Job) => !existingIds.has(j.id));
            return [...prev, ...uniqueAppend];
          });
          setOffset(currentOffset);
        } else {
          setJobs(deduplicatedNewJobs);
          setOffset(0);
        }

        if (newJobs.length < 20) {
          setHasMore(false);
        }

        setHasFetched(true);
        if (customSearch) setShowPreferences(false);
      } else {
        toast.error("Failed to load jobs.");
      }
      setLoading(false);
      setLoadingMore(false);
    } catch (error: any) {
      console.error("Failed to fetch jobs", error);
      setLoading(false);
      setLoadingMore(false);
      toast.error(error.message || "Failed to fetch matching jobs.");
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && !hasFetched) {
      fetchJobs();
    }
  }, [isLoaded, isSignedIn]);

  // Fetch location from GeoAPI on mount
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await fetch("https://geoapi.info/api/geo");
        if (response.ok) {
          const data = await response.json();
          // GeoAPI returns { city, country, etc... }
          // We only pre-fill if the location field is currently empty
          setLocation((prev) => {
            if (!prev && data.city && data.country) {
              return `${data.city}, ${data.country}`;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Failed to fetch location from GeoAPI", error);
      }
    };
    
    fetchLocation();
  }, []);

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
              <div className="relative" ref={titleDropdownRef}>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Target Job Title</label>
                <input
                  type="text"
                  placeholder={searchTerms.length === 0 ? "e.g. Full Stack Developer" : "Add another role..."}
                  className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-hidden focus:border-primary/50 transition-colors"
                  value={searchInputValue}
                  onChange={(e) => {
                    setSearchInputValue(e.target.value);
                    setShowTitleDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchInputValue.trim() !== '') {
                      e.preventDefault();
                      if (!searchTerms.includes(searchInputValue.trim())) {
                        setSearchTerms(prev => [...prev, searchInputValue.trim()]);
                      }
                      setSearchInputValue("");
                      setShowTitleDropdown(false);
                    }
                  }}
                  onFocus={() => {
                    if (searchInputValue.length >= 2) setShowTitleDropdown(true);
                  }}
                />
                
                {searchTerms.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {searchTerms.map((term, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                        {term}
                        <button onClick={() => setSearchTerms(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-primary-focus ml-1 p-0.5 rounded-full hover:bg-primary/20 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Title Autocomplete Dropdown */}
                {showTitleDropdown && (searchInputValue.length >= 2) && (
                  <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden">
                    {fetchingTitles ? (
                      <div className="p-4 text-center text-sm text-text-secondary animate-pulse">Searching titles...</div>
                    ) : titleSuggestions.length > 0 ? (
                      <ul className="py-2">
                        {titleSuggestions.map((title: string, idx: number) => (
                          <li 
                            key={idx}
                            className="px-4 py-2.5 hover:bg-surface-hover cursor-pointer transition-colors text-sm border-b border-border/50 last:border-0"
                            onClick={() => {
                              if (!searchTerms.includes(title)) {
                                setSearchTerms(prev => [...prev, title]);
                              }
                              setSearchInputValue("");
                              setShowTitleDropdown(false);
                            }}
                          >
                            <div className="font-semibold text-text-primary capitalize">{title}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-sm text-text-secondary">No titles found</div>
                    )}
                  </div>
                )}
              </div>
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-semibold text-text-secondary mb-2">Preferred Location</label>
                <input
                  type="text"
                  placeholder="e.g. Alwar, Rajasthan, India"
                  className="w-full px-4 py-3 rounded-xl border bg-background focus:outline-hidden focus:border-primary/50 transition-colors"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setShowCityDropdown(true);
                  }}
                  onFocus={() => {
                    if (location.length >= 3) setShowCityDropdown(true);
                  }}
                />
                
                {/* Autocomplete Dropdown */}
                {showCityDropdown && (location.length >= 3) && (
                  <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden">
                    {fetchingCities ? (
                      <div className="p-4 text-center text-sm text-text-secondary animate-pulse">Searching locations...</div>
                    ) : citySuggestions.length > 0 ? (
                      <ul className="py-2">
                        {citySuggestions.map((place: any, idx: number) => {
                          let formattedName = place.display_name;
                          if (place.address) {
                            const parts = [];
                            if (place.address.city || place.address.town || place.address.village) {
                              parts.push(place.address.city || place.address.town || place.address.village);
                            } else if (place.name) {
                              parts.push(place.name);
                            }
                            if (place.address.state) parts.push(place.address.state);
                            if (place.address.country) parts.push(place.address.country);
                            formattedName = Array.from(new Set(parts)).filter(Boolean).join(", ");
                          }

                          return (
                          <li 
                            key={place.place_id || idx}
                            className="px-4 py-2.5 hover:bg-surface-hover cursor-pointer transition-colors text-sm border-b border-border/50 last:border-0"
                            onClick={() => {
                              setLocation(formattedName);
                              setShowCityDropdown(false);
                            }}
                          >
                            <div className="font-semibold text-text-primary">
                               {place.name || formattedName.split(',')[0]}
                            </div>
                            <div className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                              {formattedName}
                            </div>
                          </li>
                        )})}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-sm text-text-secondary">No cities found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="mb-6 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                  checked={isRemote}
                  onChange={(e) => setIsRemote(e.target.checked)}
                />
                Remote Jobs Only
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setSearchTerms([]);
                  setSearchInputValue("");
                  setLocation("");
                  setIsRemote(false);
                }}
                className="px-5 py-2.5 rounded-xl border border-border hover:bg-surface-hover transition-colors font-medium text-sm"
              >
                Clear
              </button>
              <button
                onClick={() => fetchJobs(true, false)}
                disabled={loading || (searchTerms.length === 0 && !searchInputValue && !location && !isRemote)}
                className={`primary-button px-6 py-2.5 text-sm ${loading || (searchTerms.length === 0 && !searchInputValue && !location && !isRemote) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            {jobs.map((job, index) => {
              if (jobs.length === index + 1) {
                return (
                  <Link
                    ref={lastJobElementRef}
                    href={`/jobs/${job.id}`}
                    key={job.id}
                    className="group rounded-3xl border border-border bg-surface hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    <JobCardContent job={job} />
                  </Link>
                );
              } else {
                return (
                  <Link
                    href={`/jobs/${job.id}`}
                    key={job.id}
                    className="group rounded-3xl border border-border bg-surface hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    <JobCardContent job={job} />
                  </Link>
                );
              }
            })}
          </div>
        )}

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full shadow-sm text-text-secondary text-sm font-medium animate-pulse">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Loading more jobs...
            </div>
          </div>
        )}

        {/* End of results */}
        {!loading && !loadingMore && hasFetched && jobs.length > 0 && !hasMore && (
          <div className="text-center mt-12 text-text-secondary text-sm">
            You've reached the end of the matching jobs.
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

function JobCardContent({ job }: { job: Job }) {
  return (
    <>
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
    </>
  );
}
