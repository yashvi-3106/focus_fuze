import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "https://focus-fuze-1.onrender.com/api/profile";
const BASE_URL = "https://focus-fuze-1.onrender.com";
const fallbackAvatar =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const inputBase =
  "w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]";

const Profile = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    contact: "",
    socialMedia: { facebook: "", twitter: "", instagram: "", linkedin: "" },
    profilePhoto: null, // File when editing, string from server when fetched
  });

  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch profile
  useEffect(() => {
    if (!userId) {
      toast.error("Please log in to access your profile");
      navigate("/login");
      return;
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/${userId}`);
      const data = res.data || {};

      setProfile({
        name: data.name || "",
        bio: data.bio || "",
        contact: data.contact || "",
        socialMedia: {
          facebook: data.socialMedia?.facebook || "",
          twitter: data.socialMedia?.twitter || "",
          instagram: data.socialMedia?.instagram || "",
          linkedin: data.socialMedia?.linkedin || "",
        },
        profilePhoto: data.profilePhoto || null,
      });

      // ✅ IMPORTANT: backend returns "uploads/xxx.jpg" => needs BASE_URL + "/"
      setPreviewPhoto(data.profilePhoto ? `${BASE_URL}/${data.profilePhoto}` : null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  // File upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setProfile((p) => ({ ...p, profilePhoto: file }));

    const url = URL.createObjectURL(file);
    setPreviewPhoto(url);
  };

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (previewPhoto?.startsWith("blob:")) URL.revokeObjectURL(previewPhoto);
    };
  }, [previewPhoto]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({
      ...p,
      socialMedia: { ...p.socialMedia, [name]: value },
    }));
  };

  const saveProfile = async () => {
    if (!profile.name.trim()) {
      toast.warn("Name is required");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("userId", userId);
      fd.append("name", profile.name);
      fd.append("bio", profile.bio);
      fd.append("contact", profile.contact);
      fd.append("socialMedia", JSON.stringify(profile.socialMedia));

      // ✅ Only append if user picked a new file
      if (profile.profilePhoto && typeof profile.profilePhoto !== "string") {
        fd.append("profilePhoto", profile.profilePhoto);
      }

      await axios.post(API_URL, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile saved!");
      setIsEditing(false);
      await fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    toast.success("Logged out!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 pt-[96px] pb-10">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                Profile
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your info & social links.
              </p>
            </div>

            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProfile}
                    disabled={loading}
                    className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </>
              )}

              <button
                onClick={handleLogout}
                className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* Left card: avatar */}
          <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <img
                  src={previewPhoto || fallbackAvatar}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = fallbackAvatar;
                  }}
                />
              </div>

              <div className="min-w-0">
                <div className="text-sm text-slate-500">Signed in as</div>
                <div className="truncate text-lg font-semibold text-slate-900">
                  {profile.name || "Unnamed user"}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-5">
                <label className="text-sm font-medium text-slate-700">
                  Profile photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="mt-2 block w-full text-sm"
                />
                <p className="mt-2 text-xs text-slate-500">
                  JPG/PNG up to 5MB.
                </p>
              </div>
            )}

            {loading && (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                Loading...
              </div>
            )}
          </div>

          {/* Right card: details */}
          <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-6">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Name</label>
                {isEditing ? (
                  <input
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className={inputBase}
                    placeholder="Your name"
                  />
                ) : (
                  <div className="mt-2 text-slate-900 font-medium">
                    {profile.name || "—"}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Bio</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    className={`${inputBase} min-h-[120px] resize-none`}
                    placeholder="A short bio..."
                  />
                ) : (
                  <div className="mt-2 text-slate-700 whitespace-pre-line">
                    {profile.bio || "—"}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Contact</label>
                {isEditing ? (
                  <input
                    name="contact"
                    value={profile.contact}
                    onChange={handleInputChange}
                    className={inputBase}
                    placeholder="Email / phone"
                  />
                ) : (
                  <div className="mt-2 text-slate-700">{profile.contact || "—"}</div>
                )}
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">
                    Social links
                  </h3>
                  <span className="text-xs text-slate-500">
                    Optional
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {["facebook", "twitter", "instagram", "linkedin"].map((key) => (
                    <div key={key}>
                      <label className="text-sm font-medium text-slate-700 capitalize">
                        {key}
                      </label>
                      {isEditing ? (
                        <input
                          name={key}
                          value={profile.socialMedia[key]}
                          onChange={handleSocialChange}
                          className={inputBase}
                          placeholder={`https://${key}.com/...`}
                        />
                      ) : profile.socialMedia[key] ? (
                        <a
                          href={profile.socialMedia[key]}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 block truncate text-sm font-medium text-indigo-700 hover:underline"
                        >
                          {profile.socialMedia[key]}
                        </a>
                      ) : (
                        <div className="mt-2 text-sm text-slate-500">—</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {!isEditing && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">
                    Quick tips
                  </div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1">
                    <li>Use a clear profile photo for better identity.</li>
                    <li>Keep bio short (1–2 lines).</li>
                    <li>Add LinkedIn if you want professional visibility.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
