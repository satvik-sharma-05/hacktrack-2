// src/pages/AuthCallback.jsx (React)
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("hacktrack_token", token);
      // optional: fetch /api/auth/me with token to store user
      navigate("/", { replace: true });
    } else {
      // show error or redirect
      navigate("/login");
    }
  }, [navigate]);

  return <div>Signing you in…</div>;
}
