"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Edit2, Check, X, Building, GraduationCap, CalendarDays, ExternalLink, MapPin, Briefcase, Plus, Trash2, MessageSquare, BrainCircuit, FolderGit2 } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function ResumeDetailPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const params = useParams();
  const router = useRouter();
  const resumeId = params.id as string;

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [storageUrl, setStorageUrl] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [compatibleJobRoles, setCompatibleJobRoles] = useState("");
  const [skills, setSkills] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [experience, setExperience] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [education, setEducation] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [projects, setProjects] = useState<any[]>([]);

  // We should also store the original data to allow "Cancel" to revert
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    if (resumeId && isLoaded && isSignedIn) {
      fetchResumeDetails(resumeId);
    }
  }, [resumeId, isLoaded, isSignedIn]);

  async function fetchResumeDetails(id: string) {
    try {
      const token = await getToken();
      if (!token) return;
      const result = await apiRequest(`/api/v1/ai/resume/${id}`, token);
      if (result.success && result.data) {
        setAtsScore(result.data.atsScore);
        setStorageUrl(result.data.storageUrl);
        setSummary(result.data.summary);

        if (result.data.parsedData) {
          const pd = result.data.parsedData;
          const parsedSkills = pd.skills ? (Array.isArray(pd.skills) ? pd.skills.join(", ") : pd.skills) : "";
          const parsedRoles = pd.compatibleJobRoles ? (Array.isArray(pd.compatibleJobRoles) ? pd.compatibleJobRoles.join(", ") : pd.compatibleJobRoles) : "";

          setName(pd.name || "");
          // Email might not be in the AI extraction schema by default, but keeping it if exists
          setEmail(pd.email || "");
          setLocation(pd.location || "");
          setCompatibleJobRoles(parsedRoles);
          setSkills(parsedSkills);
          setExperience(pd.experience || []);
          setEducation(pd.education || []);
          setProjects(pd.projects || []);

          setOriginalData({
            name: pd.name || "",
            email: pd.email || "",
            location: pd.location || "",
            compatibleJobRoles: parsedRoles,
            skills: parsedSkills,
            experience: pd.experience || [],
            education: pd.education || [],
            projects: pd.projects || [],
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch resume:", error);
      toast.error("Failed to load resume details.");
      router.push("/resumes");
    } finally {
      setIsLoadingData(false);
    }
  }

  async function handleAnalyze() {
    setIsAnalyzing(true);
    const toastId = toast.loading("Analyzing your resume... This may take a few seconds.", {
      position: "bottom-right",
    });
    try {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const result = await apiRequest(`/api/v1/ai/resume/${resumeId}/analyze`, token, {
        method: "POST"
      });
      if (result.success) {
        toast.dismiss(toastId);
        toast.success("Resume analyzed successfully!", { position: "bottom-right" });
        fetchResumeDetails(resumeId);
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error instanceof Error ? error.message : "Failed to analyze resume", { position: "bottom-right" });
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleCancelEdit() {
    if (originalData) {
      setName(originalData.name);
      setEmail(originalData.email);
      setLocation(originalData.location);
      setCompatibleJobRoles(originalData.compatibleJobRoles);
      setSkills(originalData.skills);
      // Deep copy to prevent reference issues
      setExperience(JSON.parse(JSON.stringify(originalData.experience)));
      setEducation(JSON.parse(JSON.stringify(originalData.education)));
      setProjects(JSON.parse(JSON.stringify(originalData.projects || [])));
    }
    setIsEditing(false);
  }

  function handleSaveEdit() {
    // Ideally this would save to the backend. For now we just update state.
    setOriginalData({
      name,
      email,
      location,
      compatibleJobRoles,
      skills,
      experience: JSON.parse(JSON.stringify(experience)),
      education: JSON.parse(JSON.stringify(education)),
      projects: JSON.parse(JSON.stringify(projects))
    });
    setIsEditing(false);
    toast.success("Resume details updated temporarily. (Save API not hooked up yet)");
  }

  const addExperience = () => {
    setExperience([...experience, { company: "", role: "", duration: "" }]);
  };

  const removeExperience = (index: number) => {
    const newExp = [...experience];
    newExp.splice(index, 1);
    setExperience(newExp);
  };

  const addEducation = () => {
    setEducation([...education, { institution: "", degree: "" }]);
  };

  const removeEducation = (index: number) => {
    const newEdu = [...education];
    newEdu.splice(index, 1);
    setEducation(newEdu);
  };

  const addProject = () => {
    setProjects([...projects, { name: "", description: "", technologies: [], link: "" }]);
  };

  const removeProject = (index: number) => {
    const newProj = [...projects];
    newProj.splice(index, 1);
    setProjects(newProj);
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <div className="animate-pulse text-text-secondary">Loading resume details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link href="/resumes" className="text-text-muted hover:text-text-primary flex items-center text-sm font-medium transition-colors mb-4 inline-flex">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to My Resumes
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Resume Details</h1>
            <div className="flex items-center gap-3">
              {/* ATS Score / Analyze */}
              {atsScore !== null ? (
                <div className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg font-bold shadow-sm mr-1">
                  ATS: {atsScore}
                </div>
              ) : (
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`primary-button px-4 py-2 text-sm flex items-center gap-2 mr-1 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <BrainCircuit className="w-4 h-4" /> 
                  {isAnalyzing ? "Analyzing..." : "Analyze"}
                </button>
              )}

              {/* Feedback */}
              {atsScore !== null && (
                <Link href={`/resumes/${resumeId}/feedback`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                  <MessageSquare className="w-4 h-4" /> Feedback
                </Link>
              )}

              {/* Icon Actions */}
              <div className="flex items-center gap-1 border-l border-border pl-3 ml-1">
                {storageUrl && (
                  <a href={storageUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors" title="View Original PDF">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
                
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-surface-hover text-text-secondary hover:text-primary transition-colors" title="Edit Data">
                    <Edit2 className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-surface-hover rounded-full p-1 border border-border">
                    <button onClick={handleCancelEdit} className="p-1.5 rounded-full hover:bg-background text-text-muted hover:text-red-500 transition-colors" title="Cancel">
                      <X className="w-4 h-4" />
                    </button>
                    <button onClick={handleSaveEdit} className="p-1.5 rounded-full hover:bg-background text-text-muted hover:text-green-500 transition-colors" title="Save">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="mt-2 text-text-secondary">
            {isEditing ? "Edit the extracted data below to fix any parsing errors." : "Review your extracted resume details."}
          </p>
        </div>

        {/* Resume Data Section */}
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm glass-card relative overflow-hidden">
          {isEditing && (
            <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse"></div>
          )}

          {/* AI Overview Summary (Only in View Mode) */}
          {!isEditing && atsScore === null && (
            <div className="mb-8 p-6 rounded-2xl bg-surface border border-border border-dashed text-center">
               <BrainCircuit className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-50" />
               <h3 className="text-lg font-semibold text-text-primary mb-2">Unlock AI Insights</h3>
               <p className="text-text-secondary leading-relaxed mb-4">
                 This resume hasn&apos;t been analyzed yet. Analyze it now to get a professional summary, ATS score, and highly detailed feedback!
               </p>
               <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`primary-button px-6 py-2 ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isAnalyzing ? "Analyzing Resume..." : "Analyze Now"}
               </button>
            </div>
          )}

          {!isEditing && summary && (
            <div className="mb-8 p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2">
                <Check className="w-5 h-5" /> AI Overview
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {summary}
              </p>
            </div>
          )}

          {/* Personal Information */}
          <div className={(!isEditing && summary) ? "mt-4" : "mt-2"}>
            <h3 className="text-lg font-semibold border-b border-border pb-2">Personal Information</h3>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-text-muted">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="mt-2 w-full rounded-2xl border border-border bg-background p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-primary"
                  />
                ) : (
                  <p className="mt-1 text-text-primary font-medium text-lg">{name || "Not provided"}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-text-muted">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="mt-2 w-full rounded-2xl border bg-background p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-primary"
                  />
                ) : (
                  <div className="mt-1 flex items-center gap-2 text-text-primary font-medium text-lg">
                    {location ? <><MapPin className="w-5 h-5 text-primary opacity-70" /> {location}</> : "Not provided"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compatible Roles */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold border-b border-border pb-2">Compatible Job Roles</h3>
            {isEditing ? (
              <input
                type="text"
                value={compatibleJobRoles}
                onChange={(e) => setCompatibleJobRoles(e.target.value)}
                placeholder="Software Engineer, Product Manager..."
                className="mt-4 w-full rounded-2xl border border-border bg-background p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-primary"
              />
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {compatibleJobRoles ? compatibleJobRoles.split(",").map((r, i) => (
                  <span key={i} className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm border border-primary/20 flex items-center gap-1 font-medium">
                    <Briefcase className="w-3.5 h-3.5" /> {r.trim()}
                  </span>
                )) : <p className="text-text-muted text-sm">No compatible roles found.</p>}
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold border-b border-border pb-2">Skills</h3>
            {isEditing ? (
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Python, React, Machine Learning..."
                className="mt-4 w-full rounded-2xl border border-border bg-background p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-primary"
              />
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {skills ? skills.split(",").map((s, i) => (
                  <span key={i} className="bg-surface-hover text-text-secondary px-3 py-1 rounded-full text-sm border border-border">
                    {s.trim()}
                  </span>
                )) : <p className="text-text-muted text-sm">No skills listed</p>}
              </div>
            )}
          </div>

          {/* Experience */}
          <div className="mt-8">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-lg font-semibold">Experience</h3>
              {isEditing && (
                <button onClick={addExperience} className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                  <Plus className="w-4 h-4" /> Add Experience
                </button>
              )}
            </div>
            <div className="mt-4 space-y-4">
              {experience.length > 0 ? experience.map((exp, i) => (
                isEditing ? (
                  <div key={i} className="p-4 border border-border rounded-xl bg-background/50 relative">
                    <button onClick={() => removeExperience(i)} className="absolute top-4 right-4 text-text-muted hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-xs text-text-muted">Job Title</label>
                        <input
                          type="text"
                          value={exp.role || exp.title || ""}
                          onChange={(e) => { const newExp = [...experience]; newExp[i].role = e.target.value; setExperience(newExp); }}
                          placeholder="e.g. Software Engineer"
                          className="mt-1 w-full rounded-2xl border border-border bg-background p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-muted">Company</label>
                        <input
                          type="text"
                          value={exp.company || ""}
                          onChange={(e) => { const newExp = [...experience]; newExp[i].company = e.target.value; setExperience(newExp); }}
                          placeholder="e.g. Google"
                          className="mt-1 w-full rounded-2xl border border-border bg-background p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-primary"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-text-muted">Duration</label>
                        <input
                          type="text"
                          value={exp.duration || ""}
                          onChange={(e) => { const newExp = [...experience]; newExp[i].duration = e.target.value; setExperience(newExp); }}
                          placeholder="e.g. Jan 2020 - Present"
                          className="mt-1 w-full rounded-2xl border border-border bg-background p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-primary"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-text-muted">Details & Achievements (One per line)</label>
                        <textarea
                          value={exp.bulletPoints ? (Array.isArray(exp.bulletPoints) ? exp.bulletPoints.join('\n') : exp.bulletPoints) : ""}
                          onChange={(e) => { 
                            const newExp = [...experience]; 
                            newExp[i].bulletPoints = e.target.value.split('\n'); 
                            setExperience(newExp); 
                          }}
                          placeholder="e.g. Developed scalable backend services..."
                          className="mt-1 w-full rounded-2xl border border-border bg-background p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-primary min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex flex-col gap-1.5 p-4 rounded-xl hover:bg-surface-hover transition-colors">
                    <h4 className="font-bold text-text-primary text-lg">{exp.role || exp.title || "Unknown Role"}</h4>
                    <div className="flex items-center gap-4 text-sm text-text-secondary mb-2">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Building className="w-4 h-4 opacity-70" />
                        <span>{exp.company || "Unknown Company"}</span>
                      </div>
                      {exp.duration && (
                        <div className="flex items-center gap-1.5 opacity-80">
                          <CalendarDays className="w-4 h-4 opacity-70" />
                          <span>{exp.duration}</span>
                        </div>
                      )}
                    </div>
                    {exp.bulletPoints && Array.isArray(exp.bulletPoints) && exp.bulletPoints.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-text-secondary space-y-1.5 mt-1 ml-1 marker:text-primary/50">
                        {exp.bulletPoints.map((bp: string, bpi: number) => (
                          bp.trim() ? <li key={bpi} className="leading-relaxed">{bp}</li> : null
                        ))}
                      </ul>
                    )}
                  </div>
                )
              )) : (
                <p className="text-text-muted text-sm">No experience data found.</p>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="mt-8">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-lg font-semibold">Education</h3>
              {isEditing && (
                <button onClick={addEducation} className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              )}
            </div>
            <div className="mt-4 space-y-4">
              {education.length > 0 ? education.map((edu, i) => (
                isEditing ? (
                  <div key={i} className="p-4 border border-border rounded-xl bg-background/50 relative">
                    <button onClick={() => removeEducation(i)} className="absolute top-4 right-4 text-text-muted hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-xs text-text-muted">Degree / Qualification</label>
                        <input
                          type="text"
                          value={edu.degree || edu.class || ""}
                          onChange={(e) => { const newEdu = [...education]; newEdu[i].degree = e.target.value; setEducation(newEdu); }}
                          placeholder="e.g. B.S. Computer Science"
                          className="mt-1 w-full rounded-2xl border border-border bg-background p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-muted">Institution</label>
                        <input
                          type="text"
                          value={edu.institution || ""}
                          onChange={(e) => { const newEdu = [...education]; newEdu[i].institution = e.target.value; setEducation(newEdu); }}
                          placeholder="e.g. Stanford University"
                          className="mt-1 w-full rounded-2xl border border-border bg-background p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-primary"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex flex-col gap-1.5 p-4 rounded-xl hover:bg-surface-hover transition-colors">
                    <h4 className="font-bold text-text-primary text-lg">{edu.degree || edu.class || "Unknown Degree"}</h4>
                    <div className="flex items-center gap-1.5 text-sm text-text-secondary font-medium">
                      <GraduationCap className="w-4 h-4 opacity-70" />
                      {edu.institution || "Unknown Institution"}
                    </div>
                  </div>
                )
              )) : (
                <p className="text-text-muted text-sm">No education data found.</p>
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="mt-8">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-lg font-semibold">Projects</h3>
              {isEditing && (
                <button onClick={addProject} className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                  <Plus className="w-4 h-4" /> Add Project
                </button>
              )}
            </div>
            <div className="mt-4 space-y-4">
              {projects.length > 0 ? projects.map((proj, i) => (
                isEditing ? (
                  <div key={i} className="p-4 border border-border rounded-xl bg-background/50 relative">
                    <button onClick={() => removeProject(i)} className="absolute top-4 right-4 text-text-muted hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-xs text-text-muted">Project Name</label>
                        <input
                          type="text"
                          value={proj.name || ""}
                          onChange={(e) => { const newProj = [...projects]; newProj[i].name = e.target.value; setProjects(newProj); }}
                          placeholder="e.g. E-Commerce Platform"
                          className="mt-1 w-full rounded-2xl border border-border bg-background p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-muted">Project Link</label>
                        <input
                          type="text"
                          value={proj.link || ""}
                          onChange={(e) => { const newProj = [...projects]; newProj[i].link = e.target.value; setProjects(newProj); }}
                          placeholder="e.g. https://github.com/..."
                          className="mt-1 w-full rounded-2xl border border-border bg-background p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-primary"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-text-muted">Technologies (Comma separated)</label>
                        <input
                          type="text"
                          value={Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies || ""}
                          onChange={(e) => { const newProj = [...projects]; newProj[i].technologies = e.target.value.split(",").map((t: string) => t.trim()); setProjects(newProj); }}
                          placeholder="e.g. React, Node.js, MongoDB"
                          className="mt-1 w-full rounded-2xl border border-border bg-background p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-primary"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-text-muted">Description</label>
                        <textarea
                          value={proj.description || ""}
                          onChange={(e) => { const newProj = [...projects]; newProj[i].description = e.target.value; setProjects(newProj); }}
                          placeholder="Brief description of the project..."
                          className="mt-1 w-full rounded-2xl border border-border bg-background p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-primary min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex flex-col gap-2 p-4 rounded-xl hover:bg-surface-hover transition-colors">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-text-primary text-lg flex items-center gap-2">
                        <FolderGit2 className="w-5 h-5 text-primary opacity-80" />
                        {proj.name || "Untitled Project"}
                      </h4>
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 text-primary hover:underline">
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {proj.technologies && Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {proj.technologies.map((t: string, ti: number) => t.trim() ? (
                          <span key={ti} className="text-xs px-2 py-0.5 rounded-full bg-background border border-border text-text-secondary">
                            {t}
                          </span>
                        ) : null)}
                      </div>
                    )}
                    {proj.description && (
                      <p className="text-sm text-text-secondary leading-relaxed mt-1">
                        {proj.description}
                      </p>
                    )}
                  </div>
                )
              )) : (
                <p className="text-text-muted text-sm">No project data found.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
