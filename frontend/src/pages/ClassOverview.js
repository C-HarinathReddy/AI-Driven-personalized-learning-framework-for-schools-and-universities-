// frontend/src/pages/ClassOverview.js
import { useEffect, useState } from "react";
import { getClassSummary } from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function ClassOverview() {
  // For now we use course_id = 1 (Data Structures and Algorithms)
  const courseId = 1;

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getClassSummary(courseId);
        setSummary(data);
      } catch (err) {
        console.error(err);
        setError("Error loading class overview. Check backend.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        Loading class overview...
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        {error || "No class overview available."}
      </div>
    );
  }

  const topics = summary.topics || [];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Class Performance Overview</h1>
          <p className="text-slate-300 text-sm">
            Course:{" "}
            <span className="font-semibold">{summary.course_name}</span> | Students:{" "}
            <span className="font-semibold">{summary.total_students}</span>
          </p>
        </div>
        <button
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 text-sm"
          onClick={() => (window.location.href = "/teacher")}
        >
          Back to Teacher Dashboard
        </button>
      </div>

      {/* Top summary cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-1">Overall Class Predicted Score</p>
          <p className="text-3xl font-bold text-green-400">
            {summary.class_overall_score} / 100
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Weighted average of quiz, assignment and mid-sem across all topics.
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-1">Top Student</p>
          {summary.top_student ? (
            <>
              <p className="font-semibold">
                {summary.top_student.username}{" "}
                <span className="text-xs text-slate-400">
                  (Roll: {summary.top_student.roll_no})
                </span>
              </p>
              <p className="text-lg text-green-400 font-bold">
                {summary.top_student.predicted_score}%
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">Not available.</p>
          )}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-1">Student Needing Support</p>
          {summary.weakest_student ? (
            <>
              <p className="font-semibold">
                {summary.weakest_student.username}{" "}
                <span className="text-xs text-slate-400">
                  (Roll: {summary.weakest_student.roll_no})
                </span>
              </p>
              <p className="text-lg text-red-400 font-bold">
                {summary.weakest_student.predicted_score}%
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">Not available.</p>
          )}
        </div>
      </div>

      {/* Hardest / Strongest topics */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-2">Hardest Topics</h2>
          <p className="text-xs text-slate-400 mb-2">
            Topics where students show the lowest combined performance.
          </p>
          {summary.hardest_topics && summary.hardest_topics.length > 0 ? (
            <ul className="text-sm list-disc list-inside text-red-300">
              {summary.hardest_topics.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No data.</p>
          )}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-2">Strong Topics</h2>
          <p className="text-xs text-slate-400 mb-2">
            Topics where the class is performing well.
          </p>
          {summary.easiest_topics && summary.easiest_topics.length > 0 ? (
            <ul className="text-sm list-disc list-inside text-green-300">
              {summary.easiest_topics.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No data.</p>
          )}
        </div>
      </div>

      {/* Topic-wise Average Combined Score (chart) */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Topic-wise Average Combined Score
        </h2>
        <p className="text-xs text-slate-400 mb-3">
          This shows the average AI combined score per topic across the whole class.
        </p>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 h-72">
          {topics.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topics}>
                <XAxis dataKey="topic_name" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="combined_avg" name="Combined Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400">
              No topic data available for this course.
            </p>
          )}
        </div>
      </div>

      {/* Topic-wise details */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-8">
        <h2 className="text-lg font-semibold mb-3">
          Topic-wise Details (Weak / Average / Strong)
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map((t) => (
            <div
              key={t.topic_id}
              className="bg-slate-900 border border-slate-700 rounded-lg p-4"
            >
              <h3 className="font-semibold text-lg mb-1">{t.topic_name}</h3>
              <p className="text-sm text-slate-300 mb-1">
                Quiz Avg: {t.quiz_avg} | Assignment Avg: {t.assignment_avg} | Mid-Sem Avg:{" "}
                {t.midsem_avg}
              </p>
              <p className="text-sm mb-1">
                Combined Avg Score:{" "}
                <span className="font-bold">{t.combined_avg}</span>
              </p>
              <p className="text-xs text-slate-300">
                Strong:{" "}
                <span className="text-green-300 font-semibold">
                  {t.strong_count}
                </span>{" "}
                | Average:{" "}
                <span className="text-yellow-300 font-semibold">
                  {t.average_count}
                </span>{" "}
                | Weak:{" "}
                <span className="text-red-300 font-semibold">
                  {t.weak_count}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Class Recommendation */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-2">AI Class Recommendation</h2>
        <p className="text-sm text-slate-300 whitespace-pre-line">
          {summary.ai_recommendation}
        </p>
      </div>
    </div>
  );
}
