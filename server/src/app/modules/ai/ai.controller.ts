import type { Request, Response } from 'express';
import { AIService } from './ai.service.js';

export class AIController {
  public static async chat(req: Request, res: Response): Promise<void> {
    try {
      const { prompt, chatId } = req.body;
      
      if (!prompt) {
        res.status(400).json({ success: false, message: 'Prompt is required' });
        return;
      }
  
      const clerkId = (req as any).auth?.userId;
      if (!clerkId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
  
      const result = await AIService.processChat(prompt, clerkId, chatId);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to process AI request' });
    }
  }

  public static async uploadResume(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
         res.status(400).json({ success: false, message: 'No file uploaded' });
         return;
      }
  
      const clerkId = (req as any).auth?.userId;
      if (!clerkId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      // Pass the file buffer to the service for PDF parsing
      const result = await AIService.processResumeUpload(req.file.buffer, req.file.originalname, clerkId);
  
      res.status(200).json({
        success: true,
        message: 'Resume uploaded and parsed successfully',
        data: result
      });
  
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to upload resume' });
    }
  }

  public static async analyzeResume(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const resumeId = parseInt((id as string) || '', 10);
      
      if (isNaN(resumeId)) {
        res.status(400).json({ success: false, message: 'Invalid resume ID' });
        return;
      }
  
      const clerkId = (req as any).auth?.userId;
      if (!clerkId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await AIService.analyzeResume(resumeId, clerkId);
  
      res.status(200).json({
        success: true,
        message: 'Resume analyzed successfully',
        data: result
      });
  
    } catch (error: any) {
      console.error('Analyze error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to analyze resume' });
    }
  }
}
