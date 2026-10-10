import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";

const emptyProject = { name: "", description: "", technologies: [], github_url: "", role: "", duration: "" };

export default function Profile() {
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [location, setLocation] = useState("");
  const [education, setEducation] = useState({ degree: "", branch: "", semester: "", cgpa: "", graduation_year: "", college: "" });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [projects, setProjects] = useState([]);
  const [careerGoal, setCareerGoal] = useState({ target_role: "", preferred_industry: "", preferred_location: "", target_companies: [], expected_salary: "" });
  const [companyInput, setCompanyInput] = useState("");
  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    apiClient.get("/profile/me").then((res) => {
      const p = res.data;
      setLocation(p.location || "");
      if (p.education) {
        setEducation((prev) => ({
          ...prev,
          ...p.education,
          cgpa: p.education.cgpa ?? "",
          graduation_year: p.education.graduation_year ?? "",
        }));
      }
      setSkills(p.skills || []);
      setProjects(p.projects && p.projects.length ? p.projects : []);
      if (p.career_goal) {
        setCareerGoal((prev) => ({ ...prev, ...p.career_goal }));
      }
      setLoading(false);
    });

    apiClient.get("/roles").then((res) => {
      setAvailableRoles(res.data);
    }).catch(() => {
      setAvailableRoles([]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addSkill() {
    const val = skillInput.trim();
    if (val && !skills.includes(val)) {
      setSkills([...skills, val]);
    }
    setSkillInput("");
  }

  function removeSkill(skill) {
    setSkills(skills.filter((s) => s !== skill));
  }

  function addCompany() {
    const val = companyInput.trim();
    if (val && !careerGoal.target_companies.includes(val)) {
      setCareerGoal({ ...careerGoal, target_companies: [...careerGoal.target_companies, val] });
    }
    setCompanyInput("");
  }

  function removeCompany(company) {
    setCareerGoal({ ...careerGoal, target_companies: careerGoal.target_companies.filter((c) => c !== company) });
  }

  function addProject() {
    setProjects([...projects, { ...emptyProject }]);
  }

  function updateProject(index, field, value) {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  }

  function updateProjectTech(index, value) {
    updateProject(index, "technologies", value.split(",").map((t) => t.trim()).filter(Boolean));
  }

  function removeProject(index) {
    setProjects(projects.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage("");
    try {
      const payload = {
        location: location || null,
        education: {
          ...education,
          cgpa: education.cgpa === "" ? null : parseFloat(education.cgpa),
          graduation_year: education.graduation_year === "" ? null : parseInt(education.graduation_year, 10),
        },
        skills,
        projects,
        career_goal: careerGoal,
      };
      await apiClient.put("/profile/me", payload);
      setSaveMessage("Saved!");
      setTimeout(() => setSaveMessage(""), 2000);
    } catch (err) {
      setSaveMessage(err.response?.data?.detail || "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Your Profile</h1>
            <p className="text-slate-500">{user?.name} · {user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/skill-gap" className="text-sm text-blue-600 font-medium hover:underline">
              View Skill Gap →
            </Link>
            <Link to="/readiness" className="text-sm text-blue-600 font-medium hover:underline">
              Readiness Score →
            </Link>
            <Link to="/learning" className="text-sm text-blue-600 font-medium hover:underline">
              Learning →
            </Link>
            <Link to="/study-plan" className="text-sm text-blue-600 font-medium hover:underline">
              Study Plan →
            </Link>
            <button onClick={logout} className="text-sm text-slate-500 hover:text-red-600">
              Log out
            </button>
          </div>
        </div>

        <Section title="Location">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          />
        </Section>

        <Section title="Education">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Degree" value={education.degree} onChange={(v) => setEducation({ ...education, degree: v })} placeholder="B.Tech" />
            <Input label="Branch" value={education.branch} onChange={(v) => setEducation({ ...education, branch: v })} placeholder="Computer Science" />
            <Input label="College" value={education.college} onChange={(v) => setEducation({ ...education, college: v })} placeholder="Your college" />
            <Input label="Semester" value={education.semester} onChange={(v) => setEducation({ ...education, semester: v })} placeholder="7th" />
            <Input label="CGPA" value={education.cgpa} onChange={(v) => setEducation({ ...education, cgpa: v })} placeholder="8.2" type="number" step="0.01" />
            <Input label="Graduation Year" value={education.graduation_year} onChange={(v) => setEducation({ ...education, graduation_year: v })} placeholder="2027" type="number" />
          </div>
        </Section>

        <Section title="Skills">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              placeholder="e.g. Python, SQL, React"
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2"
            />
            <button onClick={addSkill} type="button" className="bg-slate-800 text-white px-4 rounded-lg hover:bg-slate-700">
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full flex items-center gap-2">
                {skill}
                <button onClick={() => removeSkill(skill)} className="text-blue-400 hover:text-blue-700">×</button>
              </span>
            ))}
          </div>
        </Section>

        <Section title="Career Goal">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Role</label>
              <select
                value={careerGoal.target_role || ""}
                onChange={(e) => setCareerGoal({ ...careerGoal, target_role: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="">Select a target role...</option>
                {availableRoles.map((r) => (
                  <option key={r.role_name} value={r.role_name}>{r.role_name}</option>
                ))}
              </select>
            </div>
            <Input label="Preferred Industry" value={careerGoal.preferred_industry} onChange={(v) => setCareerGoal({ ...careerGoal, preferred_industry: v })} placeholder="Fintech" />
            <Input label="Preferred Location" value={careerGoal.preferred_location} onChange={(v) => setCareerGoal({ ...careerGoal, preferred_location: v })} placeholder="Bangalore" />
            <Input label="Expected Salary" value={careerGoal.expected_salary} onChange={(v) => setCareerGoal({ ...careerGoal, expected_salary: v })} placeholder="8-12 LPA" />
          </div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Target Companies</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCompany(); } }}
              placeholder="e.g. Google"
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2"
            />
            <button onClick={addCompany} type="button" className="bg-slate-800 text-white px-4 rounded-lg hover:bg-slate-700">
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {careerGoal.target_companies.map((c) => (
              <span key={c} className="bg-purple-50 text-purple-700 text-sm px-3 py-1 rounded-full flex items-center gap-2">
                {c}
                <button onClick={() => removeCompany(c)} className="text-purple-400 hover:text-purple-700">×</button>
              </span>
            ))}
          </div>
        </Section>

        <Section title="Projects">
          <div className="space-y-4">
            {projects.map((project, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4 relative">
                <button
                  onClick={() => removeProject(i)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-600 text-sm"
                >
                  Remove
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Project Name" value={project.name} onChange={(v) => updateProject(i, "name", v)} placeholder="Customer Churn Prediction" />
                  <Input label="Role" value={project.role} onChange={(v) => updateProject(i, "role", v)} placeholder="Lead Developer" />
                  <Input label="GitHub URL" value={project.github_url} onChange={(v) => updateProject(i, "github_url", v)} placeholder="https://github.com/..." />
                  <Input label="Duration" value={project.duration} onChange={(v) => updateProject(i, "duration", v)} placeholder="2 months" />
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(i, "description", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                    rows={2}
                  />
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Technologies (comma-separated)</label>
                  <input
                    type="text"
                    value={project.technologies.join(", ")}
                    onChange={(e) => updateProjectTech(i, e.target.value)}
                    placeholder="Python, Scikit-learn, Pandas"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            ))}
            <button onClick={addProject} type="button" className="text-blue-600 font-medium hover:underline text-sm">
              + Add another project
            </button>
          </div>
        </Section>

        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg transition"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
          {saveMessage && <span className="text-sm text-slate-500">{saveMessage}</span>}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", step }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        step={step}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-300 rounded-lg px-3 py-2"
      />
    </div>
  );
}