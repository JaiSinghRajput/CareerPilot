ALTER TABLE "chats" ADD COLUMN "chat_state" varchar(50) DEFAULT 'READY_FOR_CHAT' NOT NULL;--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "skipped_fields" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "job_preferences" jsonb;