import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allow }) {
  const role = localStorage.getItem("userRole");
  const accessToken = localStorage.getItem("accessToken");
  const studentLoggedIn = localStorage.getItem("studentLoggedIn");

  // ================= STUDENT =================
  if (allow === "student") {
    if (role !== "student" || studentLoggedIn !== "true") {
      return <Navigate to="/" replace />;
    }
  }

  // ================= TEACHER =================
  if (allow === "teacher") {
    if (role !== "teacher" || !accessToken) {
      return <Navigate to="/" replace />;
    }
  }

  // ================= ADMIN =================
  if (allow === "admin") {
    if (role !== "admin" || !accessToken) {
      return <Navigate to="/" replace />;
    }
  }

  // ================= SUMMARY =================
  if (allow === "summary") {
    if (
      (role === "student" && studentLoggedIn !== "true") ||
      ((role === "teacher" || role === "admin") && !accessToken)
    ) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
