import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [open, setOpen] = useState(false);

  const userId = localStorage.getItem("userId");

  const API_URL = "https://focus-fuze-1.onrender.com/api/profile";
  const BASE_URL = "https://focus-fuze-1.onrender.com";
  const defaultAvatar =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  /* Fetch profile photo */
  useEffect(() => {
    if (!userId) return;

    axios
      .get(`${API_URL}/${userId}`)
      .then((res) => {
        if (res.data?.profilePhoto) {
          setProfilePhoto(`${BASE_URL}${res.data.profilePhoto}`);
        }
      })
      .catch(() => setProfilePhoto(null));
  }, [userId]);

  /* Close mobile menu on route change */
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const logout = async () => {
    await fetch("https://focus-fuze-1.onrender.com/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const links = [
    { name: "Personal Goals", path: "/personal-goals" },
    { name: "Team Goal", path: "/team-goals" },
    { name: "Notes", path: "/notes" },
    { name: "Calendar", path: "/calendar" },
    { name: "NoteTube", path: "/save-video" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10">

        {/* LOGO */}
        <Link to="/home" className="flex items-center gap-2">
          <span className="rounded-md bg-slate-900 px-2 py-1 text-xs font-bold tracking-widest text-white">
            FOCUS
          </span>
          <span className="text-sm font-semibold tracking-wide text-slate-900">
            FUZE
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`rounded-full px-4 py-2 text-sm font-medium transition
                ${
                  isActive(link.path)
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="hidden sm:block rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>

          <Link to="/profile">
            <img
              src={profilePhoto || defaultAvatar}
              alt="Profile"
              className="h-9 w-9 rounded-full border object-cover"
            />
          </Link>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden rounded-lg border border-slate-200 p-2"
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden px-4 pb-4">
          <div className="rounded-xl border bg-white shadow">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 text-sm
                  ${
                    isActive(link.path)
                      ? "bg-slate-900 text-white"
                      : "hover:bg-slate-50"
                  }`}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={logout}
              className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
