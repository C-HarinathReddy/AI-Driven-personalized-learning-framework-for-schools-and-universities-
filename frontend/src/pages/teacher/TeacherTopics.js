import { useEffect, useState } from "react";
import Header from "../../components/Header";
import api from "../../api";

export default function TeacherTopics() {
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [courseId, setCourseId] = useState("");

  const loadData = async () => {
    const t = await api.get("/teacher/topics/");
    const c = await api.get("/teacher/courses/");
    setTopics(t.data);
    setCourses(c.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createTopic = async () => {
    if (!topicName || !courseId) return;

    await api.post("/teacher/topics/create/", {
      topic_name: topicName,
      course: courseId,
    });

    setTopicName("");
    setCourseId("");
    loadData();
  };

  const toggleTopic = async (id) => {
    try {
      await api.patch(`/teacher/topics/${id}/toggle/`);
      loadData();
    } catch {
      alert("Failed to update topic status");
    }
  };

  const deleteTopic = async (id) => {
    if (!window.confirm("Delete this topic?")) return;
    await api.delete(`/teacher/topics/${id}/delete/`);
    loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-wide">Manage Topics</h1>
          <p className="text-slate-400 text-sm mt-1">
            Create and manage topics for your courses
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New Topic</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              placeholder="Topic name"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-blue-500"
            />

            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none"
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={createTopic}
              className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-semibold transition"
            >
              Create Topic
            </button>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4">Your Topics</h2>

        {topics.length === 0 ? (
          <p className="text-slate-400">No topics created yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {topics.map((t) => (
              <div
                key={t.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 hover:border-blue-500 transition flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-600/20 text-blue-400 border border-blue-500">
                      ID: {t.id}
                    </span>
                  </div>

                  <p className="font-semibold text-lg">
                    Topic: {t.topic_name}
                  </p>

                  <p className="text-sm text-slate-400">
                    Course: {t.course?.name}
                  </p>

                  <p className="text-sm mt-1">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        t.is_active ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {t.is_active ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleTopic(t.id)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                      t.is_active
                        ? "bg-yellow-600 hover:bg-yellow-500"
                        : "bg-green-600 hover:bg-green-500"
                    }`}
                  >
                    {t.is_active ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    onClick={() => deleteTopic(t.id)}
                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
