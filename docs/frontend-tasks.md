# CareerPilot AI — Phase 1 Frontend Developer Tasks

This document outlines the frontend tasks for **Phase 1 (MVP) - AI Resume Builder Core**. The backend is fully complete and ready to be integrated. 

All backend APIs are authenticated using Clerk JWTs. Ensure you are sending requests from authenticated Clerk sessions (e.g., using `@clerk/nextjs` auth hooks to fetch tokens or using Next.js Server Components with Clerk middleware).

---

## Backend Endpoints Available

The following routes are available under the `/api/v1` prefix on your Express server (e.g., `http://localhost:5000/api/v1`):

### 1. `POST /api/v1/ai/resume/upload`
Uploads a resume file, parses it, and creates a database record.

- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `resume`: The PDF or DOCX file.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Resume uploaded and parsed successfully",
    "data": {
      "resumeId": 123,
      "parsedData": { "name": "...", "skills": [...] }
    }
  }
  ```

### 2. `POST /api/v1/ai/chat`
Sends a prompt to the AI Gateway. Optionally accepts a `chatId` to continue a conversation thread. The backend automatically saves both the user prompt and the AI's response to the database.

- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "prompt": "Can you rewrite my summary to sound more professional?",
    "chatId": 123 // (Optional) Pass this if continuing an existing chat
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "chatId": 123,
      "reply": "Here is a more professional summary...",
      "fullResult": { ... } // Detailed LLM trace and tool calls if needed
    }
  }
  ```

### 3. `POST /api/v1/ai/resume/:id/analyze`
Triggers the AI to run a deep analysis on the parsed resume data stored in the database. Calculates an ATS score and generates professional feedback.

- **Content-Type**: `application/json`
- **Path Parameters**: 
  - `id`: The numeric ID of the resume returned from the upload route.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Resume analyzed successfully",
    "data": {
      "atsScore": 85,
      "summary": "A concise professional summary...",
      "feedback": ["Feedback point 1", "Feedback point 2"]
    }
  }
  ```

---

## Tasks for the Frontend Developer

### 1. Core Dashboard Layout (`web/app/(dashboard)`)
- [ ] Create `layout.tsx` to include the global sidebar navigation (Overview, Resume Builder, Job Explorer).
- [ ] Ensure Clerk's `<UserButton />` is integrated into the layout.
- [ ] Build the `/dashboard` route with empty states/placeholders for "Resume Score", "ATS Match", and "Saved Jobs".

### 2. Resume Builder UI (`web/app/(dashboard)/resume/page.tsx`)
This page is the core focus of Phase 1. Build a multi-pane or multi-step UI:
- [ ] **Upload Section**: Create a drag-and-drop zone for users to upload their resumes. On drop, submit the file to `POST /api/v1/ai/resume/upload`.
- [ ] **Parsed Data Editor**: Once the resume is parsed, populate a form (`react-hook-form` + `zod`) with the returned `parsedData`. Allow the user to edit their Experience, Education, and Skills.
- [ ] **AI Assistant Sidebar**: Build a chat panel on the right side of the screen. Allow users to type prompts (e.g., "Fix my grammar"). Send prompts to `POST /api/v1/ai/chat` and display the AI's response sequentially like a typical chat UI. Keep track of the returned `chatId` to continue the thread.

### 3. API Integration (`web/lib/api.ts`)
- [ ] Setup a utility function or Axios instance that intercepts requests to inject the Clerk Bearer token (or let Clerk Next.js middleware handle the proxying if you prefer a Next.js API route proxy).
- [ ] Wire up `react-query` or similar data fetching libraries to handle the loading states of the AI response and file upload.

### Important Notes
- The database schema now contains `resumesTable`, `chatsTable`, and `messagesTable`. All data is scoped to the `userId` linked to Clerk.
- Make sure you have your local backend running on the appropriate port when testing.
- The AI uses a LLM via Agenix SDK on the backend. Responses might take a moment to generate, so robust loading spinners/skeletons in the UI are highly recommended.
