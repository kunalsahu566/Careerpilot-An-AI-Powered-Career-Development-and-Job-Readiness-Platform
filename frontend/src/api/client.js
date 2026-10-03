import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Runs before every single request this client makes. If we have a saved
// token (from a previous login), attach it automatically - no component
// needs to remember to do this itself.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("careerpilot_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever says "your token is invalid/expired" (401), clear
// the stale token so the app doesn't keep retrying with a dead token.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("careerpilot_token");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
