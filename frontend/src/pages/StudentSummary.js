// src/pages/StudentSummary.js
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getStudentSummary } from "../api";
import { exportToPDF } from "../utils/exportPdf";
import { getScoreColorClass } from "../utils/scoreUtils";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function StudentSummary() {
  const { roll_no } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     🔐 ROUTE GUARD (STUDENT OR TEACHER)
  ===================================================== */
  useEffect(() => {
    const role = localStorage.getItem("userRole");

    const studentAllowed =
      role === "student" &&
      localStorage.getItem("studentLoggedIn") === "true";

    const teacherAllowed =
      role === "teacher" &&
      !!localStorage.getItem("accessToken");

    if (!studentAllowed && !teacherAllowed) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  /* =====================================================
     📡 LOAD STUDENT SUMMARY
  ===================================================== */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getStudentSummary(roll_no);
        setSummary(data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Error loading summary. Please check backend.");
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [roll_no]);

  /* =====================================================
     🚪 LOGOUT (ROLE AWARE)
  ===================================================== */
  const handleLogout = () => {
    const role = localStorage.getItem("userRole");

    if (role === "student") {
      localStorage.removeItem("studentRollNo");
      localStorage.removeItem("studentId");
      localStorage.removeItem("studentUsername");
      localStorage.removeItem("studentLoggedIn");
    }

    // shared cleanup
    localStorage.removeItem("userRole");
    localStorage.removeItem("accessToken");

    navigate("/", { replace: true });
  };

  /* =====================================================
     ⏳ STATES
  ===================================================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Header />
        <div className="p-8">Loading summary...</div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Header />
        <div className="p-8 text-red-400">
          {error || "No summary available."}
        </div>
      </div>
    );
  }

  /* =====================================================
     📊 DATA
  ===================================================== */
  const chartData = summary.topics.map((t) => ({
    name: t.topic_name,
    combined: t.combined_score,
  }));

  const finalScore = summary.overall_predicted_final_score || 0;

  /* =====================================================
     🎨 UI
  ===================================================== */
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />

      {/* PDF EXPORT WRAPPER */}
      <div id="student-summary-pdf" className="p-8 max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">AI Summary for Student</h1>

          <div className="flex gap-3">
            <button
              onClick={() =>
                exportToPDF(
                  "student-summary-pdf",
                  `Student_AI_Report_${roll_no}.pdf`
                )
              }
              className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500"
            >
              Export PDF
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
            >
              Logout
            </button>
          </div>
        </div>

        {/* STUDENT INFO */}
        <p className="text-slate-300 mb-4">
          ID: <span className="font-semibold">{summary.student_id}</span> |{" "}
          Username:{" "}
          <span className="font-semibold">{summary.student_name}</span> | Roll No:{" "}
          <span className="font-semibold">{roll_no}</span>
        </p>

        {/* FINAL SCORE */}
        <div className="mb-6">
          <span className="text-lg">
            Predicted Final Exam Score:{" "}
            <span className={`font-bold ${getScoreColorClass(finalScore)}`}>
              {finalScore} / 100
            </span>
          </span>
        </div>

        {/* BAR CHART */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Topic-wise Performance
          </h2>
          <p className="text-xs text-slate-300 mb-3">
            This shows your combined AI score (quiz + assignment + mid-sem) for
            each topic.
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="combined" name="Combined Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOPIC DETAILS */}
        <h2 className="text-xl font-semibold mb-3">
          Topic-wise Performance (Details)
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {summary.topics.map((t) => (
            <div
              key={t.topic_id}
              className="bg-slate-800 rounded-xl p-4 border border-slate-700"
            >
              <h3 className="font-semibold text-lg mb-1">
                {t.topic_name}{" "}
                <span className="text-xs text-slate-400">
                  ({t.course_name})
                </span>
              </h3>

              <p className="text-sm text-slate-300 mb-1">
                Quiz Avg: {t.quiz_avg} | Assignment Avg: {t.assignment_avg} |
                Mid-Sem Avg: {t.midsem_avg}
              </p>

              <p className="text-sm">
                Combined Score:{" "}
                <span
                  className={`font-bold ${getScoreColorClass(
                    t.combined_score
                  )}`}
                >
                  {t.combined_score} ({t.level})
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* AI PLAN */}
        <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-2">AI Learning Plan</h2>
          <p className="text-sm text-slate-300 whitespace-pre-line">
            {summary.ai_recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
