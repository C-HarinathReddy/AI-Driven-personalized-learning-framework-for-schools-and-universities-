import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginTeacher } from "../api";
import userAvatar from "../assets/user-avatar.png";

export default function Login() {
  const navigate = useNavigate();

  // role: teacher | student | admin
  const [role, setRole] = useState("teacher");

  // Institution type (USED BY BOTH STUDENT & TEACHER)
  const [institutionType, setInstitutionType] = useState("school");

  // Student
  const [studentId, setStudentId] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  // Teacher / Admin
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    /* ================= STUDENT LOGIN ================= */
    if (role === "student") {
      if (!studentId || !studentPassword) {
        setError("Please enter Roll No and Password.");
        return;
      }

      try {
        const res = await fetch(
          "http://127.0.0.1:8000/api/student-login/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roll_no: studentId,
              password: studentPassword,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Student login failed.");
          return;
        }

        localStorage.setItem("studentLoggedIn", "true");
        localStorage.setItem("studentId", data.student_id);
        localStorage.setItem("studentRollNo", data.roll_no);
        localStorage.setItem("userRole", "student");

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        if (data.is_first_login) {
          navigate("/student/change-password");
        } else {
          navigate("/student");
        }
      } catch {
        setError("Student login failed. Try again.");
      }
      return;
    }

    /* ================= ADMIN LOGIN ================= */
    if (role === "admin") {
      if (!username || !password) {
        setError("Enter admin username and password.");
        return;
      }

      try {
        const res = await fetch(
          "http://127.0.0.1:8000/api/auth/admin-login/",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Invalid admin credentials");
          return;
        }

        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        localStorage.setItem("userRole", "admin");

        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentId");
        localStorage.removeItem("studentRollNo");
        localStorage.removeItem("studentUsername");

        navigate("/admin");
      } catch {
        setError("Admin login failed. Try again.");
      }
      return;
    }

    /* ================= TEACHER LOGIN ================= */
    if (role === "teacher") {
      if (!username || !password) {
        setError("Enter teacher username and password.");
        return;
      }

      try {
        const data = await loginTeacher(username, password);

        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        localStorage.setItem("institutionType", institutionType);
        localStorage.setItem("userRole", "teacher");

        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentId");
        localStorage.removeItem("studentRollNo");
        localStorage.removeItem("studentUsername");

        navigate("/teacher", { state: { institutionType } });
      } catch {
        setError("Invalid teacher credentials.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-lg bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-8 text-white">
        
        {/* TITLE */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full 
            bg-slate-400 flex items-center justify-center 
            shadow-lg border border-slate-700">
            <img
              src={userAvatar}
              alt="User Avatar"
              className="h-16 w-16 object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold tracking-wide">
            Personalized Learning System
          </h1>

          <p className="text-slate-400 text-sm mt-1">
            Login as Teacher, Student, or Admin
          </p>
        </div>


        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* ROLE TABS */}
          <div className="grid grid-cols-3 gap-2 bg-slate-800 p-1 rounded-xl">
            {["teacher", "student", "admin"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2 rounded-lg text-sm font-semibold capitalize transition
                  ${
                    role === r
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* INSTITUTION TYPE */}
          {(role === "student" || role === "teacher") && (
            <div>
              <label className="text-xs text-slate-400">Institution Type</label>
              <select
                className="mt-1 w-full p-2 rounded-lg bg-slate-800 border border-slate-600"
                value={institutionType}
                onChange={(e) => setInstitutionType(e.target.value)}
              >
                <option value="school">School</option>
                <option value="university">University</option>
              </select>
            </div>
          )}

          {/* TEACHER / ADMIN */}
          {(role === "teacher" || role === "admin") && (
            <>
              <input
                type="text"
                placeholder="Username"
                className="w-full p-2 rounded-lg bg-slate-800 border border-slate-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full p-2 rounded-lg bg-slate-800 border border-slate-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          )}

          {/* STUDENT */}
          {role === "student" && (
            <>
              <input
                type="text"
                placeholder="Roll Number"
                className="w-full p-2 rounded-lg bg-slate-800 border border-slate-600"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full p-2 rounded-lg bg-slate-800 border border-slate-600"
                value={studentPassword}
                onChange={(e) => setStudentPassword(e.target.value)}
              />
            </>
          )}

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition"
          >
            Continue
          </button>
        </form>

        <p className="mt-5 text-xs text-center text-slate-500">
          Teachers/Admins: use Django credentials.<br />
          Students: use Roll No and password.
        </p>
      </div>
    </div>
  );
}
