import React, { useEffect, useState } from "react";
import { api, logoutLocal } from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch profile on mount
  useEffect(() => {
    api
      .get("profile/")
      .then((res) => setProfile(res.data))
      .catch(() => navigate("/login"));
  }, []);

  // Logout
  const handleLogout = () => {
    logoutLocal();
    navigate("/login");
  };

  // Avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await api.patch("profile/", formData);
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
            src="/default-cover.jpg" // Replace with your cover image
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {profile.first_name} {profile.last_name}
              </h1>

              {/* Bio Below Name */}
              {profile.bio && (
                <p className="text-gray-700 mt-2 italic">{profile.bio}</p>
              )}

              <p className="text-gray-600 mt-1">{profile.email}</p>
              {profile.phone && (
                <p className="text-gray-600 mt-1">{profile.phone}</p>
              )}
              {profile.address && (
                <p className="text-gray-600 mt-1">{profile.address}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setEditOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
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

      {/* Edit Profile Modal */}
      {editOpen && (
        <EditModal
          profile={profile}
          setProfile={setProfile}
          setOpen={setEditOpen}
        />
      )}
    </div>
  );
}

// ------------------------
// Edit Modal Component
// ------------------------
function EditModal({ profile, setProfile, setOpen }) {
  const [form, setForm] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    phone: profile.phone || "",
    address: profile.address || "",
    bio: profile.bio || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await api.patch("profile/", form);
      setProfile(res.data);
      setOpen(false);
    } catch (err) {
      console.error(err.response?.data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

        <div className="space-y-4">
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full p-3 border rounded"
          />
          <input
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full p-3 border rounded"
          />
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full p-3 border rounded"
          />
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full p-3 border rounded"
          />
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Write your bio..."
            className="w-full p-3 border rounded h-28"
          />
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
