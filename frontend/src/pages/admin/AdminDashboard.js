// frontend/src/pages/admin/AdminDashboard.js
import Header from "../../components/Header";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* PAGE HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-wide">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            System configuration & platform management
          </p>
        </div>

        {/* ACTION CARDS */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* COURSES */}
          <Link
            to="/admin/courses"
            className="group bg-slate-800/80 border border-slate-700 rounded-2xl p-6 hover:border-emerald-500 hover:shadow-xl transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-xl font-bold">
                C
              </div>
              <div>
                <h2 className="text-xl font-semibold group-hover:text-emerald-400 transition">
                  Manage Courses
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Create, edit, activate or deactivate courses
                </p>
              </div>
            </div>
          </Link>

          {/* TOPICS */}
          <Link
            to="/admin/topics"
            className="group bg-slate-800/80 border border-slate-700 rounded-2xl p-6 hover:border-indigo-500 hover:shadow-xl transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xl font-bold">
                T
              </div>
              <div>
                <h2 className="text-xl font-semibold group-hover:text-indigo-400 transition">
                  Manage Topics
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Add topics and control their visibility
                </p>
              </div>
            </div>
          </Link>

          {/* TEACHERS */}
          <Link
            to="/admin/teachers"
            className="group bg-slate-800/80 border border-slate-700 rounded-2xl p-6 hover:border-blue-500 hover:shadow-xl transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-xl font-bold">
                T
              </div>
              <div>
                <h2 className="text-xl font-semibold group-hover:text-blue-400 transition">
                  Manage Teachers
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  View, create and manage teacher accounts
                </p>
              </div>
            </div>
          </Link>

          {/* STUDENTS */}
          <Link
            to="/admin/students"
            className="group bg-slate-800/80 border border-slate-700 rounded-2xl p-6 hover:border-violet-500 hover:shadow-xl transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center text-xl font-bold">
                S
              </div>
              <div>
                <h2 className="text-xl font-semibold group-hover:text-violet-400 transition">
                  Manage Students
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  View student records and enrollment details
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
