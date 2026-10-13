import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";

export default function SkillGap() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    apiClient
      .get("/skill-gap/me")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.data?.detail ||
            "Could not load your skill gap analysis. Please try again."
        );
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Analyzing your skills...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 text-center">
          <p className="text-amber-600 font-medium mb-2">Can't show your skill gap yet</p>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <Link to="/profile" className="text-blue-600 font-medium hover:underline">
            Go to your profile →
          </Link>
        </div>
      </div>
    );
  }

  const matchColor =
    data.overall_match_percent >= 75 ? "text-green-600" :
    data.overall_match_percent >= 50 ? "text-amber-600" :
    "text-red-500";

  const barColor =
    data.overall_match_percent >= 75 ? "bg-green-500" :
    data.overall_match_percent >= 50 ? "bg-amber-500" :
    "bg-red-400";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8 mt-4 mb-5 text-center">
          <p className="text-sm text-slate-500 mb-1">Target Role</p>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">{data.target_role}</h1>

          <div className={`text-5xl font-extrabold ${matchColor}`}>
            {data.overall_match_percent}%
          </div>
          <p className="text-slate-500 text-sm mt-1">Overall Skill Match</p>

          <div className="w-full bg-slate-100 rounded-full h-3 mt-6">
            <div
              className={`h-3 rounded-full ${barColor} transition-all`}
              style={{ width: `${data.overall_match_percent}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            ✓ Matched Skills ({data.matched_skills.length})
          </h2>
          {data.matched_skills.length === 0 ? (
            <p className="text-slate-400 text-sm">No matches yet — add skills to your profile that align with this role.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.matched_skills.map((skill) => (
                <span key={skill} className="bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">
            ⚠ High Priority Gaps ({data.missing_high_priority.length})
          </h2>
          <p className="text-xs text-slate-400 mb-4">Required skills for this role that you don't have yet</p>
          {data.missing_high_priority.length === 0 ? (
            <p className="text-slate-400 text-sm">You have all the required skills for this role. 🎉</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.missing_high_priority.map((skill) => (
                <span key={skill} className="bg-red-50 text-red-700 text-sm px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">
            ○ Medium Priority Gaps ({data.missing_medium_priority.length})
          </h2>
          <p className="text-xs text-slate-400 mb-4">Preferred skills that would strengthen your profile</p>
          {data.missing_medium_priority.length === 0 ? (
            <p className="text-slate-400 text-sm">No preferred-skill gaps. Nice work.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.missing_medium_priority.map((skill) => (
                <span key={skill} className="bg-amber-50 text-amber-700 text-sm px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}