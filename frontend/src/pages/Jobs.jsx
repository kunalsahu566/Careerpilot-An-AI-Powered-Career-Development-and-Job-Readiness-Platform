import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";

function badgeClasses(percent) {
  if (percent >= 75) return "bg-green-50 text-green-700 border-green-200";
  if (percent >= 50) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-500 border-slate-200";
}

function MiniBar({ label, value }) {
  return (
    <div className="flex-1 min-w-[90px]">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function Jobs() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [onlyMyRole, setOnlyMyRole] = useState(false);
  const [minMatch, setMinMatch] = useState(0);

  useEffect(() => {
    apiClient
      .get("/jobs/matches/me")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Could not load job matches.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Matching you with jobs...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 text-center">
          <p className="text-amber-600 font-medium mb-2">Can't show job matches yet</p>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <Link to="/dashboard" className="text-blue-600 font-medium hover:underline">
            ← Back to profile
          </Link>
        </div>
      </div>
    );
  }

  const visibleJobs = data.jobs.filter((job) => {
    if (onlyMyRole && data.target_role && job.role !== data.target_role) return false;
    if (job.match_percent < minMatch) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to profile
        </Link>

        <div className="mt-4 mb-5">
          <h1 className="text-2xl font-bold text-slate-800">Jobs matched to you</h1>
          <p className="text-slate-500 text-sm">
            Ranked by how well your skills, education and location fit each role.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 mb-5 flex flex-wrap items-center gap-4">
          <label className={`flex items-center gap-2 text-sm ${data.target_role ? "text-slate-700" : "text-slate-300"}`}>
            <input
              type="checkbox"
              checked={onlyMyRole}
              disabled={!data.target_role}
              onChange={(e) => setOnlyMyRole(e.target.checked)}
            />
            Only {data.target_role ? data.target_role : "my target role"} jobs
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            Minimum match
            <select
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-2 py-1 bg-white"
            >
              <option value={0}>Any</option>
              <option value={50}>50%+</option>
              <option value={75}>75%+</option>
            </select>
          </label>

          <span className="text-sm text-slate-400 ml-auto">
            Showing {visibleJobs.length} of {data.total}
          </span>
        </div>

        {data.total === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-slate-500">
            No jobs in the database yet. Run <code className="bg-slate-100 px-1 rounded">python3 -m app.seed_jobs</code> in
            the backend folder to add sample listings.
          </div>
        ) : visibleJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-slate-500">
            No jobs match those filters. Try lowering the minimum match.
          </div>
        ) : (
          <div className="space-y-4">
            {visibleJobs.map((job) => (
              <div key={job.job_id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-800">{job.title}</h2>
                    <p className="text-sm text-slate-500">
                      {job.company} · {job.location}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {job.job_type}
                      {job.experience ? ` · ${job.experience}` : ""}
                    </p>
                  </div>
                  <div className={`border rounded-xl px-3 py-2 text-center shrink-0 ${badgeClasses(job.match_percent)}`}>
                    <div className="text-2xl font-bold leading-none">{job.match_percent}%</div>
                    <div className="text-[10px] uppercase tracking-wide mt-1">match</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-4">
                  <MiniBar label="Skills" value={job.breakdown.skills} />
                  <MiniBar label="Education" value={job.breakdown.education} />
                  <MiniBar label="Location" value={job.breakdown.location} />
                </div>

                <div className="mt-4 space-y-2">
                  {job.matched_skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-slate-400 mr-1">You have</span>
                      {job.matched_skills.map((s) => (
                        <span key={s} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {job.missing_skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-slate-400 mr-1">Required, missing</span>
                      {job.missing_skills.map((s) => (
                        <span key={s} className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full">
                          ⚠ {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {job.missing_preferred.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-slate-400 mr-1">Nice to have</span>
                      {job.missing_preferred.map((s) => (
                        <span key={s} className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-400 text-center mt-6">
          Sample listings for demonstration. Companies shown are fictional.
        </p>
      </div>
    </div>
  );
}
