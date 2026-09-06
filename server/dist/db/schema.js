import { integer, pgTable, varchar, timestamp, boolean, text, jsonb } from "drizzle-orm/pg-core";
export const usersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    phoneNumber: varchar("phone_number", { length: 255 }),
    profilePictureUrl: varchar("profile_picture_url", { length: 255 }),
    subscriptionTier: varchar("subscription_tier", { length: 255 }).notNull().default("FREE"),
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const resumesTable = pgTable("resumes", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    originalFileName: varchar("original_file_name", { length: 255 }),
    storageUrl: text("storage_url"),
    parsedData: jsonb("parsed_data"), // Stores the extracted JSON from the resume
    atsScore: integer("ats_score"),
    summary: text("summary"), // AI generated summary
    feedback: jsonb("feedback"), // AI generated feedback array
    isBuilt: boolean("is_built").notNull().default(false), // Flag for resumes built from LinkedIn/GitHub
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const chatsTable = pgTable("chats", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const messagesTable = pgTable("messages", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    chatId: integer("chat_id").notNull().references(() => chatsTable.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).notNull(), // 'user', 'assistant', 'system', 'tool'
    content: text("content"),
    toolCalls: jsonb("tool_calls"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const projectRecommendationsTable = pgTable("project_recommendations", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    recommendations: jsonb("recommendations"),
    isGenerating: boolean("is_generating").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const jobRecommendationsTable = pgTable("job_recommendations", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    jobs: jsonb("jobs"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
//# sourceMappingURL=schema.js.map