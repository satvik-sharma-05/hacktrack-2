// src/pages/SelectRolePage.jsx
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function SelectRolePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const tempId = searchParams.get("tempId");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setRole = async (role) => {
    if (!tempId) return alert("Invalid or missing user ID");

    try {
      setLoading(true);
      setError("");

      // ✅ POST role to backend
      const res = await API.post("/auth/set-role", { id: tempId, role });

      if (res.data.user) {
        // ✅ Store user locally (auto-login)
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      // ✅ Redirect based on role
      if (role === "organizer") navigate("/organizer");
      else navigate("/");
    } catch (err) {
      console.error("❌ Role selection failed:", err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h2 className="text-2xl font-bold mb-6">Choose your Role</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex gap-6">
        <button
          onClick={() => setRole("student")}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Processing..." : "🎓 I’m a Student"}
        </button>

        <button
          onClick={() => setRole("organizer")}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          {loading ? "Processing..." : "🏢 I’m an Organizer"}
        </button>
      </div>
    </div>
  );
}
