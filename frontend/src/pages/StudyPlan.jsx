import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const STATUS_OPTIONS = [
  { value: "pending", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "skipped", label: "Skipped" },
];

const STATUS_STYLES = {
  pending: "border-slate-300 text-slate-600",
  in_progress: "border-blue-300 text-blue-700 bg-blue-50",
  completed: "border-green-300 text-green-700 bg-green-50",
  skipped: "border-slate-200 text-slate-400 bg-slate-50",
};

export default function StudyPlan() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  const [hours, setHours] = useState(2);
  const [days, setDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
  const [weeks, setWeeks] = useState(12);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    apiClient
      .get("/study-plan/me")
      .then((res) => {
        setPlan(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status !== 404) {
          setError(err.response?.data?.detail || "Could not load your study plan.");
        }
        setPlan(null);
        setLoading(false);
      });
  }, []);

  function toggleDay(day) {
    setDays(days.includes(day) ? days.filter((d) => d !== day) : [...days, day]);
  }

  async function createPlan(e) {
    e.preventDefault();
    setError("");
    if (days.length === 0) {
      setError("Pick at least one study day.");
      return;
    }
    setCreating(true);
    try {
      const res = await apiClient.post("/study-plan/me", {
        hours_per_day: parseFloat(hours),
        study_days: days,
        weeks: parseInt(weeks, 10),
      });
      setPlan(res.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Could not create your plan. Check your inputs.");
    } finally {
      setCreating(false);
    }
  }

  async function updateStatus(taskId, newStatus) {
    try {
      const res = await apiClient.patch(`/study-plan/me/tasks/${taskId}`, { status: newStatus });
      setPlan(res.data);
    } catch (err) {
      setError("Could not update that task. Please try again.");
    }
  }

  async function resetPlan() {
    if (!window.confirm("Delete this plan and start over?")) return;
    try {
      await apiClient.delete("/study-plan/me");
      setPlan(null);
      setError("");
    } catch (err) {
      setError("Could not delete your plan. Please try again.");
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading your study plan...</div>;
  }

  // ---------- No plan yet: show the creation form ----------
  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-xl mx-auto">
          <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-700">
            ← Back to profile
          </Link>

          <div className="bg-white rounded-2xl shadow-sm p-8 mt-4">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Create your study plan</h1>
            <p className="text-slate-500 text-sm mb-6">
              We'll turn your skill gaps into a schedule that fits your week.
            </p>

            <form onSubmit={createPlan} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hours per day</label>
                  <input
                    type="number"
                    min="0.5"
                    max="12"
                    step="0.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Number of weeks</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={weeks}
                    onChange={(e) => setWeeks(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Study days</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${
                        days.includes(day)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-300 hover:border-blue-300"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition"
              >
                {creating ? "Building your plan..." : "Generate plan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Plan exists: show progress + tasks grouped by week ----------
  const tasksByWeek = {};
  plan.tasks.forEach((task) => {
    if (!tasksByWeek[task.week]) tasksByWeek[task.week] = [];
    tasksByWeek[task.week].push(task);
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-700">
            ← Back to profile
          </Link>
          <button onClick={resetPlan} className="text-sm text-slate-400 hover:text-red-600">
            Reset plan
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mt-4 mb-5">
          <p className="text-sm text-slate-500">Study plan for</p>
          <h1 className="text-2xl font-bold text-slate-800 mb-4">{plan.target_role}</h1>

          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">
              {plan.progress.completed} of {plan.progress.total} sessions completed
            </span>
            <span className="font-medium text-slate-800">{plan.progress.percent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-green-500 transition-all"
              style={{ width: `${plan.progress.percent}%` }}
            />
          </div>

          <p className="text-xs text-slate-400 mt-3">
            {plan.settings.hours_per_day}h/day · {plan.settings.study_days.map((d) => d.slice(0, 3)).join(", ")} ·{" "}
            {plan.scheduled_hours}h scheduled of {plan.total_required_hours}h needed
          </p>
        </div>

        {!plan.fits_in_timeframe && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-4 mb-5">
            Your plan covers {plan.scheduled_hours}h of the {plan.total_required_hours}h of courses
            needed. Reset the plan and add more weeks, days or hours to fit everything.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-5">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {Object.entries(tasksByWeek).map(([week, tasks]) => (
            <div key={week} className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Week {week}</h2>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 border border-slate-200 rounded-lg p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">{task.day}</p>
                      <p
                        className={`font-medium truncate ${
                          task.status === "completed" || task.status === "skipped"
                            ? "text-slate-400 line-through"
                            : "text-slate-800"
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {task.skill} · {task.hours}h
                        <span
                          className={`ml-2 px-1.5 py-0.5 rounded-full ${
                            task.priority === "high" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </p>
                    </div>
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      className={`text-sm border rounded-lg px-2 py-1.5 bg-white ${STATUS_STYLES[task.status]}`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
