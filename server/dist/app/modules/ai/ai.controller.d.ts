import type { Request, Response } from 'express';
export declare class AIController {
    static chat(req: Request, res: Response): Promise<void>;
    static uploadResume(req: Request, res: Response): Promise<void>;
    static analyzeResume(req: Request, res: Response): Promise<void>;
    static getResumes(req: Request, res: Response): Promise<void>;
    static getResumeById(req: Request, res: Response): Promise<void>;
    static deleteResume(req: Request, res: Response): Promise<void>;
    static getRecommendations(req: Request, res: Response): Promise<void>;
    static recommendProjects(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=ai.controller.d.ts.map