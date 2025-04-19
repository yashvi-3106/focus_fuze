"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Pie, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from "chart.js"
import "./Dashboard.css"

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale)

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalRewards: 0,
    tasksAsLeader: 0,
    tasksAsMember: 0,
  })
  const [activityData, setActivityData] = useState({ labels: [], datasets: [] })
  const [loading, setLoading] = useState(false)
  const userId = localStorage.getItem("userId")

  const fetchDashboardStats = async () => {
    if (!userId) {
      toast.error("User not logged in!")
      return
    }

    setLoading(true)
    try {
      // Fetch Personal Goals
      const personalGoalsResponse = await axios.get(`https://focus-fuze.onrender.com/personal-goals/${userId}`)
      const personalGoals = personalGoalsResponse.data

      // Fetch Team Goals
      const teamGoalsResponse = await axios.get(`https://focus-fuze.onrender.com/team-goals`, {
        params: { userId },
      })
      const teamGoals = teamGoalsResponse.data

      // Personal Goals
      const totalTasks = personalGoals.length
      const completedGoals = personalGoals.filter((goal) => goal.status === "Completed")
      const completedTasks = completedGoals.length
      const pendingTasks = totalTasks - completedTasks
      const totalRewards = completedGoals.reduce((sum, goal) => sum + (Number(goal.rewardPoints) || 0), 0)

      // Team Goals
      const tasksAsLeader = teamGoals.filter((goal) => goal.leaderId === userId).length
      const tasksAsMember = teamGoals.filter(
        (goal) => goal.members.some((member) => member.memberId === userId) && goal.leaderId !== userId,
      ).length

      // Recent Activity Data (last 7 days)
      const activityDates = {}
      const today = new Date()
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(today.getDate() - 6) // Last 7 days including today

      // Initialize activity counts for the last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(sevenDaysAgo)
        date.setDate(sevenDaysAgo.getDate() + i)
        const dateKey = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        activityDates[dateKey] = 0
      }

      // Count personal goal creations and completions
      personalGoals.forEach((goal) => {
        const createdDate = new Date(goal.createdAt)
        const updatedDate = goal.updatedAt ? new Date(goal.updatedAt) : null
        if (createdDate >= sevenDaysAgo) {
          const dateKey = createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          activityDates[dateKey] = (activityDates[dateKey] || 0) + 1 // Task created
        }
        if (updatedDate && updatedDate >= sevenDaysAgo && goal.status === "Completed") {
          const dateKey = updatedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          activityDates[dateKey] = (activityDates[dateKey] || 0) + 1 // Task completed
        }
      })

      // Count team goal creations
      teamGoals.forEach((goal) => {
        const createdDate = new Date(goal.createdAt)
        if (createdDate >= sevenDaysAgo) {
          const dateKey = createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          activityDates[dateKey] = (activityDates[dateKey] || 0) + 1 // Team task created
        }
      })

      // Prepare chart data
      const labels = Object.keys(activityDates)
      const data = Object.values(activityDates)

      setActivityData({
        labels,
        datasets: [
          {
            label: "Recent Activity (Tasks Created/Completed)",
            data,
            fill: true,
            backgroundColor: "rgba(79, 70, 229, 0.1)",
            borderColor: "#4f46e5",
            tension: 0.4,
            pointBackgroundColor: "#4f46e5",
          },
        ],
      })

      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        totalRewards,
        tasksAsLeader,
        tasksAsMember,
      })
      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      setLoading(false)
      toast.error("Failed to load dashboard data.")
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [userId])

  // Pie chart data
  const chartData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [stats.completedTasks, stats.pendingTasks],
        backgroundColor: ["#4f46e5", "#fbbf24"],
        hoverBackgroundColor: ["#4338ca", "#f59e0b"],
        borderWidth: 0,
      },
    ],
  }

  // Line chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "#6b7280",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "#6b7280",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  // Pie chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Track Your Progress At A Glance</h1>

      {loading ? (
        <div className="loader-container">
          <img src="https://cdn-icons-png.freepik.com/256/11857/11857533.png" alt="Loading..." className="loader" />
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card total-tasks">
              <h2>Total Tasks</h2>
              <p className="stat-number">{stats.totalTasks}</p>
            </div>
            <div className="stat-card completed-tasks">
              <h2>Completed Tasks</h2>
              <p className="stat-number">{stats.completedTasks}</p>
            </div>
            <div className="stat-card pending-tasks">
              <h2>Pending Tasks</h2>
              <p className="stat-number">{stats.pendingTasks}</p>
            </div>
          </div>

          <div className="dashboard-layout">
            <div className="chart-container">
              <h2>Task Distribution</h2>
              <div style={{ height: "300px" }}>
                <Pie data={chartData} options={pieChartOptions} />
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color completed"></div>
                    <span>Completed</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color pending" style={{ backgroundColor: "#fbbf24" }}></div>
                    <span>Pending</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="performance-metrics">
              <div className="stat-card total-rewards">
                <h2>Total Rewards</h2>
                <p className="stat-number">{stats.totalRewards} Points</p>
              </div>
              <div className="stat-card tasks-as-leader">
                <h2>Tasks as Leader</h2>
                <p className="stat-number">{stats.tasksAsLeader}</p>
              </div>
              <div className="stat-card tasks-as-member">
                <h2>Tasks as Member</h2>
                <p className="stat-number">{stats.tasksAsMember}</p>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <h2>Recent Activity (Last 7 Days)</h2>
            <div style={{ height: "300px" }}>
              <Line data={activityData} options={lineChartOptions} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard

