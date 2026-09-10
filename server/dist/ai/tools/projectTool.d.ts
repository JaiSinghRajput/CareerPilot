import type { Tool, JsonObject } from 'agenix';
interface RecommendProjectsInput extends JsonObject {
    clerkId: string;
}
export declare const recommendProjectsTool: Tool<RecommendProjectsInput, string>;
export declare const recommendProjectsSchema: {
    type: string;
    properties: {
        clerkId: {
            type: string;
            description: string;
        };
    };
    required: string[];
};
export {};
//# sourceMappingURL=projectTool.d.ts.map