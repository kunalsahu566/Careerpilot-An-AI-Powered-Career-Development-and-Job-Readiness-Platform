import { useEffect, useState } from "react";
import apiClient from "../api/client";

export default function Home() {
  const [status, setStatus] = useState("checking");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    apiClient
      .get("/health")
      .then((res) => {
        setStatus("ok");
        setDetail(res.data.message);
      })
      .catch((err) => {
        setStatus("error");
        setDetail(
          err.response?.data?.detail ||
            "Could not reach the backend. Is uvicorn running on port 8000?"
        );
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">CareerPilot</h1>
        <p className="text-slate-500 mb-6">Phase 0 - Connectivity Check</p>

        {status === "checking" && (
          <div className="text-slate-500">Checking connection to backend...</div>
        )}

        {status === "ok" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 font-medium">✓ All connected</p>
            <p className="text-green-600 text-sm mt-1">{detail}</p>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-medium">✗ Connection failed</p>
            <p className="text-red-600 text-sm mt-1">{detail}</p>
          </div>
        )}
      </div>
    </div>
  );
}