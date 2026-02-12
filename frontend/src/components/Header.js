// frontend/src/components/Header.js
import { Link, useLocation, useNavigate } from "react-router-dom";
import userAvatar from "../assets/user-avatar.png";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const role = localStorage.getItem("userRole");
  const studentRollNo = localStorage.getItem("studentRollNo") || "";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const linkBase =
    "px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium";

  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + "/");

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-full bg-slate-400 
                      flex items-center justify-center 
                      border border-slate-700 shadow-sm"
          >
            <img
              src={userAvatar}
              alt="User"
              className="h-16 w-16 object-contain"
            />
          </div>

          <span className="font-semibold text-lg tracking-wide">
            Learning System
          </span>
        </div>


        {/* NAV */}
        <nav className="flex items-center gap-2">
          {/* TEACHER */}
          {role === "teacher" && (
            <>
              <Link
                to="/teacher"
                className={`${linkBase} ${
                  isActive("/teacher")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/teacher/upload-quiz"
                className={`${linkBase} ${
                  isActive("/teacher/upload-quiz")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Quiz
              </Link>

              <Link
                to="/teacher/upload-assignment"
                className={`${linkBase} ${
                  isActive("/teacher/upload-assignment")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Assignment
              </Link>

              <Link
                to="/teacher/upload-midsem"
                className={`${linkBase} ${
                  isActive("/teacher/upload-midsem")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Midsem
              </Link>

              <Link
                to="/teacher/class-summary"
                className={`${linkBase} ${
                  isActive("/teacher/class-summary")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Overview
              </Link>

              <Link
                to="/teacher/students"
                className={`${linkBase} ${
                  isActive("/teacher/students")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Students
              </Link>

              <Link
                to="/teacher/topics"
                className={`${linkBase} ${
                  isActive("/teacher/topics")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Manage Topics
              </Link>

              <Link
                to="/teacher/courses"
                className={`${linkBase} ${
                  isActive("/teacher/courses")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Manage Courses
              </Link>

            </>
          )}

          {/* STUDENT */}
          {role === "student" && studentRollNo && (
            <Link
              to={`/student/summary/${studentRollNo}`}
              className={`${linkBase} ${
                isActive("/student")
                  ? "bg-violet-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              My AI Summary
            </Link>
          )}

          {/* ADMIN */}
          {role === "admin" && (
            <>
              <Link
                to="/admin"
                className={`${linkBase} ${
                  isActive("/admin")
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/admin/courses"
                className={`${linkBase} ${
                  isActive("/admin/courses")
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Courses
              </Link>

              <Link
                to="/admin/topics"
                className={`${linkBase} ${
                  isActive("/admin/topics")
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Topics
              </Link>

              <Link
                to="/admin/teachers"
                className={`${linkBase} ${
                  isActive("/admin/teachers")
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Teachers
              </Link>

              <Link
                to="/admin/students"
                className={`${linkBase} ${
                  isActive("/admin/students")
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Students
              </Link>
            </>
          )}
        </nav>

        {/* LOGOUT */}
        {(role === "teacher" || role === "student" || role === "admin") && (
          <button
            onClick={handleLogout}
            className="ml-4 px-4 py-1.5 rounded-lg text-sm font-semibold bg-red-600/90 hover:bg-red-600 transition"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
