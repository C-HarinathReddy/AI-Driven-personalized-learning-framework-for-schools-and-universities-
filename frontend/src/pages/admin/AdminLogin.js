import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/admin-login/",
        { username, password }
      );

      if (!res.data.access) {
        throw new Error("No token received");
      }

      localStorage.setItem("accessToken", res.data.access);
      localStorage.setItem("refreshToken", res.data.refresh);
      localStorage.setItem("userRole", "admin");

      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError("Admin login failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <form onSubmit={handleLogin} className="bg-slate-800 p-6 rounded-xl w-80">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>

        {error && <p className="text-red-400 mb-2">{error}</p>}

        <input
          className="w-full mb-3 px-3 py-2 bg-slate-700 rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          className="w-full mb-4 px-3 py-2 bg-slate-700 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full bg-blue-600 py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
