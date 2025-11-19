import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const redirected = useRef(false); // prevent duplicate redirects

  useEffect(() => {
    if (redirected.current) return; // prevent multiple redirects

    const token = searchParams.get("token");
    const role = searchParams.get("role");

    if (!token || !role) {
      console.warn("❌ Missing token or role — redirecting to /login");
      navigate("/login", { replace: true });
      return;
    }

    // ✅ Store token + user data
    localStorage.setItem("token", token);
    const userData = { role };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    // ✅ Compute redirect path
    let redirectPath = "/profile";
    if (role === "organizer") redirectPath = "/organizer";
    else if (role === "admin") redirectPath = "/admin";
    else if (role === "student") redirectPath = "/profile";

    console.log("✅ Redirecting to:", redirectPath);
    redirected.current = true;

    // ✅ Give React Router time to commit before navigating
    setTimeout(() => {
      navigate(redirectPath, { replace: true });
    }, 100);
  }, [searchParams, setUser, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Login Successful 🎉</h2>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
