import React, { useEffect, useState } from "react";
import { api, logoutLocal } from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [profile, setProfile] = useState(null);
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
    <div className="min-h-screen bg-gray-100 flex justify-center py-10">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-48 bg-blue-500">
          <img
            src="/default-cover.jpg" // Replace with actual cover image
            alt="cover"
            className="w-full h-full object-cover"
          />
          {/* Profile Picture */}
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              <img
                src={profile.avatar || "/default-avatar.png"}
                alt="avatar"
                className="w-28 h-28 rounded-full border-4 border-white object-cover"
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
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-16 px-6 pb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-gray-600 mt-1">{profile.email}</p>
              {profile.phone && (
                <p className="text-gray-600 mt-1">{profile.phone}</p>
              )}
              {profile.address && (
                <p className="text-gray-600 mt-1">{profile.address}</p>
              )}
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
