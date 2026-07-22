# CareerPilot AI — User Flows & Application Navigation

**Version:** 1.0  
**Status:** Draft  
**Purpose:** Define the end-to-end user journeys, navigation structure, and feature workflows within CareerPilot AI.

---

# 1. Introduction

This document describes how users interact with CareerPilot AI from the moment they land on the platform until they complete various career development tasks.

Unlike the System Architecture document, this guide focuses on the **user experience** rather than the internal implementation. It outlines navigation paths, onboarding, feature-specific workflows, and dashboard interactions.

---

# 2. User Journey Overview

The following diagram illustrates the primary navigation path throughout the application.

```mermaid
flowchart TD

A([Landing Page])

A --> B{User Logged In?}

B -->|No| C[Explore Features]
B -->|Yes| H[Dashboard]

C --> D[AI Resume Builder]
C --> E[AI Job Explorer]
C --> F[AI Mock Interview]
C --> G[AI Project Recommendation]

D --> L[Sign Up]
E --> L
F --> L
G --> L

L --> M[Login / Register]

M --> H

H --> N{Choose Feature}

N --> O[Resume Builder]
N --> P[Job Explorer]
N --> Q[Project Recommendation]
N --> R[Mock Interview]
N --> S[Voice Interview]
N --> T[Profile & Settings]

O --> U[Dashboard]
P --> U
Q --> U
R --> U
S --> U
T --> U
```

---

# 3. Landing Page Flow

The landing page serves as the entry point for all users.

Users can:

- Learn about CareerPilot AI
- Explore features
- View pricing
- Read testimonials
- Try demo experiences
- Register or log in

```mermaid
flowchart TD

A[Landing Page]

A --> B[Features]

A --> C[Pricing]

A --> D[Testimonials]

A --> E[About]

A --> F[Login]

A --> G[Register]

F --> H[Dashboard]

G --> I[User Onboarding]
```

---

# 4. User Onboarding Flow

New users complete an onboarding process to personalize AI recommendations.

```mermaid
flowchart TD

A[Register]

A --> B[Verify Email]

B --> C[Complete Profile]

C --> D{Career Stage}

D --> E[Student]

D --> F[Fresher]

D --> G[Experienced Professional]

D --> H[Career Switcher]

E --> I
F --> I
G --> I
H --> I

I[Upload Resume or Skip]

I --> J[Connect GitHub]

J --> K[Connect LinkedIn]

K --> L[AI Profile Analysis]

L --> M[Dashboard]
```

---

# 5. Dashboard Navigation

The dashboard acts as the central hub for every feature.

```mermaid
flowchart TD

Dashboard

Dashboard --> ResumeBuilder
Dashboard --> ResumeAnalyzer
Dashboard --> ResumeMatcher
Dashboard --> JobExplorer
Dashboard --> ProjectRecommendation
Dashboard --> MockInterview
Dashboard --> VoiceInterview
Dashboard --> Profile
Dashboard --> Settings
Dashboard --> Analytics
```

---

# 6. AI Resume Builder Flow

Users can create or improve resumes using multiple data sources.

```mermaid
flowchart TD

A[Resume Builder]

A --> B{Choose Input}

B --> C[Upload Resume]

B --> D[GitHub]

B --> E[LinkedIn]

B --> F[Portfolio Website]

B --> G[Manual Entry]

C --> H
D --> H
E --> H
F --> H
G --> H

H[AI Resume Parser]

H --> I[Extract Information]

I --> J[ATS Optimization]

J --> K[Grammar Improvement]

K --> L[AI Summary]

L --> M[Resume Editor]

M --> N[Download PDF]

M --> O[Download DOCX]

M --> P[Save Resume]
```

---

# 7. Resume vs Job Description Flow

Users compare resumes against job descriptions.

```mermaid
flowchart TD

A[Resume Matcher]

A --> B[Select Resume]

B --> C[Paste Job Description]

C --> D[AI Analysis]

D --> E[ATS Match Score]

D --> F[Missing Skills]

D --> G[Keyword Analysis]

D --> H[Experience Gap]

E --> I[Recommendations]

F --> I

G --> I

H --> I

I --> J[Optimize Resume]

J --> K[Save Updated Resume]
```

---

# 8. AI Job Explorer Flow

Users discover jobs and internships tailored to their profile.

```mermaid
flowchart TD

A[Job Explorer]

A --> B[Search Jobs]

B --> C[Apply Filters]

C --> D[AI Matching]

D --> E[Match Score]

E --> F[Job Details]

F --> G{Decision}

G -->|Apply| H[Company Website]

G -->|Save| I[Job Tracker]

I --> J[Dashboard]
```

