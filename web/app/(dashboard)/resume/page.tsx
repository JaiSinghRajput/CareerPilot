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

  const [resumeId, setResumeId] = useState<number | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [chatId, setChatId] = useState<number | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

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

    if (result?.data) {
      setResumeId(result.data.resumeId ?? null);
      setParsedData(result.data.parsedData ?? null);

      console.log("Resume ID:", result.data.resumeId);
      console.log("Parsed Data:", result.data.parsedData);
    }

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

async function handleChatSend() {
  if (!chatInput.trim()) {
    return;
  }

  if (!isLoaded) {
    alert("Clerk is still loading. Please try again.");
    return;
  }

  if (!isSignedIn) {
    alert("You are not signed in.");
    return;
  }

  try {
    setIsChatLoading(true);

    const token = await getToken();
    console.log("Token exists:", !!token);

    if (!token) {
      alert("No authentication token received.");
      return;
    }

    const userMessage = chatInput.trim();

    // Show user's message immediately
    setChatMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    // Clear input
    setChatInput("");

    const result = await apiRequest(
      "/api/v1/ai/chat",
      token,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userMessage,
          ...(chatId !== null ? { chatId } : {}),
        }),
      }
    );

    console.log("Chat response:", result);

    if (result?.data?.chatId) {
      setChatId(result.data.chatId);
    }

    if (result?.data?.reply) {
      setChatMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: result.data.reply,
        },
      ]);
    }
  } catch (error) {
    console.error("AI chat failed:", error);

    setChatMessages((previous) => [
      ...previous,
      {
        role: "assistant",
        content:
          error instanceof Error
            ? `Sorry, something went wrong: ${error.message}`
            : "Sorry, I couldn't process your request.",
      },
    ]);
  } finally {
    setIsChatLoading(false);
  }
}

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
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
        
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Resume Editor */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
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
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
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
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
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

          {/* AI Assistant */}
          <div className="self-start h-fit lg:sticky lg:top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg">
                🤖
              </div>

              <div>
                <h2 className="font-semibold">AI Assistant</h2>
                <p className="text-xs text-slate-500">
                  Get help improving your resume
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="mt-5 h-[420px] overflow-y-auto rounded-xl bg-slate-50 p-4">
              {chatMessages.length === 0 ? (
                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <p className="text-sm">
                    Hi! 👋 I'm your CareerPilot AI assistant.
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Ask me to improve your resume, fix grammar, or make your
                    experience more professional.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={
                        message.role === "user"
                          ? "ml-8 rounded-lg bg-green-500 p-3 text-white"
                          : "mr-8 rounded-lg bg-white p-3 shadow-sm"
                      }
                    >
                      <p className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </p>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="mr-8 rounded-lg bg-white p-3 shadow-sm">
                      <p className="text-sm text-slate-500">
                        AI is thinking...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleChatSend();
                  }
                }}
                placeholder="Ask AI something..."
                disabled={isChatLoading}
                className="min-w-0 flex-1 rounded-lg border p-3 text-sm outline-none focus:ring-2 focus:ring-green-500 disabled:bg-slate-100"
              />

              <button
                type="button"
                onClick={handleChatSend}
                disabled={isChatLoading || !chatInput.trim()}
                className="rounded-lg bg-green-500 px-4 py-3 text-sm font-medium text-white hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isChatLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}