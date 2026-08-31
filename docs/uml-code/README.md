# CareerPilot AI - Complete System UML Documentation

This directory contains the comprehensive UML diagrams for the **CareerPilot AI** project, generated using **PlantUML**. 

These diagrams represent the **entire project scope** as defined in the architectural and product documentation (PRD, TRD, Architecture, User Flows), extending beyond the initial MVP implementation to cover the complete AI-first career platform.

## Generated Diagrams
1. **`use-case.puml`**: Maps out the complete user journey across all 5 core modules (Resume Builder, Job Explorer, Project Recommendations, Interview Assistant, Auth/Profile).
2. **`activity.puml`**: Outlines the end-to-end user workflow from onboarding to exploring jobs, generating resumes, and practicing mock interviews.
3. **`sequence.puml`**: Illustrates the highly decoupled Model Context Protocol (MCP) execution flow, showing how the frontend, Express API, AI Gateway, Local LLM, and MCP tools interact.
4. **`class.puml`**: Defines the expanded domain model, introducing entities for Job Applications, Project Recommendations, and Interview Sessions alongside Users and Resumes.
5. **`component.puml`**: Represents the full system architecture, explicitly detailing the AI orchestration tier and the ecosystem of independent MCP Tool Servers.
6. **`deployment.puml`**: Shows the Docker-first deployment topology, separating the AI Compute Nodes, MCP clusters, API gateways, and databases (PostgreSQL, Qdrant).
7. **`communication.puml`**: A structural representation of the numbered messages in the sequence diagram, focusing on the interactions within the AI Gateway and MCP layer.
8. **`object.puml`**: A runtime snapshot showcasing a user entity populated with complete career development data (Resume, Job Application, Project Idea, Interview Session).

## Design Choices & Styling
- **Renderer**: Pure PlantUML syntax is used across all files. No Mermaid syntax is present.
- **Styling**: All diagrams include custom `skinparam` configurations for a clean, professional, and readable aesthetic suitable for technical presentations and architectural reviews.
- **Inferences**: Deployment infrastructure was mapped based on the "Docker-first deployment" and "Horizontally scalable" goals mentioned in `Architecture.md`. The domain model (Class/Object diagrams) includes necessary structural inferences (e.g., `JobApplication`, `InterviewSession`) derived directly from the explicit features requested in the `PRD.md`.
