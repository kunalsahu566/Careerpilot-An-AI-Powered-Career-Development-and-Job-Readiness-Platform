import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";

function scoreColor(value) {
  if (value >= 75) return "text-green-600";
  if (value >= 50) return "text-amber-600";
  return "text-red-500";
}

function Card({ title, to, linkLabel, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</h2>
        {to && (
          <Link to={to} className="text-sm text-blue-600 font-medium hover:underline">
            {linkLabel} →
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message, to, cta }) {
  return (
    <div>
      <p className="text-sm text-slate-500 mb-3">{message}</p>
      <Link
        to={to}
        className="inline-block text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 rounded-lg transition"
      >
        {cta}
      </Link>
    </div>
  );
}

/**
 * Picks the single most useful thing for the student to do next, using
 * only data the dashboard has already loaded.
 */
export function chooseNextAction({ skillGap, skillGapNeedsRole, plan, apps }) {
  if (skillGapNeedsRole) {
    return {
      text: "Set a target role to unlock your skill gap, learning plan and job matching.",
      to: "/profile",
      cta: "Edit profile",
    };
  }

  const highGaps = skillGap ? skillGap.missing_high_priority.length : 0;
  if (!plan && highGaps > 0) {
    return {
      text: `You have ${highGaps} high-priority skill gap${highGaps === 1 ? "" : "s"}. Turn them into a study schedule.`,
      to: "/study-plan",
      cta: "Create study plan",
    };
  }

  if (apps && apps.stats.total === 0) {
    return {
      text: "Save a job you'd like to apply to and start tracking it.",
      to: "/jobs",
      cta: "Browse jobs",
    };
  }

  const savedCount = apps ? apps.stats.by_status.saved : 0;
  if (savedCount > 0) {
    return {
      text: `${savedCount} saved job${savedCount === 1 ? "" : "s"} still waiting for you to apply.`,
      to: "/applications",
      cta: "Open tracker",
    };
  }

  if (plan && plan.progress.percent < 100) {
    return {
      text: "Keep your study plan moving. Your next session is waiting.",
      to: "/study-plan",
      cta: "Open study plan",
    };
  }

  return {
    text: "You're on track. Explore more jobs that match your profile.",
    to: "/jobs",
    cta: "Browse jobs",
  };
}

export function DashboardView({ user, data }) {
  const { readiness, skillGap, skillGapNeedsRole, plan, apps, jobs } = data;
  const firstName = (user?.name || "there").split(" ")[0];
  const next = chooseNextAction(data);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {firstName}</h1>
        <p className="text-slate-500 text-sm mb-6">Here's where your career prep stands today.</p>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Next best step</p>
            <p className="text-slate-700">{next.text}</p>
          </div>
          <Link
            to={next.to}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            {next.cta}
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Readiness */}
          <Card title="Career readiness" to="/readiness" linkLabel="Breakdown">
            {readiness ? (
              <div>
                <div className={`text-5xl font-extrabold ${scoreColor(readiness.overall_score)}`}>
                  {readiness.overall_score}
                  <span className="text-xl text-slate-400 font-medium"> / 100</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Skills {readiness.breakdown.skills}% · Profile {readiness.breakdown.profile_completeness}% ·
                  Projects {readiness.breakdown.projects}%
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Readiness score isn't available right now.</p>
            )}
          </Card>

          {/* Skill match */}
          <Card title="Skill match" to="/skill-gap" linkLabel="Details">
            {skillGapNeedsRole ? (
              <EmptyState message="Choose a target role to see how your skills measure up." to="/profile" cta="Set target role" />
            ) : skillGap ? (
              <div>
                <p className="text-sm text-slate-500">{skillGap.target_role}</p>
                <div className={`text-5xl font-extrabold ${scoreColor(skillGap.overall_match_percent)}`}>
                  {skillGap.overall_match_percent}%
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {skillGap.missing_high_priority.length === 0
                    ? "No required skills missing"
                    : `Missing required: ${skillGap.missing_high_priority.join(", ")}`}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Skill match isn't available right now.</p>
            )}
          </Card>

          {/* Study plan */}
          <Card title="Study plan" to="/study-plan" linkLabel="Open">
            {plan ? (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">
                    {plan.progress.completed} of {plan.progress.total} sessions done
                  </span>
                  <span className="font-medium text-slate-800">{plan.progress.percent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="h-2.5 rounded-full bg-green-500" style={{ width: `${plan.progress.percent}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {plan.settings.hours_per_day}h/day for {plan.target_role}
                </p>
              </div>
            ) : skillGapNeedsRole ? (
              <p className="text-sm text-slate-500">Set a target role first, then build a plan around your gaps.</p>
            ) : (
              <EmptyState message="No study plan yet. Turn your skill gaps into a schedule." to="/study-plan" cta="Create plan" />
            )}
          </Card>

          {/* Applications */}
          <Card title="Applications" to="/applications" linkLabel="Tracker">
            {apps && apps.stats.total > 0 ? (
              <div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    ["Saved", apps.stats.funnel.saved],
                    ["Applied", apps.stats.funnel.applied],
                    ["Interview", apps.stats.funnel.interview],
                    ["Offer", apps.stats.funnel.offer],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-slate-50 rounded-xl py-2">
                      <div className="text-xl font-bold text-slate-800">{value}</div>
                      <div className="text-[11px] text-slate-500">{label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">{apps.stats.total} jobs tracked</p>
              </div>
            ) : (
              <EmptyState message="You haven't saved any jobs yet." to="/jobs" cta="Find jobs" />
            )}
          </Card>

          {/* Top job matches */}
          <Card title="Top job matches" to="/jobs" linkLabel="See all jobs" className="md:col-span-2">
            {jobs && jobs.jobs.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {jobs.jobs.slice(0, 3).map((job) => (
                  <div key={job.job_id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">{job.title}</p>
                      <p className="text-sm text-slate-500 truncate">
                        {job.company} · {job.location}
                      </p>
                    </div>
                    <span className={`text-lg font-bold ml-4 ${scoreColor(job.match_percent)}`}>
                      {job.match_percent}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No job matches to show yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      apiClient.get("/readiness/me"),
      apiClient.get("/skill-gap/me"),
      apiClient.get("/study-plan/me"),
      apiClient.get("/applications/me"),
      apiClient.get("/jobs/matches/me"),
    ]).then((results) => {
      // Every request rejected with 401 means the session expired: send them to log in.
      const allUnauthorized = results.every(
        (r) => r.status === "rejected" && r.reason?.response?.status === 401
      );
      if (allUnauthorized) {
        logout();
        return;
      }

      const [readiness, skillGap, plan, apps, jobs] = results;
      const value = (r) => (r.status === "fulfilled" ? r.value.data : null);

      setData({
        readiness: value(readiness),
        skillGap: value(skillGap),
        skillGapNeedsRole: skillGap.status === "rejected" && skillGap.reason?.response?.status === 400,
        plan: value(plan),
        apps: value(apps),
        jobs: value(jobs),
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading your dashboard...
      </div>
    );
  }

  return <DashboardView user={user} data={data} />;
}
