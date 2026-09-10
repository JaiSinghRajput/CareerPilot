export declare class JobsService {
    static suggestJobTitles(query: string): Promise<(string | null)[]>;
    static autoLoadMatchingJobs(clerkId: string, overrideSearchTerms?: string[], overrideLocation?: string, offset?: number, overrideIsRemote?: boolean): Promise<{
        jobs: any[];
    }>;
    static getJobById(clerkId: string, jobId: string): Promise<{
        id: string;
        title: string | null;
        company: string | null;
        location: string | null;
        job_url: string | null;
        description: string | null;
        date_posted: string | null;
        site: string | null;
        company_logo: string | null;
    }>;
}
//# sourceMappingURL=jobs.service.d.ts.map