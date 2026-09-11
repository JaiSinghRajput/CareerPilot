import { eq, desc, lt, ilike, and } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { usersTable, resumesTable, jobRecommendationsTable, jobsTable, jobSearchesTable } from '../../../db/schema.js';

export class JobsService {
  public static async suggestJobTitles(query: string) {
    if (!query || query.length < 2) return [];
    
    const results = await db.select({ title: jobsTable.title })
      .from(jobsTable)
      .where(ilike(jobsTable.title, `%${query}%`))
      .groupBy(jobsTable.title)
      .limit(8);

    return results.map(r => r.title).filter(Boolean);
  }

  public static async autoLoadMatchingJobs(clerkId: string, overrideSearchTerms?: string[], overrideLocation?: string, offset: number = 0, overrideIsRemote?: boolean) {
    // 0. Automatic cleanup: delete jobs older than 24 hours (cascades to related tables)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await db.delete(jobsTable).where(lt(jobsTable.createdAt, twentyFourHoursAgo));

    const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
    if (!userRows.length) {
      throw new Error('User not found in database');
    }
    const dbUserId = userRows[0]!.id;
    const existingPrefs = userRows[0]!.jobPreferences as { searchTerms?: string[], searchTerm?: string, location?: string, isRemote?: boolean } | null;

    const isManualOverride = (overrideSearchTerms !== undefined && overrideSearchTerms.length > 0) || overrideLocation !== undefined || overrideIsRemote !== undefined;

    // Default search parameters
    let searchTerms = ["Software Engineer"];
    let location = "Remote";
    let isRemote = true;

    // 1. Determine Search Term, Location, and Remote preference
    if (isManualOverride) {
      searchTerms = overrideSearchTerms?.length ? overrideSearchTerms : (existingPrefs?.searchTerms || (existingPrefs?.searchTerm ? [existingPrefs.searchTerm] : searchTerms));
      location = overrideLocation || existingPrefs?.location || location;
      isRemote = overrideIsRemote !== undefined ? overrideIsRemote : (existingPrefs?.isRemote ?? isRemote);

      // Save preferences
      await db.update(usersTable).set({
        jobPreferences: {
          searchTerms,
          location,
          isRemote
        }
      }).where(eq(usersTable.id, dbUserId));
    } else if (existingPrefs) {
      searchTerms = existingPrefs.searchTerms || (existingPrefs.searchTerm ? [existingPrefs.searchTerm] : searchTerms);
      location = existingPrefs.location || location;
      isRemote = existingPrefs.isRemote ?? isRemote;
    }

    let countryIndeed = "India"; // default must be capitalized

    const validCountriesMap: Record<string, string> = {
      "usa": "USA",
      "united states": "USA",
      "uk": "UK",
      "united kingdom": "UK",
      "canada": "Canada",
      "india": "India",
      "australia": "Australia",
      "new zealand": "New Zealand",
      "south africa": "South Africa",
      "singapore": "Singapore",
      "malaysia": "Malaysia",
      "philippines": "Philippines",
      "ireland": "Ireland",
      "germany": "Germany",
      "france": "France",
      "spain": "Spain",
      "italy": "Italy",
      "mexico": "Mexico",
      "brazil": "Brazil",
      "argentina": "Argentina",
      "colombia": "Colombia",
      "chile": "Chile",
      "peru": "Peru",
      "uae": "United Arab Emirates",
      "united arab emirates": "United Arab Emirates",
      "saudi arabia": "Saudi Arabia",
      "qatar": "Qatar",
      "kuwait": "Kuwait",
      "oman": "Oman",
      "bahrain": "Bahrain"
    };

    const extractValidCountry = (locString: string) => {
      const parts = locString.split(',').map(p => p.trim().toLowerCase());
      const lastPart = parts[parts.length - 1];
      if (lastPart && validCountriesMap[lastPart]) {
        return validCountriesMap[lastPart];
      }
      return null;
    };

    if (!isManualOverride && !existingPrefs) {
      // Fallback to resume only if no preferences are saved and no manual override is provided
      const resumes = await db.select().from(resumesTable).where(eq(resumesTable.userId, dbUserId)).orderBy(desc(resumesTable.createdAt));
      if (resumes.length > 0 && resumes[0]?.parsedData) {
          const pd = resumes[0].parsedData as any;
          if (pd.profession) {
            searchTerms = [pd.profession];
          } else if (pd?.compatibleJobRoles && pd.compatibleJobRoles.length > 0) {
              searchTerms = [pd.compatibleJobRoles[0]];
          } else if (pd?.experience && pd.experience.length > 0) {
              searchTerms = [pd.experience[0].role];
          }
          
          if (pd?.location && pd.location !== "Unknown") {
              let parsedLocation = pd.location;
              // Handle both legacy flat string and new structured JSON object
              if (typeof parsedLocation === "object") {
                  const parts = [];
                  if (parsedLocation.district && parsedLocation.district !== "null") parts.push(parsedLocation.district);
                  if (parsedLocation.state && parsedLocation.state !== "null") parts.push(parsedLocation.state);
                  if (parsedLocation.country && parsedLocation.country !== "null") {
                      parts.push(parsedLocation.country);
                      const valid = extractValidCountry(parsedLocation.country);
                      if (valid) countryIndeed = valid;
                  }
                  location = parts.join(", ") || "Remote";
              } else if (typeof parsedLocation === "string") {
                  const locationParts = parsedLocation.split(',').map((part: string) => part.trim());
                  if (locationParts.length > 2) {
                      parsedLocation = locationParts.slice(-3).join(', ');
                  }
                  location = parsedLocation;
                  
                  const valid = extractValidCountry(parsedLocation);
                  if (valid) countryIndeed = valid;
              }
          }
      }
    } else {
        const valid = extractValidCountry(location);
        if (valid) countryIndeed = valid;
    }

    // Determine final isRemote if not explicitly set but location says "remote"
    if (location.toLowerCase().includes('remote') && overrideIsRemote === undefined && existingPrefs?.isRemote === undefined) {
      isRemote = true;
    }

    // Determine the location to pass to JobSpy. If it's remote, sometimes passing "Remote" is fine, or empty. We'll pass what we have.
    let searchLocation = location;
    if (isRemote && searchLocation.toLowerCase() === 'remote') {
       // if it's strictly "remote", we keep it or can let country indeed handle it.
       // JobSpy typically handles 'Remote' in location well when is_remote=true
    }

    const canonicalSearchTerm = searchTerms.map(t => t.trim()).sort().join(" OR ");

    // 2. Check Shared Cache (only if fetching page 0, for pagination we might want to check if we have enough jobs, but for now cache page 0)
    if (offset === 0) {
        const existingSharedCache = await db.select({
          search: jobSearchesTable,
          job: jobsTable
        })
        .from(jobSearchesTable)
        .innerJoin(jobsTable, eq(jobSearchesTable.jobId, jobsTable.id))
        .where(eq(jobSearchesTable.searchTerm, canonicalSearchTerm)); // Filter by search term. In real app, filter by location too, but let's keep it simple or use both.

        const filteredCache = existingSharedCache.filter(r => r.search.location === location);

        if (filteredCache.length > 0) {
            const firstRec = filteredCache[0]!.search;
            const ageInMs = new Date().getTime() - firstRec.createdAt.getTime();
            if (ageInMs < 24 * 60 * 60 * 1000) {
                const mappedJobs = filteredCache.map(r => ({
                    id: r.job.id,
                    title: r.job.title,
                    company: r.job.company,
                    location: r.job.location,
                    job_url: r.job.jobUrl,
                    description: r.job.description,
                    date_posted: r.job.datePosted,
                    site: r.job.site,
                    company_logo: r.job.companyLogo
                }));
                // We should also link this cache hit to the current user's jobRecommendationsTable
                // but for infinite scroll and shared view, we don't strictly need to.
                return { jobs: mappedJobs };
            }
        }
    }

    let sites = ["indeed", "linkedin", "zip_recruiter", "glassdoor", "google", "bayt", "naukri"];
    let allScrapedJobs: any[] = [];

    const scrapeAndSave = async (scrapeLoc: string, offsetToUse: number) => {
        const payload = {
          site_name: sites,
          search_term: canonicalSearchTerm,
          location: scrapeLoc,
          results_wanted: 20,
          offset: offsetToUse,
          description_format: "markdown",
          linkedin_fetch_description: true,
          is_remote: isRemote,
          country_indeed: countryIndeed
        };
    

        const response = await fetch(process.env.JOB_SPY_API_URL as string, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'x-api-key': process.env.JOB_SPY_API_KEY as string,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
    
        if (!response.ok) {
          throw new Error(`Job Spy API failed with status ${response.status}`);
        }
    
        const data = await response.json();
        if (data && data.jobs && Array.isArray(data.jobs)) {
            for (const job of data.jobs) {
                await db.insert(jobsTable).values({
                    id: job.id,
                    title: job.title || "Unknown Title",
                    company: job.company || "Unknown Company",
                    location: job.location || "Unknown Location",
                    jobUrl: job.job_url || "",
                    description: job.description || "",
                    datePosted: job.date_posted || "",
                    site: job.site || "",
                    companyLogo: job.company_logo || ""
                }).onConflictDoNothing();
                
                // Cache under the original requested location so infinite scroll naturally pulls it
                await db.insert(jobSearchesTable).values({
                    jobId: job.id,
                    searchTerm: canonicalSearchTerm,
                    location: location
                }).onConflictDoNothing();
            }
            allScrapedJobs = allScrapedJobs.concat(data.jobs);
        }
    };

    try {
      if (offset === 0) {
          await db.delete(jobRecommendationsTable).where(eq(jobRecommendationsTable.userId, dbUserId));
          await db.delete(jobSearchesTable).where(
              and(
                  eq(jobSearchesTable.searchTerm, canonicalSearchTerm),
                  eq(jobSearchesTable.location, location)
              )
          );
      }

      await scrapeAndSave(searchLocation, offset);

      // Location Broadening: If strict search returns < 15 results, drop the most specific part and scrape broader.
      if (allScrapedJobs.length < 15 && searchLocation.includes(',')) {
          const parts = searchLocation.split(',').map(s => s.trim());
          if (parts.length > 1) {
              parts.shift(); // Remove the city/most specific element
              const broaderLocation = parts.join(', ');

              await scrapeAndSave(broaderLocation, 0); // Scrape the broader area from page 0
          }
      }

      for (const job of allScrapedJobs) {
          await db.insert(jobRecommendationsTable).values({
              userId: dbUserId,
              jobId: job.id
          }).onConflictDoNothing();
      }

      return { jobs: allScrapedJobs };
    } catch (error) {
      console.error("Error fetching jobs from Job Spy API:", error);
      throw new Error("Failed to fetch jobs");
    }
  }

  public static async getJobById(clerkId: string, jobId: string) {
    const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
    if (!userRows.length) {
      throw new Error('User not found in database');
    }

    const jobRows = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId)).limit(1);
    if (!jobRows.length) {
      throw new Error('Job not found in database');
    }
    const dbJob = jobRows[0]!;

    return {
       id: dbJob.id,
       title: dbJob.title,
       company: dbJob.company,
       location: dbJob.location,
       job_url: dbJob.jobUrl,
       description: dbJob.description,
       date_posted: dbJob.datePosted,
       site: dbJob.site,
       company_logo: dbJob.companyLogo
    };
  }
}

