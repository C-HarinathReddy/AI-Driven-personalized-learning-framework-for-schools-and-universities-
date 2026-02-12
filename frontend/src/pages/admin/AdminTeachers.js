// frontend/src/pages/admin/AdminTeachers.js
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import api from "../../api";

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("school");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");

  const fetchTeachers = async () => {
    try {
      const res = await api.get("/admin/teachers/");
      setTeachers(res.data);
    } catch {
      setTeachers([]);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const createTeacher = async () => {
    try {
      await api.post("/admin/teachers/create/", {
        username,
        password,
        institution_type: institution,
        department,
      });

      setUsername("");
      setPassword("");
      setDepartment("");
      setError("");
      fetchTeachers();
    } catch {
      setError("Failed to create teacher");
    }
  };

  const deleteTeacher = async (id) => {
    await api.delete(`/admin/teachers/${id}/delete/`);
    fetchTeachers();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-wide">
            Manage Teachers
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create and manage teacher accounts
          </p>
        </div>

        {/* CREATE TEACHER */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Create New Teacher
          </h2>

          <div className="grid gap-4 md:grid-cols-4">
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-emerald-500"
            />

            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={createTeacher}
            className="mt-4 bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-lg font-semibold transition"
          >
            Create Teacher
          </button>
        </div>

        {error && (
          <p className="text-red-400 mb-6">{error}</p>
        )}

        {/* TEACHER LIST */}
        <h2 className="text-lg font-semibold mb-4">
          Existing Teachers
        </h2>

        {teachers.length === 0 ? (
          <p className="text-slate-400">
            No teachers available.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 hover:border-blue-500 transition flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-lg">
                    {t.username}
                  </p>
                  <p className="text-sm text-slate-400">
                    {t.institution_type} |{" "}
                    {t.department || "N/A"}
                  </p>
                </div>

                <button
                  onClick={() => deleteTeacher(t.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold transition"
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
