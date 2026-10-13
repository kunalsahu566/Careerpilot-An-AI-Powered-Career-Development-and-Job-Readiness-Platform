import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SkillGap from "./pages/SkillGap";
import Readiness from "./pages/Readiness";
import Recommendations from "./pages/Recommendations";
import StudyPlan from "./pages/StudyPlan";
import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Every logged-in page shares the nav bar through this layout route */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/skill-gap" element={<SkillGap />} />
            <Route path="/readiness" element={<Readiness />} />
            <Route path="/learning" element={<Recommendations />} />
            <Route path="/study-plan" element={<StudyPlan />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/applications" element={<Applications />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
