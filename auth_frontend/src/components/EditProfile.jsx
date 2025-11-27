import React, { useEffect, useState } from "react";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    bio: "",
  });

  useEffect(() => {
    api.get("profile/").then((res) => setForm(res.data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.put("profile/", form);
    navigate("/profile");
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          placeholder="First Name"
          className="w-full border p-3 rounded"
        />

        <input
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          placeholder="Last Name"
          className="w-full border p-3 rounded"
        />

        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full border p-3 rounded"
        />

        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Address"
          className="w-full border p-3 rounded"
        />

        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          placeholder="Write your bio..."
          className="w-full border p-3 rounded h-28"
        />

        <button className="w-full bg-green-600 text-white p-3 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
}
