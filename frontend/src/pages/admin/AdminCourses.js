// frontend/src/pages/admin/AdminCourses.js
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import API from "../../api/admin";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [level, setLevel] = useState("university");
  const [year, setYear] = useState("");

  const loadCourses = async () => {
    try {
      const res = await API.get("admin/courses/");
      setCourses(res.data);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const createCourse = async () => {
    await API.post("admin/courses/", {
      name,
      level,
      year_or_class: year,
    });
    setName("");
    setYear("");
    loadCourses();
  };

  const toggleCourse = async (id, is_active) => {
    await API.patch(`admin/courses/${id}/`, { is_active });
    loadCourses();
  };

  const deleteCourse = async (id) => {
    await API.delete(`admin/courses/${id}/`);
    loadCourses();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        Loading courses...
      </div>
    );
  }

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
            Create, activate or remove courses
          </p>
        </div>

        {/* CREATE COURSE */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Create New Course
          </h2>

          <div className="grid gap-4 md:grid-cols-4">
            <input
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-emerald-500"
              placeholder="Course name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <select
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="school">School</option>
              <option value="university">University</option>
            </select>

            <input
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none"
              placeholder="Class / Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />

            <button
              onClick={createCourse}
              className="bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold transition"
            >
              Create Course
            </button>
          </div>
        </div>

        {/* COURSE LIST */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Existing Courses
          </h2>

          {courses.length === 0 && (
            <p className="text-slate-400">
              No courses available.
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 hover:border-blue-500 transition"
              >
                <div>
                  <h3 className="text-lg font-semibold">
                    {course.name}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {course.level} •{" "}
                    {course.year_or_class || "N/A"}
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() =>
                      toggleCourse(course.id, !course.is_active)
                    }
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                      course.is_active
                        ? "bg-yellow-600 hover:bg-yellow-500"
                        : "bg-green-600 hover:bg-green-500"
                    }`}
                  >
                    {course.is_active ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
