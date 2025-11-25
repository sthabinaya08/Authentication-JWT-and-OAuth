import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/axios";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    password: "",
    avatar: null,
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (formData.avatar) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(formData.avatar);
    } else {
      setAvatarPreview(null);
    }
  }, [formData.avatar]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      setFormData({ ...formData, avatar: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const data = new FormData();
      data.append("email", formData.email);
      data.append("first_name", formData.first_name);
      data.append("last_name", formData.last_name);
      data.append("phone", formData.phone);
      data.append("address", formData.address);
      data.append("password", formData.password);
      if (formData.avatar) data.append("avatar", formData.avatar);

      await api.post("register/", data); // ✅ let Axios handle Content-Type
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data
          ? Object.values(err.response.data).flat()[0]
          : "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-tr from-blue-100 via-white to-blue-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700">
          Create Account
        </h2>

        {error && (
          <div className="text-red-600 bg-red-100 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 mb-2 relative">
              <img
                src={avatarPreview || "/default-avatar.png"}
                alt="avatar preview"
                className="w-28 h-28 rounded-full object-cover border-2 border-blue-500"
              />
            </div>
            <label className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">
              Choose Avatar
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>

          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 rounded-lg shadow-sm"
            required
          />
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 rounded-lg shadow-sm"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 rounded-lg shadow-sm"
            required
          />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 rounded-lg shadow-sm"
          />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 rounded-lg shadow-sm"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 rounded-lg shadow-sm"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white p-3 rounded-lg font-semibold shadow"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
