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
export {};
//# sourceMappingURL=resumeTools.d.ts.map