import express, { type Request, type Response, type Router } from "express";
import { getAuth } from "@clerk/express";
import { builderService } from "./builder.service.js";
import { z } from "zod";

const router: Router = express.Router();

const generateSchema = z.object({
  linkedInUrl: z.string().url().optional().or(z.literal("")),
  githubUsername: z.string().optional().or(z.literal("")),
});

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { db } = await import("../../../db/index.js");
    const { usersTable } = await import("../../../db/schema.js");
    const { eq } = await import("drizzle-orm");

    const userRows = await db.select().from(usersTable).where(eq(usersTable.clerkId, auth.userId)).limit(1);
    const user = userRows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { linkedInUrl, githubUsername } = generateSchema.parse(req.body);

    if (!linkedInUrl && !githubUsername) {
      return res.status(400).json({ success: false, message: "Please provide either a LinkedIn URL or a GitHub Username" });
    }

    const resume = await builderService.generateResume(user.id, linkedInUrl || "", githubUsername || "");

    res.status(200).json({
      success: true,
      message: "Resume generated successfully",
      data: resume
    });
  } catch (error: any) {
    console.error("Generate Resume Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while generating the resume"
    });
  }
});

export default router;
