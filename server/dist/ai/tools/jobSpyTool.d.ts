import type { Tool, JsonObject } from 'agenix';
interface SearchJobsInput extends JsonObject {
    clerkId: string;
    searchTerm?: string;
    location?: string;
    isRemote?: boolean;
}
export declare const searchJobsTool: Tool<SearchJobsInput, string>;
export declare const searchJobsSchema: {
    type: string;
    properties: {
        clerkId: {
            type: string;
            description: string;
        };
        searchTerm: {
            type: string;
            description: string;
        };
        location: {
            type: string;
            description: string;
        };
        isRemote: {
            type: string;
            description: string;
        };
    };
    required: string[];
};
export {};
//# sourceMappingURL=jobSpyTool.d.ts.map