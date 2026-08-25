export const analyzeResumeTool = {
    name: 'analyzeResume',
    description: 'Analyzes a parsed resume (JSON string) against an optional job description to provide ATS score and keyword feedback.',
    execute: async (input) => {
        try {
            const resume = JSON.parse(input.parsedData);
            // Basic rule-based ATS evaluation
            let score = 50; // Base score
            const feedback = [];
            const foundSkills = resume.skills || [];
            if (foundSkills.length > 5) {
                score += 20;
                feedback.push("Good amount of skills listed.");
            }
            else {
                feedback.push("Add more technical or soft skills to improve visibility.");
            }
            if (resume.experience && resume.experience.length > 0) {
                score += 20;
                feedback.push("Experience section is populated.");
            }
            else {
                feedback.push("Experience section is missing or empty.");
                score -= 10;
            }
            if (resume.summary && resume.summary.length > 50) {
                score += 10;
            }
            else {
                feedback.push("Consider adding a more detailed professional summary.");
            }
            // Clamp score
            score = Math.max(0, Math.min(100, score));
            return JSON.stringify({
                atsScore: score,
                status: score > 75 ? 'Excellent' : score > 50 ? 'Good' : 'Needs Work',
                feedback: feedback,
            });
        }
        catch (e) {
            return JSON.stringify({ error: 'Failed to parse or analyze resume data. Please ensure it is valid JSON.' });
        }
    }
};
export const analyzeResumeSchema = {
    type: 'object',
    properties: {
        parsedData: {
            type: 'string',
            description: 'The JSON string of the parsed resume to analyze',
        }
    },
    required: ['parsedData'],
};
//# sourceMappingURL=resumeTools.js.map