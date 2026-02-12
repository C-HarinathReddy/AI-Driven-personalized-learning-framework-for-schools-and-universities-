// src/pages/TeacherDashboard.js
import { useLocation, Link } from "react-router-dom";
import Header from "../components/Header";

export default function TeacherDashboard() {
  const location = useLocation();
  const institutionType = location.state?.institutionType || "school";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Institution type:{" "}
            <span className="font-semibold text-white capitalize">
              {institutionType}
            </span>
          </p>
        </div>

        {/* ACTION CARDS */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* QUIZ */}
          <Link
            to="/teacher/upload-quiz"
            className="group bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-blue-500 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600/20 text-blue-400 mb-4 text-xl font-bold">
              Q
            </div>
            <h2 className="font-semibold text-lg mb-1 group-hover:text-blue-400 transition">
              Upload Quiz Marks
            </h2>
            <p className="text-sm text-slate-300">
              Upload topic-wise quiz scores from CSV or Excel files.
            </p>
          </Link>

          {/* ASSIGNMENT */}
          <Link
            to="/teacher/upload-assignment"
            className="group bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-blue-500 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-600/20 text-indigo-400 mb-4 text-xl font-bold">
              A
            </div>
            <h2 className="font-semibold text-lg mb-1 group-hover:text-indigo-400 transition">
              Upload Assignment Marks
            </h2>
            <p className="text-sm text-slate-300">
              Upload topic-wise assignment scores for students.
            </p>
          </Link>

          {/* MIDSEM */}
          <Link
            to="/teacher/upload-midsem"
            className="group bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-blue-500 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-violet-600/20 text-violet-400 mb-4 text-xl font-bold">
              M
            </div>
            <h2 className="font-semibold text-lg mb-1 group-hover:text-violet-400 transition">
              Upload Mid-Sem Marks
            </h2>
            <p className="text-sm text-slate-300">
              Upload Q1–Q11 marks and map questions to topics.
            </p>
          </Link>
        </div>

        {/* INFO SECTION */}
        <div className="mt-10 bg-slate-800/80 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Quick Tip</h2>
          <p className="text-sm text-slate-300">
            Upload quiz, assignment, and mid-sem data regularly to help the AI
            generate accurate predictions and personalized insights for your
            students.
          </p>
        </div>
      </div>
    </div>
  );
}
