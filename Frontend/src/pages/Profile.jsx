import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    contact: "",
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
    },
    profilePhoto: null,
  });
  const [loading, setLoading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const API_URL = "http://localhost:3000/api/profile";
  const BASE_URL = "http://localhost:3000"; // Base URL for static files

  // Fetch profile data on component mount
  useEffect(() => {
    if (!userId) {
      toast.error("Please log in to access your profile");
      navigate("/login");
      return;
    }
    fetchProfile();
  }, [userId, navigate]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      const data = response.data || {};
      console.log("Fetched profile data:", data); // Debug log
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
      // Construct the correct URL for the profile photo
      setPreviewPhoto(data.profilePhoto ? `${BASE_URL}${data.profilePhoto}` : null);
      console.log("Constructed preview photo URL:", data.profilePhoto ? `${BASE_URL}${data.profilePhoto}` : null); // Debug log
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Error fetching profile: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload for profile photo
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
    console.log("Selected file:", file); // Debug log
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image size must be less than 5MB");
      return;
    }
    setProfile((prev) => ({ ...prev, profilePhoto: file }));
    const previewUrl = URL.createObjectURL(file);
    setPreviewPhoto(previewUrl); // Update preview with new file
    console.log("Preview URL generated:", previewUrl); // Debug log
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (previewPhoto && previewPhoto.startsWith("blob:")) {
        URL.revokeObjectURL(previewPhoto);
      }
    };
  }, [previewPhoto]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle social media link changes
  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [name]: value },
    }));
  };

  // Save profile details
  const saveProfile = async () => {
    if (!profile.name.trim()) {
      toast.warn("Name is required");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("name", profile.name);
      formData.append("bio", profile.bio);
      formData.append("contact", profile.contact);
      formData.append("socialMedia", JSON.stringify(profile.socialMedia));
      if (profile.profilePhoto && typeof profile.profilePhoto !== "string") {
        formData.append("profilePhoto", profile.profilePhoto);
      } else {
        formData.append("profilePhoto", ""); // Send empty if no new photo
      }

      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Save response:", response.data); // Debug log
      toast.success("Profile saved successfully!");
      setIsEditing(false);
      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Error saving profile: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("userId");
    toast.success("Logged out successfully!");
    setTimeout(() => navigate("/login"), 1000);
  };

  return (
    <div className="profile-main-container">
      {/* Toast notification container */}
      <ToastContainer position="top-right" autoClose={2000} className="profile-toast-container" />

      {/* Loader */}
      {loading && (
        <div className="profile-loader-container">
          <img
            src="https://cdn-icons-png.freepik.com/256/11857/11857533.png"
            alt="Loading..."
            className="profile-loader"
          />
        </div>
      )}

      <h2 className="profile-heading">Your Profile</h2>
      <p className="profile-subheading">Manage Your Details</p>

      <div className="profile-content">
        <div className="profile-photo-section">
          <div className="profile-photo-wrapper">
            {previewPhoto ? (
              <img
                src={previewPhoto}
                alt="Profile"
                className="profile-photo"
                onError={(e) => {
                  console.log("Image load error, reverting to placeholder:", e.target.src);
                  e.target.src = ""; // Clear invalid src
                  setPreviewPhoto(null); // Revert to placeholder
                }}
              />
            ) : (
              <div className="profile-photo-placeholder">
                <span>No Photo</span>
              </div>
            )}
          </div>
          {isEditing && (
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="profile-photo-input"
            />
          )}
        </div>

        <div className="profile-details-section">
          {isEditing ? (
            <>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                placeholder="Name"
                className="profile-input-field"
              />
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                placeholder="Bio"
                className="profile-input-field profile-textarea"
              />
              <input
                type="text"
                name="contact"
                value={profile.contact}
                onChange={handleInputChange}
                placeholder="Contact Info (Email/Phone)"
                className="profile-input-field"
              />
              <div className="profile-social-media">
                <input
                  type="url"
                  name="facebook"
                  value={profile.socialMedia.facebook}
                  onChange={handleSocialMediaChange}
                  placeholder="Facebook URL"
                  className="profile-input-field"
                />
                <input
                  type="url"
                  name="twitter"
                  value={profile.socialMedia.twitter}
                  onChange={handleSocialMediaChange}
                  placeholder="Twitter URL"
                  className="profile-input-field"
                />
                <input
                  type="url"
                  name="instagram"
                  value={profile.socialMedia.instagram}
                  onChange={handleSocialMediaChange}
                  placeholder="Instagram URL"
                  className="profile-input-field"
                />
                <input
                  type="url"
                  name="linkedin"
                  value={profile.socialMedia.linkedin}
                  onChange={handleSocialMediaChange}
                  placeholder="LinkedIn URL"
                  className="profile-input-field"
                />
              </div>
              <div className="profile-actions">
                <button onClick={saveProfile} className="profile-save-btn">
                  Save
                </button>
                <button onClick={() => setIsEditing(false)} className="profile-cancel-btn">
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="profile-name">{profile.name || "No Name Set"}</h3>
              <p className="profile-bio">{profile.bio || "No Bio Set"}</p>
              <p className="profile-contact">
                Contact: {profile.contact || "No Contact Info"}
              </p>
              <div className="profile-social-links">
                {profile.socialMedia.facebook && (
                  <a
                    href={profile.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-social-link"
                  >
                    Facebook
                  </a>
                )}
                {profile.socialMedia.twitter && (
                  <a
                    href={profile.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-social-link"
                  >
                    Twitter
                  </a>
                )}
                {profile.socialMedia.instagram && (
                  <a
                    href={profile.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-social-link"
                  >
                    Instagram
                  </a>
                )}
                {profile.socialMedia.linkedin && (
                  <a
                    href={profile.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-social-link"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
              <div className="profile-actions">
                <button onClick={() => setIsEditing(true)} className="profile-edit-btn">
                  Edit Profile
                </button>
                <button onClick={handleLogout} className="profile-logout-btn">
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;