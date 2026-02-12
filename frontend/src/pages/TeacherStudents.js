// frontend/src/pages/TeacherStudents.js
import { useEffect, useState } from "react";
import Header from "../components/Header";
import { getCourses, getCourseStudents } from "../api";
import { exportToPDF } from "../utils/exportPdf";
import { getScoreColorClass } from "../utils/scoreUtils";

export default function TeacherStudents() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [studentsData, setStudentsData] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- LOAD COURSES ---------------- */
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
        if (data.length > 0) setSelectedCourseId(data[0].id);
      } catch (err) {
        console.error(err);
        setError("Error loading courses.");
      }
    };
    loadCourses();
  }, []);

  /* ---------------- LOAD STUDENTS ---------------- */
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedCourseId) return;
      try {
        setLoading(true);
        const data = await getCourseStudents(selectedCourseId);
        setStudentsData(data.students || []);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Error loading students.");
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [selectedCourseId]);

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredStudents = studentsData.filter((s) => {
    const score = s.overall_predicted_final_score || 0;
    const level =
      score > 75 ? "strong" : score >= 50 ? "average" : "weak";

    return (
      s.roll_no.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "all" || filter === level)
    );
  });

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header />

      {/* EVERYTHING INSIDE THIS DIV WILL EXPORT */}
      <div
        id="students-overview-pdf"
        className="max-w-7xl mx-auto px-6 py-8"
      >
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Students Overview</h1>
            <p className="text-slate-400 text-sm mt-1">
              View performance insights for students enrolled in your course
            </p>
          </div>

          <button
            className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-500 font-semibold transition"
            onClick={() =>
              exportToPDF(
                "students-overview-pdf",
                "Students_Overview_Report.pdf"
              )
            }
          >
            Export PDF
          </button>
        </div>

        {/* CONTROLS CARD */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 mb-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* COURSE SELECT */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Select Course
              </label>
              <select
                value={selectedCourseId || ""}
                onChange={(e) =>
                  setSelectedCourseId(Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SEARCH */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Search Roll No
              </label>
              <input
                type="text"
                placeholder="e.g. S101"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* FILTER */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Performance Filter
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Students</option>
                <option value="weak">Weak (&lt; 50)</option>
                <option value="average">Average (50–75)</option>
                <option value="strong">Strong (&gt; 75)</option>
              </select>
            </div>
          </div>
        </div>

        {/* STATES */}
        {loading && (
          <p className="text-slate-300">Loading students...</p>
        )}
        {error && <p className="text-red-400 mb-4">{error}</p>}

        {!loading && filteredStudents.length === 0 && (
          <p className="text-slate-300">
            No students match your filters.
          </p>
        )}

        {/* TABLE */}
        {!loading && filteredStudents.length > 0 && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr className="text-slate-300">
                  <th className="px-4 py-3 text-left">Roll No</th>
                  <th className="px-4 py-3 text-left">Username</th>
                  <th className="px-4 py-3 text-left">
                    Predicted Score
                  </th>
                  <th className="px-4 py-3 text-left">
                    Strong Topics
                  </th>
                  <th className="px-4 py-3 text-left">
                    Weak Topics
                  </th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((s) => (
                  <tr
                    key={s.student_id}
                    className="border-b border-slate-700 last:border-0 hover:bg-slate-700/40 transition"
                  >
                    <td className="px-4 py-3">
                      {s.roll_no}
                    </td>
                    <td className="px-4 py-3">
                      {s.username}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${getScoreColorClass(
                        s.overall_predicted_final_score
                      )}`}
                    >
                      {s.overall_predicted_final_score.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-green-300">
                      {s.strong_topics?.join(", ") || "-"}
                    </td>
                    <td className="px-4 py-3 text-red-300">
                      {s.weak_topics?.join(", ") || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/student/summary/${s.roll_no}`}
                        className="text-blue-400 hover:underline font-medium"
                      >
                        View AI Summary
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
