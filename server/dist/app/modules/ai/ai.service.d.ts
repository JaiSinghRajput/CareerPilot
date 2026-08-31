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
}
//# sourceMappingURL=ai.service.d.ts.map