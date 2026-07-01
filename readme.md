# 🚀 CareerPilot AI - Phase 1

> **Mission:** Build an AI-powered Resume Intelligence Platform that helps users create ATS-friendly resumes and understand how employable they are.

---

# 🎯 Phase 1 Goal

The objective of Phase 1 is to develop the foundation of CareerPilot AI.

By the end of this phase, a user should be able to:

- Register/Login
- Upload an existing resume
- Import GitHub Profile
- Generate an AI Resume
- Receive an ATS Score
- Analyze Resume Strengths & Weaknesses
- Download the generated resume
- Store resume history
- Access everything from a modern dashboard

This phase establishes the data and AI pipeline that future modules (Job Matching, Project Recommendation, Interview Assistant) will build upon.

---

# 📌 Problem Statement

Most students and job seekers struggle to create resumes that pass Applicant Tracking Systems (ATS) while effectively showcasing their skills.

CareerPilot AI automates resume generation and provides actionable AI feedback to improve hiring chances.

---

# 🏆 Success Criteria

A successful Phase 1 release means:

- Users can create accounts
- Resume upload works reliably
- Resume parser extracts structured data
- AI generates professional resumes
- ATS score is calculated
- Resume improvement suggestions are generated
- Resume can be downloaded as PDF
- Dashboard displays resume analytics

---

# 📦 Phase 1 Features

## Authentication

- User Registration
- Login
- JWT Authentication
- Google OAuth
- GitHub OAuth

---

## Dashboard

- Welcome Dashboard
- Resume History
- Resume Score
- ATS Score
- Recent Activity

---

## Resume Upload

Supported Formats

- PDF
- DOCX

Features

- Resume Parsing
- Skill Extraction
- Education Detection
- Experience Detection
- Project Detection

---

## GitHub Import

Import

- Profile
- Bio
- Repositories
- Languages
- Contributions
- Technologies

AI uses this information to enrich the resume.

---

## AI Resume Generator

Generate

- Professional Summary
- Experience
- Skills
- Projects
- Certifications
- Achievements

Output Formats

- PDF
- JSON
- Markdown

---

## ATS Resume Analyzer

Generate

- ATS Score
- Missing Keywords
- Resume Health
- Improvement Suggestions

---

## Resume History

- Versioning
- Download Previous Versions
- Delete Resume
- Rename Resume

---

# 🤖 AI Capabilities

- Resume Parsing
- Resume Generation
- Resume Optimization
- ATS Analysis
- Skill Detection
- Achievement Rewriting
- Grammar Enhancement

---

# 🛠 Tech Stack

## Frontend

- React
- TypeScript
- Tailwind CSS
- Material UI
- React Query
- React Router

## Backend

- Node.js
- Express
- TypeScript

## Database

- PostgreSQL
- Redis

## AI

- Self Hosted Llama 3.1 8B Instruct
- Qdrant
- RAG Pipeline
- Prompt Engineering

---

# 📂 Proposed Repository Structure

```
careerpilot-ai/

├── client/
├── server/
├── ai-service/
├── docs/
├── docker/
├── scripts/
└── README.md
```

---

# 🗺 Milestones

## Milestone 1

- Project Setup
- Authentication
- Database
- CI/CD

---

## Milestone 2

- Resume Upload
- Resume Parser
- Resume Storage

---

## Milestone 3

- AI Resume Generator
- Resume Templates

---

## Milestone 4

- ATS Score
- Resume Analysis

---

## Milestone 5

- Dashboard
- Downloads
- Testing
- Production Deployment

---

# 🚫 Out of Scope

These features belong to later phases.

- Job Recommendation
- Resume vs JD Matcher
- Project Recommendation
- Mock Interview
- Voice Interview
- Career Coach
- Learning Roadmap

---

# 📈 Phase 1 Deliverables

- ✅ Authentication
- ✅ Resume Upload
- ✅ Resume Parser
- ✅ GitHub Import
- ✅ AI Resume Generator
- ✅ ATS Analyzer
- ✅ Resume Dashboard
- ✅ Resume Downloads

---

# 🔥 End Goal

By the completion of Phase 1, CareerPilot AI should function as a production-ready AI Resume Builder that enables users to create professional, ATS-optimized resumes in minutes while laying the technical foundation for intelligent job matching and AI interview preparation in future phases.

> **Build the resume first. Build the career ecosystem next.**