import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/axios";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post("login/", { email, password });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      navigate("/profile");
    } catch (err) {
      setError(
        err.response?.data?.non_field_errors
          ? err.response.data.non_field_errors[0]
          : "Login failed"
      );
    }
  };

  const handleGoogle = async (credentialResponse) => {
    try {
      const res = await api.post("google-login/", {
        id_token: credentialResponse.credential,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      navigate("/profile");
    } catch (err) {
      console.error("Google Login Error:", err.response?.data || err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 via-white to-blue-50 p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-gray-700 text-center">
          Welcome
        </h2>
        <p className="text-gray-500 text-center mb-8">Sign in to continue</p>

        {error && (
          <div className="text-red-600 mb-4 text-center font-medium bg-red-50 p-2 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg text-lg shadow-sm transition">
            Sign in
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogle}
            onError={() => console.log("Google Login Failed")}
          />
        </div>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
