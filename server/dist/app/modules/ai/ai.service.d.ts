export declare class AIService {
    static processChat(prompt: string, clerkId: string, chatId?: number): Promise<{
        chatId: number;
        reply: string;
        fullResult: import("agenix").AgentLoopResult;
    }>;
    static processResumeUpload(fileBuffer: Buffer, originalFileName: string, clerkId: string): Promise<{
        resumeId: number;
        parsedData: {};
    }>;
    static analyzeResume(resumeId: number, clerkId: string): Promise<{
        atsScore: number;
        summary: string;
        feedback: string[];
    }>;
    static getResumes(clerkId: string): Promise<{
        id: number;
        userId: number;
        originalFileName: string | null;
        storageUrl: string | null;
        parsedData: unknown;
        atsScore: number | null;
        summary: string | null;
        feedback: unknown;
        isBuilt: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    static getResumeById(id: number, clerkId: string): Promise<{
        id: number;
        userId: number;
        originalFileName: string | null;
        storageUrl: string | null;
        parsedData: unknown;
        atsScore: number | null;
        summary: string | null;
        feedback: unknown;
        isBuilt: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
//# sourceMappingURL=ai.service.d.ts.map