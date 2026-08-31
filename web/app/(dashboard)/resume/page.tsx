"use client";


import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiRequest } from "../../../lib/api";

export default function ResumePage() {
 const { getToken, isLoaded, isSignedIn } = useAuth();
  const [file, setFile] = useState<File | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
    }
  }

  async function handleUpload() {
  if (!file) {
    alert("Please select a resume first.");
    return;
  }

  try {
      if (!isLoaded) {
    alert("Clerk is still loading. Please try again.");
    return;
 }

  if (!isSignedIn) {
    alert("You are not signed in.");
    return;
  }

  const token = await getToken();

  console.log("Clerk loaded:", isLoaded);
  console.log("User signed in:", isSignedIn);
  console.log("Token received:", !!token);

  if (!token) {
    alert("Clerk session exists, but no JWT token was received.");
    return;
  }

    const formData = new FormData();
    formData.append("resume", file);

    const result = await apiRequest(
      "/api/v1/ai/resume/upload",
      token,
      {
        method: "POST",
        body: formData,
      }
    );

    console.log("Upload response:", result);

    alert("Resume uploaded successfully!");
  } catch (error) {
    console.error("Resume upload failed:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Failed to upload resume."
    );
  }
}

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Resume Builder</h1>

          <p className="mt-2 text-slate-600">
            Upload your resume and let CareerPilot AI analyze it.
          </p>
        </div>

        {/* Upload Section */}
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto max-w-md">
            <h2 className="text-xl font-semibold">
              Upload your resume
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Supported formats: PDF and DOCX
            </p>

            <label className="mt-6 inline-block cursor-pointer rounded-lg bg-green-500 px-6 py-3 font-medium text-white hover:bg-green-600">
              Choose Resume

              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {file && (
              <div className="mt-6 rounded-lg bg-slate-100 p-4 text-left">
                <p className="text-sm font-medium">
                  Selected file:
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {file.name}
                </p>
              </div>
            )}

            {file && (
              <button
                type="button"
                onClick={handleUpload}
                className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
              >
                Upload Resume
              </button>
            )}
          </div>
        </div>

        {/* Resume Editor */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">
            Resume Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Review and edit your resume details.
          </p>

          {/* Personal Information */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold">
              Personal Information
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  className="mt-2 w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="mt-2 w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold">
              Skills
            </h3>

            <input
              type="text"
              placeholder="Python, React, Machine Learning..."
              className="mt-4 w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Experience */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold">
              Experience
            </h3>

            <div className="mt-4 space-y-4">
              <input
                type="text"
                placeholder="Company Name"
                className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500"
              />

              <input
                type="text"
                placeholder="Job Title"
                className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500"
              />

              <textarea
                placeholder="Describe your experience..."
                rows={4}
                className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Education */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold">
              Education
            </h3>

            <div className="mt-4 space-y-4">
              <input
                type="text"
                placeholder="College / University"
                className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500"
              />

              <input
                type="text"
                placeholder="Degree"
                className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <button
            type="button"
            className="mt-8 rounded-lg bg-green-500 px-6 py-3 font-medium text-white hover:bg-green-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}