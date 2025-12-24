import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const SignIn = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post("https://focus-fuze-1.onrender.com/auth/register", formData, {
        withCredentials: true,
      });

      toast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-slate-200/60 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-slate-200/60 blur-3xl" />
      </div>

      {/* Page content */}
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full items-center gap-8 lg:grid-cols-2">
          {/* Left: marketing panel */}
          <div className="hidden lg:block">
            <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 shadow-sm backdrop-blur">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                <span className="h-2 w-2 rounded-full bg-slate-900" />
                FocusFuze
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                Create your account,
                <span className="block text-slate-600">start focusing today.</span>
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Track personal goals, collaborate on team goals, take notes, and keep
                your calendar in one place — clean UI, fast workflow.
              </p>

              <div className="mt-6 grid gap-3">
                {[
                  "✅ Personal goals with progress",
                  "✅ Team goals + comments + meetings",
                  "✅ Notes + calendar planning",
                  "✅ Dashboard insights",
                ].map((t) => (
                  <div
                    key={t}
                    className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700"
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: signup form */}
          <div className="w-full">
            <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-7 shadow-sm backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Create Account
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Join us and boost your productivity.
                  </p>
                </div>

                <Link
                  to="/"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  title="Go Home"
                >
                  Home
                </Link>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Username
                  </label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Enter your username"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none transition focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none transition focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a strong password"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none transition focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Creating…
                    </>
                  ) : (
                    "SIGN UP"
                  )}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-slate-900 hover:underline">
                  Log In
                </Link>
              </p>
            </div>

            {/* Mobile quick info */}
            <div className="mx-auto mt-6 max-w-md rounded-3xl border border-slate-200 bg-white/70 p-5 text-sm text-slate-600 shadow-sm backdrop-blur lg:hidden">
              <div className="font-semibold text-slate-900">What you’ll get</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Personal goals with progress</li>
                <li>Team goals + meetings + comments</li>
                <li>Notes & calendar</li>
                <li>Dashboard insights</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
