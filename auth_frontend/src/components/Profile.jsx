import React, { useEffect, useState } from "react";
import { api, logoutLocal } from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("profile/")
      .then((res) => setProfile(res.data))
      .catch(() => navigate("/login"));
  }, []);

  const handleLogout = () => {
    logoutLocal();
    navigate("/login");
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await api.patch("avatar/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile({ ...profile, avatar: res.data.avatar });
    } catch (err) {
      console.error(err.response?.data);
    }
  };

  if (!profile)
    return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={profile.avatar || "/default-avatar.png"}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
            />
            <label
              htmlFor="avatarUpload"
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition"
              title="Change Avatar"
            >
              ✎
            </label>
            <input
              id="avatarUpload"
              type="file"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <h2 className="text-2xl font-bold mt-4 text-blue-700">
            {profile.first_name} {profile.last_name}
          </h2>
          <p className="text-gray-600 mt-1">{profile.email}</p>
          {profile.phone && (
            <p className="text-gray-600 mt-1">{profile.phone}</p>
          )}
          {profile.address && (
            <p className="text-gray-600 mt-1">{profile.address}</p>
          )}
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
