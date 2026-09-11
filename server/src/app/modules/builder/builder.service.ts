import { db } from "../../../db/index.js";
import { resumesTable } from "../../../db/schema.js";
import { runAIGateway } from "../../../ai/index.js";
import type { Message } from "agenix";

export class BuilderService {
  /**
   * Scrapes LinkedIn and fetches GitHub data, then uses AI to build a structured JSON resume.
   */
  public async generateResume(userId: number, linkedInUrl: string, githubUsername: string) {

    
    // 1. Fetch Data from LinkedIn and GitHub concurrently (if both are provided)
    const [linkedInData, githubData] = await Promise.all([
      linkedInUrl ? this.fetchLinkedInData(linkedInUrl) : Promise.resolve(null),
      githubUsername ? this.fetchGitHubData(githubUsername) : Promise.resolve(null)
    ]);

    if (!linkedInData && !githubData) {
      throw new Error("Failed to retrieve LinkedIn/GitHub profile data. Please try again or contact support.");
    }

    // 2. Format the raw data for the AI
    const rawData = {
      source: "LinkedIn + GitHub",
      linkedInProfile: linkedInData || null,
      githubProfile: githubData?.profile || null,
      githubRepos: githubData?.repos || null
    };



    // 3. AI Extraction
    const extractionPrompt = `You are an expert resume builder AI. Given the following raw data extracted from a user's LinkedIn profile and GitHub account, construct a fully formatted, highly professional Resume JSON.
    
Return ONLY valid JSON matching this structure exactly (no markdown formatting, no code blocks).
Ensure you map the experience, education, skills, and projects properly. Infer 'compatibleJobRoles' based on the profile. For experience 'bulletPoints', extract detailed achievements from the LinkedIn descriptions. For 'projects', use the GitHub repos.

{
  "name": "Full Name",
  "email": "Email if available",
  "location": "City, Country",
  "skills": ["skill1", "skill2"],
  "compatibleJobRoles": ["Role 1", "Role 2"],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Dates (e.g. Jan 2020 - Present)",
      "bulletPoints": ["Achievement 1", "Responsibility 2"]
    }
  ],
  "education": [
    {
      "institution": "School Name",
      "degree": "Degree/Class"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Project Description",
      "technologies": ["Tech 1", "Tech 2"],
      "link": "Project URL"
    }
  ]
}

Raw Data:
${JSON.stringify(rawData, null, 2).substring(0, 8000)} // Limiting to prevent token explosion
`;

    const extractionMessages: Message[] = [
      { role: 'system', content: [{ type: 'text', text: 'You only output pure JSON without any surrounding text or markdown blocks.' }] },
      { role: 'user', content: [{ type: 'text', text: extractionPrompt }] }
    ];

    const result = await runAIGateway(extractionMessages);
    let parsedData;
    let aiText = '';
    if (result.response?.message) {
       const msg = result.response.message as any;
       if (msg.content) {
         const textContent = (msg.content as any[]).find(c => c.type === 'text');
         aiText = textContent ? textContent.text : '{}';
       }
    }

    try {
      const jsonStr = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI output:", aiText);
      throw new Error("Failed to generate a structured resume from the provided profiles.");
    }

    // 4. Generate AI Summary and ATS Score based on the newly formed resume
    const analysisPrompt = `Analyze the following structured resume data.
Evaluate the candidate's skills, experience, projects and overall profile.
Provide a professional summary, an ATS score out of 100, and a highly detailed, personalized feedback array.
Return ONLY valid JSON matching this structure exactly (no markdown formatting):
{
  "atsScore": 85,
  "summary": "A concise professional summary...",
  "feedback": [
    {
      "title": "Actionable Title",
      "description": "Detailed explanation..."
    }
  ]
}

Resume Data:
${JSON.stringify(parsedData)}
`;

    const analysisMessages: Message[] = [
      { role: 'system', content: [{ type: 'text', text: 'You only output pure JSON without any surrounding text or markdown blocks.' }] },
      { role: 'user', content: [{ type: 'text', text: analysisPrompt }] }
    ];

    const analysisResult = await runAIGateway(analysisMessages);
    let analysisData = { atsScore: 0, summary: "", feedback: [] };
    let aiAnalysisText = '';
    
    if (analysisResult.response?.message) {
       const msg = analysisResult.response.message as any;
       if (msg.content) {
         const textContent = (msg.content as any[]).find(c => c.type === 'text');
         aiAnalysisText = textContent ? textContent.text : '{}';
       }
    }

    try {
      const jsonStr = aiAnalysisText.replace(/```json/g, '').replace(/```/g, '').trim();
      analysisData = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI analysis output:", aiAnalysisText);
    }

    // 5. Save to database
    const [insertedResume] = await db.insert(resumesTable).values({
      userId,
      originalFileName: `${parsedData.name || 'Built'}_Resume.json`,
      parsedData,
      atsScore: analysisData.atsScore,
      summary: analysisData.summary,
      feedback: analysisData.feedback,
      isBuilt: true, // Flag it as built from profiles
    }).returning();

    return insertedResume;
  }

  private async fetchLinkedInData(linkedInUrl: string) {
    const apifyToken = process.env.APIFY_API_TOKEN;
    if (!apifyToken) {
      console.warn("APIFY_API_TOKEN is missing. Skipping LinkedIn extraction.");
      return null;
    }


    try {
      // Start the run and wait up to 120 seconds
      const runRes = await fetch(`https://api.apify.com/v2/acts/LpVuK3Zozwuipa5bp/runs?token=${apifyToken}&waitForFinish=120`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileScraperMode: "Profile details no email ($4 per 1k)",
          queries: [linkedInUrl]
        })
      });

      if (!runRes.ok) {
        throw new Error(`Apify Run failed with status ${runRes.status}`);
      }

      const runData = await runRes.json();
      const datasetId = runData.data.defaultDatasetId;

      if (!datasetId) {
         throw new Error("No dataset ID returned from Apify");
      }

      // Fetch the dataset items
      const datasetRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items`);
      const items = await datasetRes.json();

      if (items && items.length > 0) {
        return items[0]; // Return the first profile data
      }
      return null;

    } catch (error) {
      console.error("Error fetching LinkedIn data via Apify:", error);
      return null; // Return null so it doesn't fail the whole process
    }
  }

  private async fetchGitHubData(username: string) {
    try {
      // Clean username if a URL was provided
      let cleanUsername = username.trim();
      if (cleanUsername.includes('github.com/')) {
          cleanUsername = cleanUsername.split('github.com/')[1]?.split('/')[0] || cleanUsername;
      }

      const headers: Record<string, string> = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "CareerPilot-App"
      };

      if (process.env.GITHUB_TOKEN) {
        headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
      }

      const profileRes = await fetch(`https://api.github.com/users/${cleanUsername}`, { headers });
      if (!profileRes.ok) {
        console.error(`GitHub API returned ${profileRes.status} for user ${cleanUsername}`);
        return null;
      }
      const profile = await profileRes.json();

      const reposRes = await fetch(`https://api.github.com/users/${cleanUsername}/repos?sort=updated&per_page=5`, { headers });
      const repos = reposRes.ok ? await reposRes.json() : [];

      // Simplify repo data to avoid massive JSON size
      const simplifiedRepos = repos.map((r: any) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        url: r.html_url,
        stars: r.stargazers_count
      }));

      return { profile, repos: simplifiedRepos };

    } catch (error) {
      console.error("Error fetching GitHub data:", error);
      return null;
    }
  }
}

export const builderService = new BuilderService();
