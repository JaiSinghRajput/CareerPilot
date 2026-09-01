import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MinimalistTemplate({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="w-full bg-white text-gray-900 font-sans p-8 md:p-14 print:p-0 print:m-0" style={{ maxWidth: '210mm', minHeight: '297mm', margin: '0 auto' }}>
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-light tracking-tight mb-2">{data.name || "Your Name"}</h1>
          {data.roles && (
            <p className="text-gray-500 tracking-widest uppercase text-sm">
              {Array.isArray(data.roles) ? data.roles.join(" • ") : data.roles}
            </p>
          )}
        </div>
        <div className="mt-4 md:mt-0 text-right text-sm text-gray-500 space-y-1">
          {data.email && <div>{data.email}</div>}
          {data.location && <div>{data.location}</div>}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-10">
          <p className="text-gray-700 leading-relaxed max-w-3xl">{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience && Array.isArray(data.experience) && data.experience.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Experience</h2>
          <div className="space-y-8">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.experience.map((exp: any, i: number) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 text-sm text-gray-500 pt-1">
                  {exp.duration || "Duration"}
                </div>
                <div className="md:col-span-3">
                  <h3 className="text-lg font-medium text-gray-900">{exp.role || "Role"}</h3>
                  <div className="text-gray-600 mb-2">{exp.company || "Company"}</div>
                  {exp.description && (
                    <p className="text-gray-600 leading-relaxed text-sm">{exp.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && Array.isArray(data.projects) && data.projects.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Projects</h2>
          <div className="space-y-8">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.projects.map((proj: any, i: number) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 text-sm text-gray-500 pt-1">
                  {proj.link ? (
                    <a href={proj.link} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">
                      View Source ↗
                    </a>
                  ) : "Project"}
                </div>
                <div className="md:col-span-3">
                  <h3 className="text-lg font-medium text-gray-900">{proj.name || "Project Name"}</h3>
                  {proj.technologies && Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                    <div className="text-gray-500 text-sm mb-2">{proj.technologies.join(", ")}</div>
                  )}
                  {proj.description && (
                    <p className="text-gray-600 leading-relaxed text-sm">{proj.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education && Array.isArray(data.education) && data.education.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Education</h2>
          <div className="space-y-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.education.map((edu: any, i: number) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 text-sm text-gray-500 pt-1">
                  {edu.year || "Year"}
                </div>
                <div className="md:col-span-3">
                  <h3 className="text-base font-medium text-gray-900">{edu.degree || edu.class || "Degree"}</h3>
                  <div className="text-gray-600">{edu.institution || "Institution"}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills && (
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1"></div>
            <div className="md:col-span-3">
              <p className="text-gray-700 leading-relaxed">
                {Array.isArray(data.skills) ? data.skills.join(", ") : data.skills}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
