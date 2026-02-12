// frontend/src/pages/teacher/TeacherCourses.js
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import api from "../../api";

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("school");
  const [year, setYear] = useState("");

  // Load courses
  const loadCourses = async () => {
    const res = await api.get("/teacher/courses/");
    setCourses(res.data);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Create course
  const createCourse = async () => {
    if (!name || !year) {
      alert("Please fill all fields");
      return;
    }

    try {
      await api.post("/teacher/courses/create/", {
        name: name,
        level: institution, // ✅ unchanged
        year_or_class: year,
      });

      setName("");
      setYear("");
      loadCourses();
    } catch (err) {
      console.error("Create course error:", err.response?.data);
      alert("Failed to create course");
    }
  };

  // Delete course
  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;

    await api.delete(`/teacher/courses/${id}/delete/`);
    loadCourses();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-wide">
            Manage Courses
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create and manage your courses
          </p>
        </div>

        {/* CREATE COURSE */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Create New Course
          </h2>

          <div className="grid gap-4 md:grid-cols-4">
            <input
              placeholder="Course name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-blue-500"
            />

            <select
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none"
            >
              <option value="school">School</option>
              <option value="university">University</option>
            </select>

            <input
              placeholder="Class / Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-blue-500"
            />

            <button
              onClick={createCourse}
              className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-semibold transition"
            >
              Create Course
            </button>
          </div>
        </div>

        {/* COURSE LIST */}
        <h2 className="text-lg font-semibold mb-4">
          Your Courses
        </h2>

        {courses.length === 0 ? (
          <p className="text-slate-400">
            No courses created yet.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((c) => (
              <div
                key={c.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 hover:border-blue-500 transition flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-lg">
                    Course: {c.name}
                  </p>

                  <p className="text-sm text-slate-400">
                    {c.institution_type === "school"
                      ? "School"
                      : "University"}
                  </p>

                  <p className="text-sm text-slate-400">
                    Class / Year: {c.year_or_class}
                  </p>
                </div>

                <button
                  onClick={() => deleteCourse(c.id)}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-semibold transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
