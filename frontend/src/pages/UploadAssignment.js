// frontend/src/pages/UploadAssignment.js
import { useState } from "react";
import { uploadAssessment } from "../api";
import Header from "../components/Header";

export default function UploadAssignment() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a CSV or Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append("assessment_type", "assignment");
    formData.append("file", file);

    try {
      setLoading(true);
      const data = await uploadAssessment(formData);
      setMessage(data.message || "Assignment data uploaded successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Error uploading assignment file. Check console / backend logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-wide">
            Upload Assignment Marks
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload topic-wise assignment scores using CSV or Excel
          </p>
        </div>

        {/* UPLOAD CARD */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 max-w-xl">
          <p className="text-sm text-slate-300 mb-4">
            Expected columns:
            <br />
            <code className="text-blue-400">
              student_id, student_name, topic_name, score
            </code>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* FILE INPUT */}
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:border-blue-500 transition">
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

              <p className="text-xs text-slate-400 mt-3">
                CSV or Excel (.xlsx) files only
              </p>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-500 font-semibold transition disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Upload Assignment File"}
            </button>
          </form>

          {/* MESSAGE */}
          {message && (
            <div className="mt-4 text-sm text-slate-200">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
