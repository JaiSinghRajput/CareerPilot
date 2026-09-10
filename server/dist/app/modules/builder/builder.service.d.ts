export declare class BuilderService {
    /**
     * Scrapes LinkedIn and fetches GitHub data, then uses AI to build a structured JSON resume.
     */
    generateResume(userId: number, linkedInUrl: string, githubUsername: string): Promise<{
        atsScore: number | null;
        createdAt: Date;
        feedback: unknown;
        id: number;
        isBuilt: boolean;
        originalFileName: string | null;
        parsedData: unknown;
        skippedFields: unknown;
        storageUrl: string | null;
        summary: string | null;
        updatedAt: Date;
        userId: number;
    } | undefined>;
    private fetchLinkedInData;
    private fetchGitHubData;
}
export declare const builderService: BuilderService;
//# sourceMappingURL=builder.service.d.ts.map