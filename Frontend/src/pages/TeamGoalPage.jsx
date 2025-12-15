import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { JitsiMeeting } from "@jitsi/react-sdk";

const priorityMeta = {
  High: {
    strip: "from-rose-500 to-rose-300",
    card: "bg-rose-50/80",
    ring: "ring-rose-200",
    dot: "bg-rose-500",
    pill: "bg-rose-100 text-rose-700 ring-rose-200",
  },
  Medium: {
    strip: "from-amber-500 to-amber-300",
    card: "bg-amber-50/80",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
    pill: "bg-amber-100 text-amber-800 ring-amber-200",
  },
  Low: {
    strip: "from-emerald-500 to-emerald-300",
    card: "bg-emerald-50/80",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
    pill: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  },
};

const getInitials = (text = "") => {
  const t = text.trim();
  if (!t) return "TG";
  const parts = t.split(" ").filter(Boolean);
  return ((parts[0]?.[0] || "T") + (parts[1]?.[0] || "G")).toUpperCase();
};

const TeamGoalPage = () => {
  const API_URL = "https://focus-fuze.onrender.com/team-goals";

  const userId = localStorage.getItem("userId") || "";
  const username = localStorage.getItem("username") || "";

  const [view, setView] = useState("main"); // main | dashboard | meeting
  const [goals, setGoals] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [selectedGoal, setSelectedGoal] = useState(null);

  // Modal
  const [isOpen, setIsOpen] = useState(false);
  const [isEditGoal, setIsEditGoal] = useState(false);

  // form
  const [taskId, setTaskId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [members, setMembers] = useState([{ memberId: "", task: "" }]);

  // comment
  const [comment, setComment] = useState("");

  // meeting
  const [meetingId, setMeetingId] = useState("");
  const [isMeetingActive, setIsMeetingActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isLeader = selectedGoal?.leaderId === userId;

  // -------- initial fetch
  useEffect(() => {
    if (!userId) {
      setError("Please log in to access team goals");
      return;
    }
    fetchGoals();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ESC closes modal
  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL, {
        params: { userId },
        withCredentials: true,
      });
      setGoals(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setGoals([]);
      setError("Failed to fetch goals. Please try again.");
      toast.error("Failed to fetch goals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`, { withCredentials: true });
      setAllUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setAllUsers([]);
      toast.error("Failed to fetch users.");
    }
  };

  const resetForm = () => {
    setTaskId("");
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setDueDate("");
    setMembers([{ memberId: "", task: "" }]);
    setIsEditGoal(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setIsEditGoal(false);
  };

  // -------- create goal
  const handleCreateGoal = async () => {
    if (!title || !description || !dueDate) {
      toast.warn("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const enrichedMembers = members.map((m) => {
        const user = allUsers.find((u) => u._id === m.memberId);
        return {
          memberId: m.memberId,
          task: m.task,
          username: user ? user.username : "Unknown",
        };
      });

      const res = await axios.post(
        API_URL,
        {
          leaderId: userId,
          title,
          description,
          priority,
          dueDate,
          members: enrichedMembers,
        },
        { withCredentials: true }
      );

      setTaskId(res.data.taskId);
      setSelectedGoal(res.data);
      setView("dashboard");
      await fetchGoals();
      closeModal();
      resetForm();
      toast.success("Team goal created!");
    } catch (e) {
      setError("Failed to create goal. Please try again.");
      toast.error("Failed to create goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // -------- add members (dashboard)
  const handleAddMember = async () => {
    if (!selectedGoal) return;

    setLoading(true);
    setError(null);
    try {
      const enrichedMembers = members.map((m) => {
        const user = allUsers.find((u) => u._id === m.memberId);
        return {
          memberId: m.memberId,
          task: m.task,
          username: user ? user.username : "Unknown",
        };
      });

      await axios.put(
        `${API_URL}/${selectedGoal.taskId}/members`,
        { members: enrichedMembers },
        { withCredentials: true }
      );

      const latest = await axios.get(`${API_URL}/${selectedGoal.taskId}`, {
        withCredentials: true,
      });

      setSelectedGoal(latest.data);
      setMembers([{ memberId: "", task: "" }]);
      toast.success("Member(s) added!");
    } catch (e) {
      setError("Failed to add member.");
      toast.error("Failed to add member.");
    } finally {
      setLoading(false);
    }
  };

  // -------- comments
  const handleAddComment = async () => {
    if (!comment.trim() || !selectedGoal) return;

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        `${API_URL}/${selectedGoal.taskId}/comments`,
        { userId, username, content: comment.trim() },
        { withCredentials: true }
      );
      setSelectedGoal({ ...res.data });
      setComment("");
    } catch (e) {
      setError("Failed to add comment.");
      toast.error("Failed to add comment.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    if (!selectedGoal) return;
    setLoading(true);
    setError(null);
    try {
      await axios.put(
        `${API_URL}/${selectedGoal.taskId}/comments/${commentId}`,
        { content: newContent },
        { withCredentials: true }
      );
      const latest = await axios.get(`${API_URL}/${selectedGoal.taskId}`, {
        withCredentials: true,
      });
      setSelectedGoal(latest.data);
    } catch (e) {
      setError("Failed to edit comment.");
      toast.error("Failed to edit comment.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!selectedGoal) return;
    setLoading(true);
    setError(null);
    try {
      await axios.delete(
        `${API_URL}/${selectedGoal.taskId}/comments/${commentId}`,
        { withCredentials: true }
      );
      const latest = await axios.get(`${API_URL}/${selectedGoal.taskId}`, {
        withCredentials: true,
      });
      setSelectedGoal(latest.data);
    } catch (e) {
      setError("Failed to delete comment.");
      toast.error("Failed to delete comment.");
    } finally {
      setLoading(false);
    }
  };

  // -------- meeting
  const startMeeting = async () => {
    if (!selectedGoal) return;

    const newMeetingId = `FocusFuze_${selectedGoal.taskId}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;

    setMeetingId(newMeetingId);
    setIsMeetingActive(true);

    // post to comments
    try {
      await axios.post(
        `${API_URL}/${selectedGoal.taskId}/comments`,
        {
          userId,
          username,
          content: `Meeting started! Join with Meeting ID: ${newMeetingId}`,
        },
        { withCredentials: true }
      );
    } catch {}

    setView("meeting");
    toast.success("Meeting started!");
  };

  const joinMeeting = () => {
    if (!meetingId.trim() || !selectedGoal) {
      toast.warn("Enter meeting ID first.");
      return;
    }
    setIsMeetingActive(true);
    setView("meeting");
    toast.info("Joined meeting!");
  };

  const leaveMeeting = () => {
    setIsMeetingActive(false);
    setMeetingId("");
    setView("dashboard");
    toast.info("Left meeting");
  };

  const pageSubtitle = useMemo(() => {
    const leaderCount = goals.filter((g) => g.leaderId === userId).length;
    return `${goals.length} goals • You lead ${leaderCount}`;
  }, [goals, userId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* ✅ same fix as PersonalGoal: navbar height = 64px */}
      <div >
        {/* Loader overlay */}
        {loading && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-white/60 backdrop-blur">
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 animate-bounce rounded-full bg-slate-900" />
                <div className="h-3 w-3 animate-bounce rounded-full bg-slate-700 [animation-delay:120ms]" />
                <div className="h-3 w-3 animate-bounce rounded-full bg-slate-500 [animation-delay:240ms]" />
                <span className="ml-2 text-sm font-semibold text-slate-700">
                  Loading…
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-6xl px-4 pt-4">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          </div>
        )}

        {/* -------- MAIN VIEW */}
        {view === "main" && (
          <div className="mx-auto max-w-6xl px-4 pb-10">
            {/* Header */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white/85 backdrop-blur shadow-sm">
              <div className="flex items-center justify-between gap-3 px-6 py-5">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                    Team Goals
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">{pageSubtitle}</p>
                </div>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 active:scale-[0.98] transition"
                >
                  <span className="text-lg leading-none">+</span>
                  Create Goal
                </button>
              </div>
            </div>

            {/* Layout */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
              {/* Left panel */}
              <aside className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Workspace
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Create team goals, assign tasks, and run meetings directly in
                  the goal dashboard.
                </p>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  Tip: Click a goal card to open dashboard.
                </div>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition"
                >
                  + Create a Goal
                </button>
              </aside>

              {/* Right list */}
              <section>
                {goals.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-white/70 p-10 shadow-sm text-center">
                    <h3 className="text-lg font-semibold text-slate-900">
                      No team goals yet
                    </h3>
                    <p className="mt-1 text-slate-500">
                      Create your first goal to get started.
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                    >
                      + Create Goal
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {goals.map((g) => {
                      const meta = priorityMeta[g.priority] || priorityMeta.Medium;
                      const initials = getInitials(g.title);
                      const role = g.leaderId === userId ? "Leader" : "Member";

                      return (
                        <div
                          key={g.taskId}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setSelectedGoal(g);
                            setView("dashboard");
                          }}
                          className={`group relative overflow-hidden rounded-3xl ${meta.card} ring-1 ${meta.ring}
                            shadow-[0_18px_40px_-26px_rgba(15,23,42,0.35)]
                            hover:shadow-[0_26px_60px_-34px_rgba(15,23,42,0.45)] transition cursor-pointer`}
                        >
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
                                      {g.title}
                                    </h3>
                                    <p className="mt-0.5 text-xs text-slate-600">
                                      Task ID: {g.taskId}
                                    </p>
                                  </div>
                                </div>

                                <p className="mt-3 text-sm text-slate-700 line-clamp-2">
                                  {g.description}
                                </p>
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.pill}`}
                              >
                                {g.priority}
                              </span>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-white/60">
                                Role: {role}
                              </span>

                              <button
                                className="opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition text-sm font-semibold text-slate-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedGoal(g);
                                  setView("dashboard");
                                }}
                              >
                                Open →
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* -------- DASHBOARD */}
        {view === "dashboard" && selectedGoal && (
          <div className="mx-auto max-w-6xl px-4 pb-12">
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedGoal(null);
                  setView("main");
                }}
                className="rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 bg-white/70 hover:bg-white transition"
              >
                ← Back
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedGoal(null);
                    setView("main");
                  }}
                  className="hidden sm:inline-flex rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 bg-white/70 hover:bg-white transition"
                >
                  All Goals
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
              {/* Left: goal info + members + meeting */}
              <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {selectedGoal.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Task ID: <span className="font-semibold">{selectedGoal.taskId}</span>
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                      (priorityMeta[selectedGoal.priority] || priorityMeta.Medium).pill
                    }`}
                  >
                    {selectedGoal.priority}
                  </span>
                </div>

                <p className="mt-4 text-sm text-slate-700">
                  {selectedGoal.description}
                </p>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  Due:{" "}
                  <span className="font-semibold">
                    {selectedGoal.dueDate || "—"}
                  </span>
                </div>

                {/* Members */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-slate-900">Members</h3>
                  <div className="mt-3 space-y-2">
                    {selectedGoal.members?.map((m) => (
                      <div
                        key={m.memberId}
                        className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm"
                      >
                        <div className="font-semibold text-slate-900">{m.username}</div>
                        <div className="text-slate-600">{m.task}</div>
                      </div>
                    ))}
                  </div>

                  {/* Add members if leader */}
                  {isLeader && (
                    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
                      <h4 className="text-sm font-semibold text-slate-900">
                        Add Member(s)
                      </h4>

                      <div className="mt-3 space-y-3">
                        {members.map((m, idx) => (
                          <div key={idx} className="grid gap-3 sm:grid-cols-2">
                            <select
                              value={m.memberId}
                              onChange={(e) => {
                                const next = [...members];
                                next[idx].memberId = e.target.value;
                                setMembers(next);
                              }}
                              className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] transition"
                            >
                              <option value="">Select Member</option>
                              {allUsers.map((u) => (
                                <option key={u._id} value={u._id}>
                                  {u.username}
                                </option>
                              ))}
                            </select>

                            <input
                              value={m.task}
                              onChange={(e) => {
                                const next = [...members];
                                next[idx].task = e.target.value;
                                setMembers(next);
                              }}
                              placeholder="Task for member"
                              className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] transition"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setMembers((p) => [...p, { memberId: "", task: "" }])
                          }
                          className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 bg-white/70 hover:bg-white transition"
                        >
                          + Add Another
                        </button>

                        <button
                          type="button"
                          onClick={handleAddMember}
                          className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
                        >
                          Save Members
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Meeting */}
                <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
                  <h3 className="text-sm font-semibold text-slate-900">Meeting</h3>

                  {isLeader ? (
                    <button
                      onClick={startMeeting}
                      className="mt-3 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                    >
                      Start Meeting
                    </button>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <input
                        value={meetingId}
                        onChange={(e) => setMeetingId(e.target.value)}
                        placeholder="Enter Meeting ID"
                        className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] transition"
                      />
                      <button
                        onClick={joinMeeting}
                        className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                      >
                        Join Meeting
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: comments */}
              <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-6">
                <h3 className="text-sm font-semibold text-slate-900">Comments</h3>

                <div className="mt-4 space-y-3">
                  {selectedGoal.comments?.map((c) => (
                    <div
                      key={c._id}
                      className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">
                            {c.username}{" "}
                            <span className="font-normal text-slate-500">
                              ({c.userId === selectedGoal.leaderId ? "Leader" : "Member"})
                            </span>
                          </div>
                          <p className="mt-1 text-slate-700 break-words">{c.content}</p>
                        </div>

                        {c.userId === userId && (
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200 hover:bg-slate-50 transition"
                              title="Edit"
                              onClick={() => {
                                const newContent = prompt("Edit comment:", c.content);
                                if (newContent?.trim()) handleEditComment(c._id, newContent.trim());
                              }}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="rounded-xl bg-rose-600 px-3 py-2 text-white ring-1 ring-rose-600 hover:bg-rose-500 transition"
                              title="Delete"
                              onClick={() => handleDeleteComment(c._id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Leave a comment…"
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none resize-none focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] transition"
                  />
                  <button
                    onClick={handleAddComment}
                    className="mt-3 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------- MEETING */}
        {view === "meeting" && selectedGoal && (
          <div className="mx-auto max-w-6xl px-4 pb-12">
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white/85 backdrop-blur shadow-sm p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Meeting: {selectedGoal.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Meeting ID: <span className="font-semibold">{meetingId}</span>
                  </p>
                </div>

                <button
                  onClick={leaveMeeting}
                  className="rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 transition"
                >
                  Leave Meeting
                </button>
              </div>

              <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200 bg-black">
                <JitsiMeeting
                  domain="jitsi.riot.im"
                  roomName={meetingId}
                  configOverwrite={{
                    disableThirdPartyRequests: true,
                    startWithAudioMuted: true,
                    startWithVideoMuted: true,
                    prejoinPageEnabled: false,
                    startWithoutVideo: true,
                    enableWelcomePage: false,
                    disableReactions: true,
                    disablePolls: true,
                  }}
                  userInfo={{
                    displayName: username || "Guest",
                    email: "",
                  }}
                  getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = "520px";
                    iframeRef.style.width = "100%";
                    iframeRef.style.border = "none";
                  }}
                  onApiReady={(api) => {
                    api.addEventListener("videoConferenceLeft", () => {
                      leaveMeeting();
                    });
                    api.addEventListener("readyToClose", () => {
                      leaveMeeting();
                    });
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* -------- CREATE MODAL */}
        <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}>
          <button
            onClick={closeModal}
            className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
            aria-label="Close"
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className={`w-full max-w-2xl rounded-3xl border border-white/40 bg-white/75 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(15,23,42,0.55)]
                transition-all duration-200 ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                      Create Team Goal
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Assign members and keep the team aligned.
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
                    <label className="text-sm font-medium text-slate-700">Title</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] transition"
                      placeholder="Enter goal title"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none resize-none focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] transition"
                      placeholder="Enter goal description"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] transition"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Due Date</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] transition"
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-slate-900">Members</h3>
                      <button
                        type="button"
                        onClick={() => setMembers((p) => [...p, { memberId: "", task: "" }])}
                        className="rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 bg-white/70 hover:bg-white transition"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="mt-3 space-y-3">
                      {members.map((m, idx) => (
                        <div key={idx} className="grid gap-3 sm:grid-cols-2">
                          <select
                            value={m.memberId}
                            onChange={(e) => {
                              const next = [...members];
                              next[idx].memberId = e.target.value;
                              setMembers(next);
                            }}
                            className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] transition"
                          >
                            <option value="">Select Member</option>
                            {allUsers.map((u) => (
                              <option key={u._id} value={u._id}>
                                {u.username}
                              </option>
                            ))}
                          </select>

                          <input
                            value={m.task}
                            onChange={(e) => {
                              const next = [...members];
                              next[idx].task = e.target.value;
                              setMembers(next);
                            }}
                            placeholder="Task for member"
                            className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none focus:shadow-[0_0_0_4px_rgba(99,102,241,0.12)] transition"
                          />
                        </div>
                      ))}
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
                      onClick={handleCreateGoal}
                      className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.98] transition"
                    >
                      Create Goal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating create on mobile */}
        {view === "main" && (
          <button
            type="button"
            onClick={openCreateModal}
            className="fixed bottom-6 right-6 z-40 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 active:scale-[0.98] transition md:hidden"
          >
            + Create Goal
          </button>
        )}
      </div>
    </div>
  );
};

export default TeamGoalPage;
