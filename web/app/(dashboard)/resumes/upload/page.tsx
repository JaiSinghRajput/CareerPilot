"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function ResumeUploadPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
    }
  }

  async function handleUpload() {
    if (!file) {
      toast.error("Please select a resume first.");
      return;
    }

    setIsUploading(true);

    const toastId = toast.loading("Uploading & analyzing resume... Please wait.", {
      position: "bottom-right",
    });

    try {
      if (!isLoaded) {
        toast.dismiss(toastId);
        toast.error("Clerk is still loading. Please try again.");
        return;
      }

      if (!isSignedIn) {
        toast.dismiss(toastId);
        toast.error("You are not signed in.");
        return;
      }

      const token = await getToken();

      if (!token) {
        toast.dismiss(toastId);
        toast.error("Clerk session exists, but no JWT token was received.");
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

      toast.dismiss(toastId);
      toast.success("Resume uploaded successfully!", { position: "bottom-right" });
      setFile(null); // Reset form

      // Redirect to the new resume detail page
      if (result.data && result.data.resumeId) {
        router.push(`/resumes/${result.data.resumeId}`);
      } else {
        router.push("/resumes");
      }
    } catch (error) {
      console.error("Resume upload failed:", error);
      toast.dismiss(toastId);
      toast.error(error instanceof Error ? error.message : "Failed to upload resume.", { position: "bottom-right" });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Upload Resume</h1>
          <p className="mt-2 text-text-secondary">
            Upload your resume and let CareerPilot AI analyze it.
          </p>
        </div>

        <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center glass-card">
          <h2 className="text-xl font-semibold">
            Choose a file
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Supported formats: PDF and DOCX
          </p>

          <label className="mt-6 primary-button cursor-pointer inline-block">
            Select File
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {file && (
            <div className="mt-6 rounded-2xl bg-surface-hover p-4 text-left border border-border">
              <p className="text-sm font-medium">Selected file:</p>
              <p className="mt-1 text-sm text-text-secondary truncate">{file.name}</p>
            </div>
          )}

          {file && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className={`mt-6 w-full secondary-button ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? "Uploading & Analyzing..." : "Upload & Analyze"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
