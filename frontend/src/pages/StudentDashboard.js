// src/pages/StudentDashboard.js
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getStudentSummary } from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Roll number comes from login OR localStorage fallback
  const locationRollNo = location.state?.rollNo;
  const storedRollNo = localStorage.getItem("studentRollNo") || "";
  const rollNo = locationRollNo || storedRollNo;

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Route guard
  useEffect(() => {
    if (
      localStorage.getItem("userRole") !== "student" ||
      localStorage.getItem("studentLoggedIn") !== "true"
    ) {
      navigate("/");
    }
  }, [navigate]);

  // Load student summary
  useEffect(() => {
    const load = async () => {
      if (!rollNo) return;
      try {
        setLoading(true);
        const data = await getStudentSummary(rollNo);
        setSummary(data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Error loading student data. Please try again.");
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [rollNo]);

  const handleLogout = () => {
    localStorage.removeItem("studentRollNo");
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentUsername");
    localStorage.removeItem("userRole");
    localStorage.removeItem("studentLoggedIn");
    navigate("/");
  };

  const handleViewSummary = () => {
    if (!rollNo) return;
    navigate(`/student/summary/${rollNo}`);
  };

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <Header />
        <div className="max-w-7xl mx-auto p-8">Loading student dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <Header />
        <div className="max-w-7xl mx-auto p-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <Header />
        <div className="max-w-7xl mx-auto p-8">
          No data available yet for this student.
        </div>
      </div>
    );
  }

  /* ================= DATA ================= */

  const chartData = summary.topics.map((t) => ({
    name: t.topic_name,
    combined: t.combined_score,
  }));

  const weakTopics = summary.weak_topics || [];
  const strongTopics = summary.strong_topics || [];

  const score = summary.overall_predicted_final_score || 0;
  let scoreMessage = "";
  if (score < 40) {
    scoreMessage =
      "You need to strengthen your fundamentals. Focus more on regular practice and revising core concepts.";
  } else if (score < 70) {
    scoreMessage =
      "You are doing okay, but there is good scope for improvement. A bit more consistent practice can boost your score.";
  } else {
    scoreMessage =
      "Great work! You are performing well. Keep revising regularly to maintain this level.";
  }

  const nextWeakTopic = weakTopics.length > 0 ? weakTopics[0] : null;

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="text-slate-400 mt-1">
              Welcome{" "}
              <span className="font-semibold text-white">
                {summary.student_name || "Student"}
              </span>{" "}
              <span className="text-slate-500">(Roll No: {rollNo})</span>
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold"
          >
            Logout
          </button>
        </div>

        {/* STATS */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
            <p className="text-xs text-slate-400">Predicted Final Score</p>
            <p className="text-4xl font-extrabold text-green-400 mt-1">
              {score.toFixed(2)}
              <span className="text-lg text-green-300"> /100</span>
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Based on quiz, assignment & mid-sem
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
            <p className="text-xs text-slate-400">Topic Strength</p>
            <p className="text-sm mt-2">
              Strong:{" "}
              <span className="text-green-400 font-semibold">
                {strongTopics.length}
              </span>
              <br />
              Weak:{" "}
              <span className="text-red-400 font-semibold">
                {weakTopics.length}
              </span>
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Aim to reduce your weak topics count step by step.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs text-slate-400">Quick Action</p>
              <p className="text-xs text-slate-300 mt-2">
                {nextWeakTopic
                  ? `Focus on: ${nextWeakTopic}. Revise concepts and practice 5–10 questions.`
                  : "No weak topics detected. Keep revising!"}
              </p>
            </div>
            <button
              onClick={handleViewSummary}
              className="mt-3 bg-violet-600 hover:bg-violet-500 rounded-lg py-2 text-sm font-semibold"
            >
              View AI Summary
            </button>
          </div>
        </div>

        {/* CHART */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 mb-8">
          <h2 className="text-xl font-semibold mb-2">
            Topic-wise Combined Score
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
                <Bar dataKey="combined" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LISTS */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-2">Weak Topics</h2>
            {weakTopics.length ? (
              <ul className="list-disc list-inside text-red-300 text-sm">
                {weakTopics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-300">None 🎉</p>
            )}
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-2">Strong Topics</h2>
            {strongTopics.length ? (
              <ul className="list-disc list-inside text-green-300 text-sm">
                {strongTopics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-300">None yet. Keep practicing your strong topics will appear here.</p>
            )}
          </div>
        </div>

        {/* AI MESSAGE */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-2">AI Study Hint</h2>
          <p className="text-sm text-slate-300">{scoreMessage}</p>
        </div>
      </div>
    </div>
  );
}
