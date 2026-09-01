import React from "react";
import { Mail, MapPin } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ModernTemplate({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="w-full bg-white text-gray-800 font-sans text-sm print:p-0 print:m-0 flex flex-col md:flex-row shadow-sm" style={{ maxWidth: '210mm', minHeight: '297mm', margin: '0 auto' }}>

      {/* Sidebar */}
      <div className="w-full md:w-1/3 bg-slate-900 text-slate-100 p-8">
        <div className="mb-8 border-b border-slate-700 pb-8">
          <h1 className="text-3xl font-bold uppercase tracking-tight text-white mb-2">{data.name || "Your Name"}</h1>
          {data.roles && (
            <p className="text-slate-300 font-medium">{Array.isArray(data.roles) ? data.roles[0] : data.roles}</p>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold uppercase tracking-wider text-slate-300 mb-3">Contact</h2>
            <div className="space-y-2 text-sm text-slate-400">
              {data.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>{data.email}</span>
                </div>
              )}
              {data.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>{data.location}</span>
                </div>
              )}
            </div>
          </div>

          {data.skills && (
            <div>
              <h2 className="text-lg font-semibold uppercase tracking-wider text-slate-300 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(data.skills) ? data.skills : data.skills.split(',')).map((skill: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-md">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.education && Array.isArray(data.education) && data.education.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold uppercase tracking-wider text-slate-300 mb-3">Education</h2>
              <div className="space-y-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {data.education.map((edu: any, i: number) => (
                  <div key={i}>
                    <h3 className="font-bold text-slate-200">{edu.degree || edu.class || "Degree"}</h3>
                    <div className="text-slate-400 text-xs">{edu.institution || "Institution"}</div>
                    <div className="text-slate-500 text-xs">{edu.year || "Year"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full md:w-2/3 p-8 md:p-10 bg-white">
        {data.summary && (
          <div className="mb-10">
            <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-px bg-slate-400"></span> Profile
            </h2>
            <p className="text-gray-600 leading-relaxed text-justify">{data.summary}</p>
          </div>
        )}

        {data.experience && Array.isArray(data.experience) && data.experience.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-px bg-slate-400"></span> Experience
            </h2>
            <div className="space-y-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data.experience.map((exp: any, i: number) => (
                <div key={i} className="relative pl-4 border-l-2 border-slate-200">
                  <div className="absolute w-3 h-3 bg-slate-400 rounded-full -left-1.75 top-1.5 border-4 border-white"></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                    <h3 className="font-bold text-lg text-slate-800">{exp.role || "Role"}</h3>
                    <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-full">{exp.duration || "Duration"}</span>
                  </div>
                  <div className="text-primary font-medium mb-2">{exp.company || "Company"}</div>
                  {exp.description && (
                    <p className="text-gray-600 leading-relaxed text-sm">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.projects && Array.isArray(data.projects) && data.projects.length > 0 && (
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-8 h-px bg-slate-400"></span> Projects
            </h2>
            <div className="space-y-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data.projects.map((proj: any, i: number) => (
                <div key={i} className="relative pl-4 border-l-2 border-slate-200">
                  <div className="absolute w-3 h-3 bg-slate-400 rounded-full -left-1.75 top-1.5 border-4 border-white"></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                    <h3 className="font-bold text-lg text-slate-800">{proj.name || "Project Name"}</h3>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline bg-primary/10 px-2 py-1 rounded-full">
                        View Project
                      </a>
                    )}
                  </div>
                  {proj.technologies && Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                    <div className="text-slate-500 font-medium text-xs mb-2">
                      {proj.technologies.join(" • ")}
                    </div>
                  )}
                  {proj.description && (
                    <p className="text-gray-600 leading-relaxed text-sm">{proj.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
