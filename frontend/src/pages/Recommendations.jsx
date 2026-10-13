import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";

export default function Recommendations() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    apiClient
      .get("/learning/recommendations/me")
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Could not load recommendations.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Finding courses for you...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 text-center">
          <p className="text-amber-600 font-medium mb-2">Can't show recommendations yet</p>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <Link to="/profile" className="text-blue-600 font-medium hover:underline">
            Go to your profile →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-700">
          ← Back to dashboard
        </Link>

        <div className="mt-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Recommended Learning</h1>
          <p className="text-slate-500 text-sm">
            Courses to help close your skill gaps for <span className="font-medium">{data.target_role}</span>
          </p>
        </div>

        {data.recommendations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-slate-500">
              No gaps to recommend courses for right now — either you've matched everything we
              track, or we don't have course data for your remaining gaps yet. 🎉
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.recommendations.map((group) => (
              <div key={group.skill} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">{group.skill}</h2>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      group.priority === "high"
                        ? "bg-red-50 text-red-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {group.priority === "high" ? "High Priority" : "Medium Priority"}
                  </span>
                </div>

                <div className="space-y-3">
                  {group.resources.map((res) => (
                    <a
                      key={res.title}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/30 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-800">{res.title}</p>
                          <p className="text-sm text-slate-500">{res.provider}</p>
                        </div>
                        <div className="text-right text-xs text-slate-400 whitespace-nowrap ml-4">
                          <div>{res.difficulty}</div>
                          <div>{res.duration_hours}h</div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
