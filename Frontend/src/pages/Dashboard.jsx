"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

const API = "https://focus-fuze.onrender.com";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalRewards: 0,
    tasksAsLeader: 0,
    tasksAsMember: 0,
  });

  const [activityData, setActivityData] = useState({
    labels: [],
    datasets: [],
  });

  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");

  const fetchDashboardStats = async () => {
    if (!userId) {
      toast.error("User not logged in!");
      return;
    }

    setLoading(true);
    try {
      // Personal Goals
      const personalGoalsResponse = await axios.get(`${API}/personal-goals/${userId}`);
      const personalGoals = personalGoalsResponse.data || [];

      // Team Goals
      const teamGoalsResponse = await axios.get(`${API}/team-goals`, { params: { userId } });
      const teamGoals = teamGoalsResponse.data || [];

      // Personal stats
      const totalTasks = personalGoals.length;
      const completedGoals = personalGoals.filter((g) => g.status === "Completed");
      const completedTasks = completedGoals.length;
      const pendingTasks = totalTasks - completedTasks;
      const totalRewards = completedGoals.reduce(
        (sum, g) => sum + (Number(g.rewardPoints) || 0),
        0
      );

      // Team stats
      const tasksAsLeader = teamGoals.filter((g) => g.leaderId === userId).length;
      const tasksAsMember = teamGoals.filter(
        (g) => g.members?.some((m) => m.memberId === userId) && g.leaderId !== userId
      ).length;

      // Activity (7 days)
      const activityDates = {};
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);

      for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(sevenDaysAgo.getDate() + i);
        const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        activityDates[key] = 0;
      }

      personalGoals.forEach((goal) => {
        const createdDate = goal.createdAt ? new Date(goal.createdAt) : null;
        const updatedDate = goal.updatedAt ? new Date(goal.updatedAt) : null;

        if (createdDate && createdDate >= sevenDaysAgo) {
          const key = createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          activityDates[key] = (activityDates[key] || 0) + 1;
        }

        if (updatedDate && updatedDate >= sevenDaysAgo && goal.status === "Completed") {
          const key = updatedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          activityDates[key] = (activityDates[key] || 0) + 1;
        }
      });

      teamGoals.forEach((goal) => {
        const createdDate = goal.createdAt ? new Date(goal.createdAt) : null;
        if (createdDate && createdDate >= sevenDaysAgo) {
          const key = createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          activityDates[key] = (activityDates[key] || 0) + 1;
        }
      });

      const labels = Object.keys(activityDates);
      const data = Object.values(activityDates);

      setActivityData({
        labels,
        datasets: [
          {
            label: "Recent Activity",
            data,
            fill: true,
            backgroundColor: "rgba(15, 23, 42, 0.08)",
            borderColor: "rgba(15, 23, 42, 0.8)",
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      });

      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        totalRewards,
        tasksAsLeader,
        tasksAsMember,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Pie chart data
  const pieData = useMemo(() => {
    return {
      labels: ["Completed", "Pending"],
      datasets: [
        {
          data: [stats.completedTasks, stats.pendingTasks],
          backgroundColor: ["#0f172a", "#e2e8f0"],
          hoverBackgroundColor: ["#111827", "#cbd5e1"],
          borderWidth: 0,
        },
      ],
    };
  }, [stats.completedTasks, stats.pendingTasks]);

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(15,23,42,0.06)" },
        ticks: { color: "#64748b", font: { size: 12 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 12 } },
      },
    },
  };

  const completionRate = useMemo(() => {
    if (!stats.totalTasks) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  }, [stats.completedTasks, stats.totalTasks]);

  return (
    <div className="min-h-screen bg-slate-50 pt-[10px] pb-10">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track your progress at a glance — tasks, rewards, and weekly activity.
            </p>
          </div>

          <button
            onClick={fetchDashboardStats}
            className="inline-flex w-fit items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.98] transition"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            <div className="flex items-center gap-4">
              <img
                src="https://cdn-icons-png.freepik.com/256/11857/11857533.png"
                alt="Loading"
                className="h-10 w-10 animate-spin"
              />
              <div>
                <div className="text-sm font-semibold text-slate-900">Loading dashboard…</div>
                <div className="text-sm text-slate-500">Fetching your latest stats.</div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Top cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-medium text-slate-500">Total Tasks</div>
                <div className="mt-2 text-3xl font-semibold text-slate-900">
                  {stats.totalTasks}
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-slate-900"
                    style={{ width: `${Math.min(completionRate, 100)}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Completion rate: <span className="font-semibold">{completionRate}%</span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-medium text-slate-500">Completed</div>
                <div className="mt-2 text-3xl font-semibold text-slate-900">
                  {stats.completedTasks}
                </div>
                <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  ✓ Good progress
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-medium text-slate-500">Pending</div>
                <div className="mt-2 text-3xl font-semibold text-slate-900">
                  {stats.pendingTasks}
                </div>
                <div className="mt-2 inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                  ⏳ Keep going
                </div>
              </div>
            </div>

            {/* Charts row */}
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {/* Pie */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">Task Distribution</h2>
                  <span className="text-xs font-semibold text-slate-500">
                    Completed vs Pending
                  </span>
                </div>

                <div className="mt-5 h-[260px]">
                  <Pie data={pieData} options={pieOptions} />
                </div>

                <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
                    <span className="text-slate-700">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                    <span className="text-slate-700">Pending</span>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">Performance</h2>
                  <span className="text-xs font-semibold text-slate-500">Personal + Team</span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-xs font-semibold text-slate-500">Total Rewards</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">
                      {stats.totalRewards}
                    </div>
                    <div className="text-xs text-slate-500">points earned</div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-xs font-semibold text-slate-500">Tasks as Leader</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">
                      {stats.tasksAsLeader}
                    </div>
                    <div className="text-xs text-slate-500">team goals owned</div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-xs font-semibold text-slate-500">Tasks as Member</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">
                      {stats.tasksAsMember}
                    </div>
                    <div className="text-xs text-slate-500">team goals joined</div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-white ring-1 ring-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">
                      Weekly Activity
                    </div>
                    <div className="text-xs text-slate-500">last 7 days</div>
                  </div>
                  <div className="mt-3 h-[220px]">
                    <Line data={activityData} options={lineOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom full-width chart */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">
                  Recent Activity (Last 7 Days)
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  created + completed tasks
                </span>
              </div>
              <div className="mt-4 h-[320px]">
                <Line data={activityData} options={lineOptions} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
