import { AIService } from '../../app/modules/ai/ai.service.js';
export const recommendProjectsTool = {
    name: 'recommendProjects',
    description: 'Recommends projects to the user based on their skills and resume. Requires the clerkId from the system context.',
    execute: async (input) => {
        try {
            if (!input.clerkId) {
                return JSON.stringify({ error: 'clerkId is required to generate personalized project recommendations.' });
            }
            const projects = await AIService.recommendProjects(input.clerkId);
            return JSON.stringify({
                success: true,
                message: 'Background recommendation generation started successfully. You MUST output exactly: "Here are some projects that you can build: \\n\\n[PROJECT_RECOMMENDATIONS]" in your message to render the UI component.'
            });
        }
        catch (e) {
            return JSON.stringify({ error: `Failed to fetch project recommendations: ${e.message}` });
        }
    }
};
export const recommendProjectsSchema = {
    type: 'object',
    properties: {
        clerkId: {
            type: 'string',
            description: 'The clerk ID of the user, provided in the system context.',
        }
    },
    required: ['clerkId']
};
//# sourceMappingURL=projectTool.js.map