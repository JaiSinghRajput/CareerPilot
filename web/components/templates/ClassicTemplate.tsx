import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ClassicTemplate({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="w-full bg-white text-black p-8 md:p-12 font-serif text-sm print:p-0 print:m-0" style={{ maxWidth: '210mm', minHeight: '297mm', margin: '0 auto' }}>
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">{data.name || "Your Name"}</h1>
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 text-gray-700 text-xs">
          {data.email && <span>{data.email}</span>}
          {data.email && data.location && <span>|</span>}
          {data.location && <span>{data.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          <p className="text-gray-800 leading-relaxed text-justify">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && Array.isArray(data.experience) && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-widest border-b border-gray-300 mb-3 pb-1">Professional Experience</h2>
          <div className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.experience.map((exp: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-base">{exp.role || "Role"}</h3>
                  <span className="text-xs text-gray-600 font-semibold">{exp.duration || "Duration"}</span>
                </div>
                <div className="text-gray-700 font-medium italic mb-2">{exp.company || "Company"}</div>
                {exp.description && (
                  <p className="text-gray-800 leading-relaxed text-sm">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && Array.isArray(data.projects) && data.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-widest border-b border-gray-300 mb-3 pb-1">Projects</h2>
          <div className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.projects.map((proj: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-base">{proj.name || "Project Name"}</h3>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                      View Project
                    </a>
                  )}
                </div>
                {proj.technologies && Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                  <div className="text-gray-700 italic text-xs mb-2">
                    Technologies: {proj.technologies.join(", ")}
                  </div>
                )}
                {proj.description && (
                  <p className="text-gray-800 leading-relaxed text-sm">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && Array.isArray(data.education) && data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-widest border-b border-gray-300 mb-3 pb-1">Education</h2>
          <div className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {data.education.map((edu: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-base">{edu.degree || edu.class || "Degree"}</h3>
                  <span className="text-xs text-gray-600 font-semibold">{edu.year || "Year"}</span>
                </div>
                <div className="text-gray-700">{edu.institution || "Institution"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase tracking-widest border-b border-gray-300 mb-3 pb-1">Skills</h2>
          <p className="text-gray-800 leading-relaxed">
            {Array.isArray(data.skills) ? data.skills.join(", ") : data.skills}
          </p>
        </div>
      )}
    </div>
  );
}
