// frontend/src/pages/admin/AdminStudents.js
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import api from "../../api";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [username, setUsername] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [institution, setInstitution] = useState("school");
  const [classYear, setClassYear] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      const res = await api.get("/admin/students/");
      setStudents(res.data);
    } catch {
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const createStudent = async () => {
    try {
      await api.post("/admin/students/create/", {
        username,
        roll_no: rollNo,
        institution_type: institution,
        class_or_year: classYear,
        department,
      });

      setUsername("");
      setRollNo("");
      setClassYear("");
      setDepartment("");
      setError("");
      fetchStudents();
    } catch {
      setError("Failed to create student");
    }
  };

  const deleteStudent = async (id) => {
    await api.delete(`/admin/students/${id}/delete/`);
    fetchStudents();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-wide">
            Manage Students
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create and manage student accounts
          </p>
        </div>

        {/* CREATE STUDENT CARD */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Create New Student
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-emerald-500"
            />

            <input
              placeholder="Roll No"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-emerald-500"
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
              value={classYear}
              onChange={(e) => setClassYear(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none"
            />

            <input
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none"
            />

            <button
              onClick={createStudent}
              className="bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold transition"
            >
              Create Student
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm mt-4">{error}</p>
          )}
        </div>

        {/* STUDENT LIST */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Existing Students
          </h2>

          {students.length === 0 && (
            <p className="text-slate-400">
              No students found.
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {students.map((s) => (
              <div
                key={s.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex justify-between items-center hover:border-red-500 transition"
              >
                <div>
                  <p className="font-semibold">
                    {s.username}{" "}
                    <span className="text-slate-400">
                      ({s.roll_no})
                    </span>
                  </p>
                  <p className="text-sm text-slate-400">
                    {s.institution_type} •{" "}
                    {s.class_or_year || "N/A"}
                  </p>
                </div>

                <button
                  onClick={() => deleteStudent(s.id)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
