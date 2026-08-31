export default function DashboardPage() {
  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <p className="mt-2 text-slate-600">
          Track your resume and job search progress.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Resume Score
          </p>

          <p className="mt-4 text-4xl font-bold">--</p>

          <p className="mt-2 text-sm text-slate-500">
            Upload a resume to get your score.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            ATS Match
          </p>

          <p className="mt-4 text-4xl font-bold">--</p>

          <p className="mt-2 text-sm text-slate-500">
            Analyze your resume to see ATS compatibility.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Saved Jobs
          </p>

          <p className="mt-4 text-4xl font-bold">0</p>

          <p className="mt-2 text-sm text-slate-500">
            Your saved jobs will appear here.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h2 className="text-xl font-semibold">
          Start building your resume
        </h2>

        <p className="mt-2 text-slate-500">
          Upload your existing resume and let CareerPilot AI analyze it.
        </p>

        <a
          href="/resume"
          className="mt-6 inline-block rounded-lg bg-green-500 px-6 py-3 font-medium text-white hover:bg-green-600"
        >
          Open Resume Builder
        </a>
      </div>
    </div>
  );
}