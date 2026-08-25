"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { FileText, Lightbulb, Search, MessageSquare, Mic, ArrowRight, Sparkles, CheckCircle, Zap } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import UserProfile from "@/components/UserProfile";

const features = [
  {
    icon: <FileText className="w-6 h-6" />,
    title: "AI Resume Builder",
    description:
      "Create a professional, ATS-friendly resume with AI-powered guidance.",
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: "AI Project Recommendation",
    description:
      "Discover project ideas tailored to your skills, interests, and career goals.",
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "AI Job Explorer",
    description:
      "Explore relevant job opportunities and discover your next career opportunity.",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "AI Mock Interview",
    description:
      "Practice realistic interviews and improve your answers with AI-powered feedback.",
  },
  {
    icon: <Mic className="w-6 h-6" />,
    title: "AI Audio Interview",
    description:
      "Prepare for interviews with an interactive voice-based interview experience.",
  },
];

const steps = [
  {
    number: "01",
    title: "Build Your Profile",
    description:
      "Create your career profile and let AI understand your skills, goals, and experience.",
  },
  {
    number: "02",
    title: "Discover Opportunities",
    description:
      "Find relevant jobs and projects that match your profile and career direction.",
  },
  {
    number: "03",
    title: "Prepare & Get Hired",
    description:
      "Improve your resume and practice interviews with personalized AI guidance.",
  },
];

export default function Home() {
  const { isSignedIn, user } = useUser();
  return (
    <main className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="brand">
            Career<span>Pilot</span> <b>AI</b>
          </Link>

          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
          </div>

          <div className="nav-actions">

            <ThemeToggle />

            {isSignedIn ? (
              <>
                <span className="welcome-text">
                  Hi, {user?.firstName || "User"}
                </span>

                <UserProfile />
              </>
            ) : (
              <>
                <Link href="/sign-in" className="sign-in-link">
                  Sign In
                </Link>

                <Link href="/sign-up" className="primary-button nav-button">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-glow hero-glow-left" />
        <div className="hero-glow hero-glow-right" />

        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles className="w-4 h-4 text-primary" />
              AI-powered career platform
            </div>

            <h1>
              {isSignedIn ? (
                <>
                  Welcome back, {user?.firstName || "there"}!
                  <br />
                  <span>Ready to Get Hired?</span>
                </>
              ) : (
                <>
                  Build. Explore.
                  <br />
                  <span>Prepare. Get Hired.</span>
                </>
              )}
            </h1>

            <p>
              Your AI-powered career companion to build better resumes,
              discover opportunities, improve your skills, and prepare for
              interviews.
            </p>

            <div className="hero-actions">
              <Link
                href={isSignedIn ? "#features" : "/sign-up"}
                className="primary-button flex items-center gap-2"
              >
                {isSignedIn ? "Explore Your Career" : "Start Your Journey"} <ArrowRight className="w-4 h-4" />
              </Link>

              <a href="#features" className="secondary-button">
                Explore Features
              </a>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="dashboard-wrapper">
            <div className="dashboard-glow" />

            <div className="dashboard-card glass-card">
              <div className="dashboard-header">
                <div>
                  <p>CareerPilot AI</p>
                  <h3>Career Dashboard</h3>
                </div>

                <span className="status-badge flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> AI Ready
                </span>
              </div>

              <div className="dashboard-stats">
                <div className="stat-card">
                  <p>Resume Score</p>
                  <strong>86%</strong>

                  <div className="progress-track">
                    <div className="progress-fill" />
                  </div>
                </div>

                <div className="stat-card">
                  <p>Job Matches</p>
                  <strong>24</strong>
                  <small>+12 this week</small>
                </div>
              </div>

              <div className="career-insight">
                <p>AI Career Insight</p>

                <span>
                  Your profile is ready for the next step. Explore matching
                  jobs and prepare with an AI mock interview.
                </span>

                <div className="insight-tags">
                  <span>Resume</span>
                  <span>Jobs</span>
                  <span>Interview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-label">EVERYTHING YOU NEED</span>

            <h2>One platform for your entire career journey.</h2>

            <p>
              From building your resume to preparing for interviews,
              CareerPilot AI brings your career tools together in one place.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature) => (
              <div className="feature-card" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>

                <span className="feature-link flex items-center gap-1">
                  Explore <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-section">
        <div className="container">
          <div className="section-heading">
            <span className="section-label blue-label">HOW IT WORKS</span>

            <h2>Your career journey, simplified.</h2>
          </div>

          <div className="steps-grid">
            {steps.map((step) => (
              <div className="step-card" key={step.number}>
                <span className="step-number">{step.number}</span>

                <h3>{step.title}</h3>

                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-glow cta-glow-left" />
            <div className="cta-glow cta-glow-right" />

            <div className="cta-content">
              <span className="section-label">START YOUR JOURNEY</span>

              <h2>Your next opportunity starts here.</h2>

              <p>
                Build your profile, discover opportunities, and prepare with
                AI tools designed for your career.
              </p>

              <Link href="/sign-up" className="primary-button flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <Link href="/" className="brand">
            Career<span>Pilot</span> <b>AI</b>
          </Link>

          <p>© 2026 CareerPilot AI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}