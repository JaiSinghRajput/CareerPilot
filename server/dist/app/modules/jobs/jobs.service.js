import { eq, desc } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import { usersTable, resumesTable, jobRecommendationsTable } from '../../../db/schema.js';
export class JobsService {
    static async autoLoadMatchingJobs(clerkId, overrideSearchTerm, overrideLocation) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!userRows.length) {
            throw new Error('User not found in database');
        }
        const dbUserId = userRows[0].id;
        const isManualOverride = Boolean(overrideSearchTerm || overrideLocation);
        // Check Cache (only use cache if no manual override is provided)
        const existingCache = await db.select().from(jobRecommendationsTable).where(eq(jobRecommendationsTable.userId, dbUserId)).limit(1);
        // If cache exists, is less than 24 hours old, and we are NOT manually overriding, return it
        if (!isManualOverride && existingCache.length > 0) {
            const cache = existingCache[0];
            if (cache) {
                const ageInMs = new Date().getTime() - cache.updatedAt.getTime();
                if (ageInMs < 24 * 60 * 60 * 1000) {
                    return cache.jobs;
                }
            }
        }
        // Get latest resume for defaults
        const resumes = await db.select().from(resumesTable).where(eq(resumesTable.userId, dbUserId)).orderBy(desc(resumesTable.createdAt));
        let searchTerm = "Software Engineer";
        let location = "Remote";
        let sites = ["indeed", "linkedin", "zip_recruiter", "glassdoor", "google", "bayt", "naukri"];
        const validCountriesMap = {
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
        let countryIndeed = "India"; // default must be capitalized
        const extractValidCountry = (locString) => {
            const parts = locString.split(',').map(p => p.trim().toLowerCase());
            const lastPart = parts[parts.length - 1];
            if (lastPart && validCountriesMap[lastPart]) {
                return validCountriesMap[lastPart];
            }
            return null;
        };
        if (resumes.length > 0 && resumes[0]?.parsedData) {
            const pd = resumes[0].parsedData;
            if (pd?.compatibleJobRoles && pd.compatibleJobRoles.length > 0) {
                searchTerm = pd.compatibleJobRoles[0]; // Take top role
            }
            else if (pd?.experience && pd.experience.length > 0) {
                searchTerm = pd.experience[0].role || searchTerm;
            }
            if (pd?.location && pd.location !== "Unknown") {
                let parsedLocation = pd.location;
                // Handle both legacy flat string and new structured JSON object
                if (typeof parsedLocation === "object") {
                    const parts = [];
                    if (parsedLocation.district && parsedLocation.district !== "null")
                        parts.push(parsedLocation.district);
                    if (parsedLocation.state && parsedLocation.state !== "null")
                        parts.push(parsedLocation.state);
                    if (parsedLocation.country && parsedLocation.country !== "null") {
                        parts.push(parsedLocation.country);
                        const valid = extractValidCountry(parsedLocation.country);
                        if (valid)
                            countryIndeed = valid;
                    }
                    location = parts.join(", ") || "Remote";
                }
                else if (typeof parsedLocation === "string") {
                    const locationParts = parsedLocation.split(',').map((part) => part.trim());
                    if (locationParts.length > 2) {
                        parsedLocation = locationParts.slice(-3).join(', ');
                    }
                    location = parsedLocation;
                    const valid = extractValidCountry(parsedLocation);
                    if (valid)
                        countryIndeed = valid;
                }
            }
        }
        // Apply manual overrides if provided
        if (overrideSearchTerm) {
            searchTerm = overrideSearchTerm;
        }
        if (overrideLocation) {
            location = overrideLocation;
            const valid = extractValidCountry(location);
            if (valid)
                countryIndeed = valid;
        }
        const payload = {
            site_name: sites,
            search_term: searchTerm,
            location: location,
            results_wanted: 20,
            description_format: "markdown",
            linkedin_fetch_description: true,
            is_remote: location.toLowerCase().includes('remote') || true,
            country_indeed: countryIndeed
        };
        console.log("Fetching matching jobs with payload:", payload);
        try {
            const response = await fetch(process.env.JOB_SPY_API_URL, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'x-api-key': process.env.JOB_SPY_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`Job Spy API failed with status ${response.status}`);
            }
            const data = await response.json();
            // Save to cache
            if (existingCache.length > 0 && existingCache[0]) {
                await db.update(jobRecommendationsTable).set({ jobs: data, updatedAt: new Date() }).where(eq(jobRecommendationsTable.id, existingCache[0].id));
            }
            else {
                await db.insert(jobRecommendationsTable).values({ userId: dbUserId, jobs: data });
            }
            return data;
        }
        catch (error) {
            console.error("Error fetching jobs from Job Spy API:", error);
            throw new Error("Failed to fetch jobs");
        }
    }
    static async getJobById(clerkId, jobId) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);
        if (!userRows.length) {
            throw new Error('User not found in database');
        }
        const dbUserId = userRows[0].id;
        const existingCache = await db.select().from(jobRecommendationsTable).where(eq(jobRecommendationsTable.userId, dbUserId)).limit(1);
        if (!existingCache.length || !existingCache[0]) {
            throw new Error('No jobs cached for this user');
        }
        const cache = existingCache[0];
        const jobsData = cache.jobs;
        if (!jobsData || !jobsData.jobs || !Array.isArray(jobsData.jobs)) {
            throw new Error('Invalid jobs cache format');
        }
        const job = jobsData.jobs.find((j) => j.id === jobId);
        if (!job) {
            throw new Error('Job not found in cache');
        }
        return job;
    }
}
//# sourceMappingURL=jobs.service.js.map