---

# 9. AI Project Recommendation Flow

CareerPilot AI recommends projects based on the user's skills and experience.

```mermaid
flowchart TD

A[Project Recommendation]

A --> B[Analyze Resume]

B --> C[Analyze GitHub]

C --> D[Analyze Skills]

D --> E[Career Assessment]

E --> F[Beginner Projects]

E --> G[Intermediate Projects]

E --> H[Advanced Projects]

E --> I[Open Source Projects]

E --> J[Startup Ideas]

F --> K[Learning Roadmap]
G --> K
H --> K
I --> K
J --> K
```

---

# 10. AI Mock Interview Flow

Users practice interviews with AI.

```mermaid
flowchart TD

A[Mock Interview]

A --> B{Interview Type}

B --> C[HR]

B --> D[Technical]

B --> E[Behavioral]

B --> F[Coding]

B --> G[Company Specific]

C --> H
D --> H
E --> H
F --> H
G --> H

H[Generate Questions]

H --> I[User Answers]

I --> J[AI Evaluation]

J --> K[Feedback]

K --> L[Interview Score]

L --> M[Improvement Plan]
```

---

# 11. Voice Interview Flow

Users conduct real-time voice interviews with AI.

```mermaid
flowchart TD

A[Voice Interview]

A --> B[Enable Microphone]

B --> C[AI Starts Interview]

C --> D[User Speaks]

D --> E[Speech Recognition]

E --> F[AI Evaluation]

F --> G[Confidence Score]

F --> H[Communication Score]

F --> I[Pronunciation Score]

F --> J[Filler Word Analysis]

G --> K[Final Report]
H --> K
I --> K
J --> K
```

---

# 12. Dashboard Analytics Flow

The dashboard summarizes the user's career progress.

```mermaid
flowchart TD

Dashboard

Dashboard --> ResumeScore

Dashboard --> ATSScore

Dashboard --> JobMatches

Dashboard --> SavedJobs

Dashboard --> InterviewScores

Dashboard --> RecommendedProjects

Dashboard --> LearningRoadmap

Dashboard --> AIInsights

Dashboard --> RecentActivity
```

---

# 13. Profile & Settings Flow

Users manage their personal information and connected accounts.

```mermaid
flowchart TD

Profile

Profile --> PersonalInformation

Profile --> ResumeLibrary

Profile --> ConnectedAccounts

ConnectedAccounts --> GitHub

ConnectedAccounts --> LinkedIn

ConnectedAccounts --> Google

Profile --> NotificationSettings

Profile --> PrivacySettings

Profile --> Subscription

Profile --> Logout
```

---

# 14. Complete Feature Navigation

The following diagram illustrates how all major modules are interconnected.

```mermaid
flowchart LR

Landing --> Login

Landing --> Register

Login --> Dashboard

Register --> Dashboard

Dashboard --> ResumeBuilder

Dashboard --> ResumeMatcher

Dashboard --> JobExplorer

Dashboard --> ProjectRecommendation

Dashboard --> MockInterview

Dashboard --> VoiceInterview

Dashboard --> Profile

Dashboard --> Settings

ResumeBuilder --> Dashboard

ResumeMatcher --> Dashboard

JobExplorer --> Dashboard

ProjectRecommendation --> Dashboard

MockInterview --> Dashboard

VoiceInterview --> Dashboard

Profile --> Dashboard

Settings --> Dashboard
```

---

# 15. User Journey Summary

A typical user journey through CareerPilot AI is as follows:

1. User visits the landing page.
2. Explores platform features.
3. Registers or logs in.
4. Completes onboarding.
5. Uploads or creates a resume.
6. Receives AI-powered ATS optimization.
7. Searches for jobs and internships.
8. Compares resume with job descriptions.
9. Receives personalized project recommendations.
10. Practices interviews using AI.
11. Reviews performance on the dashboard.
12. Continuously improves employability through AI recommendations.

---

# 16. Future User Flows

The following workflows will be documented as new features are introduced:

- Module 5 — AI Voice Interview Assistant *(Future Release)*
- AI Career Coach
- Daily Learning Planner
- Coding Practice Assistant
- Company Preparation Workflows
- Resume Version Management
- Job Application Pipeline
- Networking Assistant
- Mentor Recommendations
- AI Career Roadmap
- Team & Institution Dashboards
- Recruiter Portal
- Placement Cell Portal
- Mobile Application Navigation