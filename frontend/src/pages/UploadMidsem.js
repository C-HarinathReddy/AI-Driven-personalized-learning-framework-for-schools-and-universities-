import { useState, useEffect } from "react";
import { uploadAssessment } from "../api";
import Header from "../components/Header";

const QUESTIONS = Array.from({ length: 11 }, (_, i) => `q${i + 1}`);

export default function UploadMidsem() {
  const [file, setFile] = useState(null);

  // Question → Topic map as object
  const [questionMap, setQuestionMap] = useState({
    q1: 1,
    q2: 1,
    q3: 2,
    q4: 2,
    q5: 3,
    q6: 3,
    q7: 4,
    q8: 4,
    q9: 1,
    q10: 2,
    q11: 3,
  });

  // JSON string sent to backend
  const [mappingText, setMappingText] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* AUTO-CONVERT MAP → JSON */
  useEffect(() => {
    setMappingText(JSON.stringify(questionMap));
  }, [questionMap]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setMessage("");
  };

  const handleTopicChange = (q, value) => {
    if (!value) return;
    setQuestionMap((prev) => ({
      ...prev,
      [q]: Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a CSV or Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append("assessment_type", "midsem");
    formData.append("file", file);
    formData.append("question_topic_mapping", mappingText);

    try {
      setLoading(true);
      const data = await uploadAssessment(formData);
      setMessage(data.message || "Mid-Sem data uploaded successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Error uploading mid-sem file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Upload Mid-Sem Marks</h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload marks and map each question to its topic
          </p>
        </div>

        {/* CARD */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 max-w-3xl">
          {/* INFO */}
          <div className="text-sm text-slate-300 mb-6">
            <p>Expected columns in file:</p>
            <code className="text-blue-400">
              student_id, student_name, q1, q2, ..., q11
            </code>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* FILE UPLOAD */}
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-5 text-center">
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-300
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-lg file:border-0
                           file:text-sm file:font-semibold
                           file:bg-blue-600 file:text-white
                           hover:file:bg-blue-500 cursor-pointer"
              />
              <p className="text-xs text-slate-400 mt-2">
                CSV or Excel (.xlsx) only
              </p>
            </div>

            {/* QUESTION → TOPIC GRID */}
            <div>
              <h2 className="text-lg font-semibold mb-3">
                Question → Topic Mapping
              </h2>

              <p className="text-xs text-slate-400 mb-3">
                Enter the Topic ID for each question (from Admin / Teacher panel)
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {QUESTIONS.map((q) => (
                  <div
                    key={q}
                    className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-2"
                  >
                    <span className="text-sm font-medium w-10 uppercase">
                      {q}
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={questionMap[q]}
                      onChange={(e) =>
                        handleTopicChange(q, e.target.value)
                      }
                      className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-600 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* JSON PREVIEW */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Generated JSON (auto)
              </label>
              <textarea
                readOnly
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-400"
                value={mappingText}
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-500 font-semibold disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Upload Mid-Sem File"}
            </button>
          </form>

          {message && (
            <div className="mt-4 text-sm text-slate-200">{message}</div>
          )}
        </div>
      </div>
    </div>
  );
}
