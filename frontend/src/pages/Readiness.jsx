import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";

const CATEGORY_LABELS = {
  skills: "Skills Match",
  profile_completeness: "Profile Completeness",
  projects: "Projects",
  certifications: "Certifications",
};

export default function Readiness() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    apiClient
      .get("/readiness/me")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Could not load your readiness score.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Calculating readiness...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 text-center">
          <p className="text-amber-600 font-medium mb-2">Can't show your readiness score yet</p>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <Link to="/profile" className="text-blue-600 font-medium hover:underline">
            Go to your profile →
          </Link>
        </div>
      </div>
    );
  }

  const scoreColor =
    data.overall_score >= 75 ? "text-green-600" :
    data.overall_score >= 50 ? "text-amber-600" :
    "text-red-500";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8 mt-4 mb-5 text-center">
          <p className="text-sm text-slate-500 mb-1">Career Readiness</p>
          <div className={`text-6xl font-extrabold ${scoreColor}`}>
            {data.overall_score}
            <span className="text-2xl text-slate-400 font-medium"> / 100</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(data.breakdown).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">
                    {CATEGORY_LABELS[key] || key}
                    <span className="text-slate-400 ml-1">({data.weights[key]}%)</span>
                  </span>
                  <span className="font-medium text-slate-800">{value}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800">
          <p className="font-medium mb-1">How this is calculated</p>
          <p>
            Your score blends how well your skills match your target role, how complete your
            profile is, and how many projects and certifications you've added. Fill out more
            of your profile and add projects to raise your score.
          </p>
        </div>

        <div className="flex gap-4 mt-5">
          <Link to="/skill-gap" className="text-blue-600 font-medium hover:underline text-sm">
            View Skill Gap →
          </Link>
          <Link to="/profile" className="text-blue-600 font-medium hover:underline text-sm">
            Edit Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}
