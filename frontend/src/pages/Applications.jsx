import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";

const STATUSES = [
  { value: "saved", label: "Saved", style: "bg-slate-100 text-slate-700 border-slate-300" },
  { value: "applied", label: "Applied", style: "bg-blue-50 text-blue-700 border-blue-300" },
  { value: "assessment", label: "Assessment", style: "bg-purple-50 text-purple-700 border-purple-300" },
  { value: "interview", label: "Interview", style: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: "shortlisted", label: "Shortlisted", style: "bg-teal-50 text-teal-700 border-teal-300" },
  { value: "offer", label: "Offer", style: "bg-green-50 text-green-700 border-green-300" },
  { value: "rejected", label: "Rejected", style: "bg-red-50 text-red-700 border-red-300" },
];

const FUNNEL_STAGES = STATUSES.slice(0, 6);
const STATUS_BY_VALUE = Object.fromEntries(STATUSES.map((s) => [s.value, s]));

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function ApplicationCard({ application, onStatusChange, onNotesSave, onRemove }) {
  const [notes, setNotes] = useState(application.notes);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setNotes(application.notes);
  }, [application.notes]);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800">{application.title}</h3>
          <p className="text-sm text-slate-500">
            {application.company} · {application.location}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Updated {formatDate(application.updated_at)}</p>
        </div>
        <select
          value={application.status}
          onChange={(e) => onStatusChange(application.application_id, e.target.value)}
          className={`text-sm font-medium border rounded-lg px-2 py-1.5 ${STATUS_BY_VALUE[application.status].style}`}
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => {
          if (notes !== application.notes) onNotesSave(application.application_id, notes);
        }}
        placeholder="Notes: referral, contact person, interview date..."
        rows={2}
        maxLength={2000}
        className="w-full mt-3 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700"
      />

      <div className="flex justify-between items-center mt-2">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs text-blue-600 hover:underline"
        >
          {showHistory ? "Hide history" : `History (${application.history.length})`}
        </button>
        <button
          onClick={() => onRemove(application.application_id)}
          className="text-xs text-slate-400 hover:text-red-600"
        >
          Remove
        </button>
      </div>

      {showHistory && (
        <ol className="mt-3 border-l-2 border-slate-200 pl-4 space-y-2">
          {application.history.map((entry, i) => (
            <li key={i} className="text-sm">
              <span className="font-medium text-slate-700">{STATUS_BY_VALUE[entry.status]?.label || entry.status}</span>
              <span className="text-slate-400"> · {formatDate(entry.at)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function Applications() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("all");

  async function load() {
    try {
      const res = await apiClient.get("/applications/me");
      setData(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Could not load your applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(id, status) {
    try {
      await apiClient.patch(`/applications/me/${id}`, { status });
      await load();
    } catch (err) {
      setError("Could not update that status. Please try again.");
    }
  }

  async function saveNotes(id, notes) {
    try {
      await apiClient.patch(`/applications/me/${id}`, { notes });
      await load();
    } catch (err) {
      setError("Could not save your notes. Please try again.");
    }
  }

  async function removeApplication(id) {
    if (!window.confirm("Remove this application from your tracker?")) return;
    try {
      await apiClient.delete(`/applications/me/${id}`);
      await load();
    } catch (err) {
      setError("Could not remove that application. Please try again.");
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading your applications...</div>;
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 text-center">
          <p className="text-amber-600 font-medium mb-2">Can't show your applications yet</p>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <Link to="/profile" className="text-blue-600 font-medium hover:underline">
            Go to your profile →
          </Link>
        </div>
      </div>
    );
  }

  const { applications, stats } = data;
  const visible = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center">
          <Link to="/dashboard" className="text-sm text-slate-500 hover:text-slate-700">
            ← Back to dashboard
          </Link>
          <Link to="/jobs" className="text-sm text-blue-600 font-medium hover:underline">
            Find more jobs →
          </Link>
        </div>

        <div className="mt-4 mb-5">
          <h1 className="text-2xl font-bold text-slate-800">My applications</h1>
          <p className="text-slate-500 text-sm">
            {stats.total} tracked · {stats.by_status.rejected} rejected
          </p>
        </div>

        {/* Funnel: how many applications have ever reached each stage */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
          {FUNNEL_STAGES.map((stage) => (
            <div key={stage.value} className={`border rounded-xl p-3 text-center ${stage.style}`}>
              <div className="text-2xl font-bold leading-none">{stats.funnel[stage.value]}</div>
              <div className="text-[11px] mt-1">{stage.label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Each box counts every application that has reached that stage, including ones that were
          rejected later.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-5">{error}</div>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-full text-sm border ${
              filter === "all" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-300"
            }`}
          >
            All ({stats.total})
          </button>
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-1 rounded-full text-sm border ${
                filter === s.value ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-300"
              }`}
            >
              {s.label} ({stats.by_status[s.value]})
            </button>
          ))}
        </div>

        {stats.total === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-slate-500">
            Nothing here yet. Open the{" "}
            <Link to="/jobs" className="text-blue-600 font-medium hover:underline">
              Jobs page
            </Link>{" "}
            and click <span className="font-medium">Save job</span> on a listing to start tracking it.
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-slate-500">
            No applications with that status.
          </div>
        ) : (
          <div className="space-y-4">
            {visible.map((application) => (
              <ApplicationCard
                key={application.application_id}
                application={application}
                onStatusChange={changeStatus}
                onNotesSave={saveNotes}
                onRemove={removeApplication}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
