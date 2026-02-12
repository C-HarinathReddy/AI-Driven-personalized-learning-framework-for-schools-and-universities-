// frontend/src/pages/admin/AdminTopics.js
import { useEffect, useState } from "react";
import api from "../../api";
import Header from "../../components/Header";

export default function AdminTopics() {
  const [topics, setTopics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [topicName, setTopicName] = useState("");
  const [courseId, setCourseId] = useState("");

  const loadData = async () => {
    try {
      const t = await api.get("/admin/topics/");
      const c = await api.get("/admin/courses/");
      setTopics(t.data);
      setCourses(c.data);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createTopic = async () => {
    await api.post("/admin/topics/", {
      topic_name: topicName,
      course: courseId,
    });
    setTopicName("");
    setCourseId("");
    loadData();
  };

  const toggleTopic = async (id, is_active) => {
    await api.patch(`/admin/topics/${id}/`, { is_active });
    loadData();
  };

  const deleteTopic = async (id) => {
    await api.delete(`/admin/topics/${id}/`);
    loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-wide">
            Manage Topics
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create topics and control their visibility
          </p>
        </div>

        {/* CREATE TOPIC */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Create New Topic
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none focus:border-emerald-500"
              placeholder="Topic name"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
            />

            <select
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 focus:outline-none"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
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
              className="bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold transition"
            >
              Create Topic
            </button>
          </div>
        </div>

        {/* STATES */}
        {loading && <p>Loading topics...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {/* TOPIC LIST */}
        {!loading && !error && (
          <>
            <h2 className="text-lg font-semibold mb-4">
              Existing Topics
            </h2>

            {topics.length === 0 && (
              <p className="text-slate-400">
                No topics available.
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 hover:border-blue-500 transition"
                >
                  <div>
                    <p className="text-lg font-semibold">
                      Topic: {topic.topic_name}
                    </p>

                    <p className="text-sm text-slate-400">
                      Course: {topic.course?.name || "N/A"}
                    </p>

                    <p className="text-sm mt-1">
                      Status:{" "}
                      <span
                        className={
                          topic.is_active
                            ? "text-green-400 font-semibold"
                            : "text-red-400 font-semibold"
                        }
                      >
                        {topic.is_active ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() =>
                        toggleTopic(topic.id, !topic.is_active)
                      }
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                        topic.is_active
                          ? "bg-yellow-600 hover:bg-yellow-500"
                          : "bg-green-600 hover:bg-green-500"
                      }`}
                    >
                      {topic.is_active ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      onClick={() => deleteTopic(topic.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
