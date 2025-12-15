import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const categories = ["Work", "Study", "Health", "Finance", "Personal"];

const priorityMeta = {
  High: {
    strip: "from-rose-500 to-rose-300",
    card: "bg-rose-50/80",
    ring: "ring-rose-200",
    dot: "bg-rose-500",
  },
  Medium: {
    strip: "from-amber-500 to-amber-300",
    card: "bg-amber-50/80",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
  },
  Low: {
    strip: "from-emerald-500 to-emerald-300",
    card: "bg-emerald-50/80",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
  },
};

const statusBadge = {
  Completed: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  "Not Started": "bg-slate-100 text-slate-700 ring-slate-200",
  "In Progress": "bg-indigo-100 text-indigo-700 ring-indigo-200",
};

const statusProgress = (status) => {
  if (status === "Completed") return 100;
  if (status === "In Progress") return 55;
  return 0;
};

const getInitials = (text = "") => {
  const t = text.trim();
  if (!t) return "G";
  const parts = t.split(" ").filter(Boolean);
  return ((parts[0]?.[0] || "G") + (parts[1]?.[0] || "")).toUpperCase();
};

const PersonalGoal = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "Medium",
    rewardPoints: "",
    status: "Not Started",
    category: "Personal",
  });

  // ---------- Auth + initial load ----------
  useEffect(() => {
    if (!userId) {
      toast.error("User not authenticated. Please log in.");
      navigate("/login");
      return;
    }
    fetchGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ---------- ESC closes modal ----------
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Notifications (fixed: no stale goals) ----------
  useEffect(() => {
    Notification.requestPermission();

    const run = () => checkDueDates(goals);
    run();

    const id = setInterval(run, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [goals]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://focus-fuze.onrender.com/personal-goals/${userId}`
      );
      setGoals(res.data || []);
    } catch {
      toast.error("Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Modal helpers ----------
  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      deadline: "",
      priority: "Medium",
      rewardPoints: "",
      status: "Not Started",
      category: "Personal",
    });
    setIsOpen(true);
  };

  const openEdit = (goal) => {
    setEditingId(goal._id);
    setForm({
      title: goal.title || "",
      description: goal.description || "",
      deadline: goal.deadline ? goal.deadline.slice(0, 10) : "",
      priority: goal.priority || "Medium",
      rewardPoints: goal.rewardPoints ?? "",
      status: goal.status || "Not Started",
      category: goal.category || "Personal",
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingId(null);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // ---------- CRUD ----------
  const save = async () => {
    if (!form.title || !form.description || !form.deadline || !form.priority) {
      toast.error("Fill all required fields");
      return;
    }

    const payload = {
      ...form,
      userId,
      rewardPoints: form.rewardPoints ? parseInt(form.rewardPoints, 10) : undefined,
    };

    try {
      if (editingId) {
        await axios.put(
          `https://focus-fuze.onrender.com/personal-goals/${editingId}`,
          payload
        );
        toast.success("Goal updated");
      } else {
        await axios.post(
          "https://focus-fuze.onrender.com/personal-goals",
          payload
        );
        toast.success("Goal added");
      }

      await fetchGoals();
      closeModal();
    } catch {
      toast.error(editingId ? "Update failed" : "Failed to add goal");
    }
  };

  const deleteGoal = async (id) => {
    try {
      await axios.delete(`https://focus-fuze.onrender.com/personal-goals/${id}`);
      toast.success("Goal deleted");
      fetchGoals();
    } catch {
      toast.error("Delete failed");
    }
  };

  const markAsComplete = async (id) => {
    try {
      const res = await axios.put(
        `https://focus-fuze.onrender.com/personal-goals/${id}/complete`
      );
      setGoals((prev) => prev.map((g) => (g._id === id ? res.data : g)));
      toast.success("Completed");
    } catch {
      toast.error("Failed");
    }
  };

  // ---------- Notifications ----------
  const checkDueDates = (list) => {
    if (Notification.permission !== "granted") return;

    const now = new Date();
    list.forEach((goal) => {
      if (!goal?.deadline) return;

      const hoursLeft = Math.ceil(
        (new Date(goal.deadline) - now) / (1000 * 60 * 60)
      );

      if (hoursLeft > 0 && hoursLeft <= 24 && goal.status !== "Completed") {
        new Notification("Goal Reminder", {
          body: `"${goal.title}" due in ${hoursLeft} hour(s)`,
        });
      }
    });
  };

  const subtitle = useMemo(() => {
    const completed = goals.filter((g) => g.status === "Completed").length;
    return `${goals.length} goals • ${completed} completed`;
  }, [goals]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* ✅ FIX: navbar height is 64px => pt-16 (not 96px) */}
      <div className="pt-16">
        {/* Header */}
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white/85 backdrop-blur shadow-sm">
            <div className="flex items-center justify-between gap-3 px-6 py-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  My Goals
                </h1>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
              </div>

              <button
                type="button"
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 active:scale-[0.98] transition"
              >
                <span className="text-lg leading-none">+</span>
                Create Goal
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mx-auto max-w-6xl px-4 pb-10">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-8 shadow-sm">
              <div className="animate-pulse space-y-4">
                <div className="h-5 w-40 rounded bg-slate-200" />
                <div className="h-28 rounded bg-slate-200" />
                <div className="h-28 rounded bg-slate-200" />
              </div>
            </div>
          ) : goals.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-10 shadow-sm text-center">
              <h3 className="text-lg font-semibold text-slate-900">No goals yet</h3>
              <p className="mt-1 text-slate-500">Click “Create Goal” to add your first one.</p>
              <button
                type="button"
                onClick={openCreate}
                className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                + Create Goal
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => {
                const meta = priorityMeta[goal.priority] || priorityMeta.Medium;
                const badge =
                  statusBadge[goal.status] || statusBadge["Not Started"];
                const progress = statusProgress(goal.status);
                const initials = getInitials(goal.title);

                return (
                  <div
                    key={goal._id}
                    className={`group relative overflow-hidden rounded-3xl ${meta.card} ring-1 ${meta.ring}
                      shadow-[0_18px_40px_-26px_rgba(15,23,42,0.35)]
                      hover:shadow-[0_26px_60px_-34px_rgba(15,23,42,0.45)] transition`}
                  >
                    {/* Priority strip */}
                    <div className={`absolute left-0 top-0 h-full w-2 bg-gradient-to-b ${meta.strip}`} />

                    <div className="p-5 pl-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-2xl bg-white/75 ring-1 ring-white/60 shadow-sm flex items-center justify-center font-bold text-slate-700">
                              {initials}
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate text-base font-semibold text-slate-900">
                                {goal.title}
                              </h3>
                              <p className="mt-0.5 text-xs text-slate-600">
                                {goal.category || "Personal"}
                              </p>
                            </div>
                          </div>

                          <p className="mt-3 text-sm text-slate-700 line-clamp-2">
                            {goal.description}
                          </p>
                        </div>

                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badge}`}>
                          {goal.status}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-700">
                          {/* ✅ removed emoji (you asked before) */}
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/65 ring-1 ring-white/60">
                            <svg
                              viewBox="0 0 24 24"
                              className="h-5 w-5 text-slate-700"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                          </span>
                          <span className="font-medium">
                            {new Date(goal.deadline).toLocaleDateString()}
                          </span>
                        </div>

                        {goal.rewardPoints ? (
                          <span className="rounded-full bg-white/65 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-white/60">
                            {goal.rewardPoints} pts
                          </span>
                        ) : null}
                      </div>

                      {/* Progress */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span>Progress</span>
                          <span className="font-semibold">{progress}%</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-white/65 ring-1 ring-white/60 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${meta.strip}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions on hover */}
                      <div className="mt-5 flex items-center justify-end gap-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition">
                        <button
                          type="button"
                          onClick={() => openEdit(goal)}
                          className="rounded-xl bg-white/75 px-3 py-2 text-sm font-semibold text-slate-800 ring-1 ring-white/60 hover:bg-white transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          onClick={() => markAsComplete(goal._id)}
                          disabled={goal.status === "Completed"}
                          className={`rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition
                            ${
                              goal.status === "Completed"
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200 cursor-not-allowed opacity-70"
                                : "bg-emerald-600 text-white ring-emerald-600 hover:bg-emerald-500"
                            }`}
                          title="Complete"
                        >
                          <TiTick />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteGoal(goal._id)}
                          className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white ring-1 ring-rose-600 hover:bg-rose-500 transition"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={closeModal}
            aria-label="Close modal"
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="w-full max-w-xl rounded-3xl border border-white/40 bg-white/75 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(15,23,42,0.55)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                      {editingId ? "Edit Goal" : "Create Goal"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      A calm, clear plan beats motivation.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl px-3 py-2 text-slate-600 hover:bg-white/70 ring-1 ring-slate-200 transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-6 grid gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Goal Title</label>
                    <input
                      name="title"
                      value={form.title}
                      onChange={onChange}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] transition"
                      placeholder="Enter title"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={onChange}
                      rows={4}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none resize-none focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] transition"
                      placeholder="Short description"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Category</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {categories.map((c) => {
                        const active = form.category === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, category: c }))}
                            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition
                              ${
                                active
                                  ? "bg-slate-900 text-white ring-slate-900"
                                  : "bg-white/80 text-slate-700 ring-slate-200 hover:bg-white"
                              }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Target Date</label>
                      <input
                        type="date"
                        name="deadline"
                        value={form.deadline}
                        onChange={onChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] transition"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Reward Points</label>
                      <input
                        type="number"
                        name="rewardPoints"
                        value={form.rewardPoints}
                        onChange={onChange}
                        placeholder="Optional"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Priority</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["High", "Medium", "Low"].map((p) => {
                        const active = form.priority === p;
                        const m = priorityMeta[p];
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setForm((x) => ({ ...x, priority: p }))}
                            className={`rounded-2xl px-4 py-2 text-sm font-semibold ring-1 transition flex items-center gap-2
                              ${
                                active
                                  ? `${m.card} text-slate-900 ${m.ring}`
                                  : "bg-white/80 text-slate-700 ring-slate-200 hover:bg-white"
                              }`}
                          >
                            <span className={`h-2.5 w-2.5 rounded-full ${m.dot}`} />
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white/70 transition"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={save}
                      className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.98] transition"
                    >
                      {editingId ? "Save Changes" : "Create Goal"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating create for small screens */}
      <button
        type="button"
        onClick={openCreate}
        className="fixed bottom-6 right-6 z-40 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 active:scale-[0.98] transition md:hidden"
      >
        + Create Goal
      </button>
    </div>
  );
};

export default PersonalGoal;
