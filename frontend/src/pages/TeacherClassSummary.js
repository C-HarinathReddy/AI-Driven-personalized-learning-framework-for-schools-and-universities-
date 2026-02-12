// frontend/src/pages/TeacherClassSummary.js
import { useEffect, useState } from "react";
import Header from "../components/Header";
import { getClassSummary, getCourses } from "../api";
import { exportToPDF } from "../utils/exportPdf";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function TeacherClassSummary() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- LOAD COURSES ---------------- */
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourseId(data[0].id);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load courses.");
      }
    };
    loadCourses();
  }, []);

  /* ---------------- LOAD SUMMARY ---------------- */
  useEffect(() => {
    const loadSummary = async () => {
      if (!selectedCourseId) return;
      setLoading(true);
      try {
        const data = await getClassSummary(selectedCourseId);
        setSummary(data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Error loading class overview.");
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [selectedCourseId]);

  if (loading && !summary) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Header />
        <div className="p-8">Loading class overview...</div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Header />
        <div className="p-8">
          {error || "No class overview available."}
        </div>
      </div>
    );
  }

  const topics = summary.topics || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header />

      {/* PDF WRAPPER */}
      <div
        id="class-summary-pdf"
        className="max-w-7xl mx-auto px-6 py-8"
      >
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Class Performance Overview
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              AI-powered performance summary for the selected course
            </p>
          </div>

          <div className="flex gap-3">
            <button
              className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-sm font-semibold transition"
              onClick={() =>
                exportToPDF(
                  "class-summary-pdf",
                  `Class_Summary_${summary.course_name}.pdf`
                )
              }
            >
              Export PDF
            </button>

            <button
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition"
              onClick={() => (window.location.href = "/teacher")}
            >
              Back
            </button>
          </div>
        </div>

        {/* COURSE SELECTOR */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 mb-6">
          <label className="block text-xs text-slate-400 mb-2">
            Select Course
          </label>
          <select
            value={selectedCourseId || ""}
            onChange={(e) =>
              setSelectedCourseId(Number(e.target.value))
            }
            className="w-full md:w-96 px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-sm"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.level})
              </option>
            ))}
          </select>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1">
              {summary.course_name}
            </p>
            <p className="text-sm">
              Total Students:{" "}
              <span className="font-semibold">
                {summary.total_students}
              </span>
            </p>
            <p className="mt-2 text-sm">
              Overall Score:{" "}
              <span className="text-green-400 font-bold">
                {summary.class_overall_score} / 100
              </span>
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1">
              Top Performer
            </p>
            <p className="font-semibold">
              {summary.top_student?.username || "-"}
            </p>
            <p className="text-green-400 font-bold">
              {summary.top_student?.predicted_score || "-"}%
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
            <p className="text-xs text-slate-400 mb-1">
              Needs Support
            </p>
            <p className="font-semibold">
              {summary.weakest_student?.username || "-"}
            </p>
            <p className="text-red-400 font-bold">
              {summary.weakest_student?.predicted_score || "-"}%
            </p>
          </div>
        </div>

        {/* CHART */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 mb-8 h-80">
          <h2 className="text-lg font-semibold mb-4">
            Topic-wise Average Performance
          </h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topics}>
              <XAxis dataKey="topic_name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="combined_avg"
                name="Combined Avg Score"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* TOPIC DETAILS */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Topic-wise Details
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {topics.map((t) => (
              <div
                key={t.topic_id}
                className="bg-slate-900 border border-slate-700 rounded-xl p-4 hover:border-blue-500 transition"
              >
                <h3 className="font-semibold text-lg">
                  {t.topic_name}
                </h3>
                <p className="text-sm text-slate-300">
                  Quiz: {t.quiz_avg} | Assignment:{" "}
                  {t.assignment_avg} | Mid: {t.midsem_avg}
                </p>
                <p className="text-sm mt-1">
                  Combined:{" "}
                  <span className="font-bold">
                    {t.combined_avg}
                  </span>
                </p>
                <p className="text-xs mt-1">
                  Strong:{" "}
                  <span className="text-green-300">
                    {t.strong_count}
                  </span>{" "}
                  | Avg:{" "}
                  <span className="text-yellow-300">
                    {t.average_count}
                  </span>{" "}
                  | Weak:{" "}
                  <span className="text-red-300">
                    {t.weak_count}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AI RECOMMENDATION */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-blue-600/20 border border-blue-500/30 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-2">
            AI Class Recommendation
          </h2>
          <p className="text-sm text-slate-200 whitespace-pre-line">
            {summary.ai_recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
