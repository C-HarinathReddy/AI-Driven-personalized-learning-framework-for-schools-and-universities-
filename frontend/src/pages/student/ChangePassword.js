import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!password || !confirm) {
      setError("All fields are required");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/student-change-password/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roll_no: localStorage.getItem("studentRollNo"),
            password: password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Password change failed");
        return;
      }

      // 🔥 THIS WAS MISSING
      localStorage.setItem("studentLoggedIn", "true");
      localStorage.setItem("userRole", "student");

      navigate("/student");
    } catch {
      setError("Something went wrong");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-6 rounded w-96">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>

        {error && <p className="text-red-400 mb-3">{error}</p>}

        <input
          type="password"
          placeholder="New password"
          className="w-full p-2 mb-3 text-black rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm password"
          className="w-full p-2 mb-4 text-black rounded"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 py-2 rounded"
        >
          Update Password
        </button>
      </div>
    </div>
  );
}
