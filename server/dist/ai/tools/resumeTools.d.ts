import type { Tool, JsonObject } from 'agenix';
interface AnalyzeResumeInput extends JsonObject {
    parsedData: string;
}
export declare const analyzeResumeTool: Tool<AnalyzeResumeInput, string>;
export declare const analyzeResumeSchema: {
    type: string;
    properties: {
        parsedData: {
            type: string;
            description: string;
        };
    };
    required: string[];
};
interface UpdateResumeInput extends JsonObject {
    clerkId: string;
    updatedResumeData: string;
}
export declare const updateResumeTool: Tool<UpdateResumeInput, string>;
export declare const updateResumeSchema: {
    type: string;
    properties: {
        clerkId: {
            type: string;
            description: string;
        };
        updatedResumeData: {
            type: string;
            description: string;
        };
    };
    required: string[];
};
interface UpdateChatStateInput extends JsonObject {
    chatId: number;
    newState: string;
}
export declare const updateChatStateTool: Tool<UpdateChatStateInput, string>;
export declare const updateChatStateSchema: {
    type: string;
    properties: {
        chatId: {
            type: string;
            description: string;
        };
        newState: {
            type: string;
            description: string;
        };
    };
    required: string[];
};
export {};
//# sourceMappingURL=resumeTools.d.ts.map