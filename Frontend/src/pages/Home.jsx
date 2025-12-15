// Home.jsx
import { Link } from "react-router-dom";

const FeatureCard = ({ title, desc, to, tag }) => (
  <Link
    to={to}
    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:shadow-md"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 opacity-0 transition group-hover:opacity-100" />
    <div className="relative">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">
          {title}
        </h3>
        {tag ? (
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
            {tag}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>

      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
        Open
        <span className="transition group-hover:translate-x-0.5">→</span>
      </div>
    </div>
  </Link>
);

const Stat = ({ label, value }) => (
  <div className="rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur">
    <div className="text-xs font-semibold text-slate-500">{label}</div>
    <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
      {value}
    </div>
  </div>
);

const Home = () => {
  const username = localStorage.getItem("username") || "there";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-slate-200/60 blur-3xl" />
        <div className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-slate-200/60 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-4 pt-[10px] pb-12">
        {/* Hero */}
        <div className="rounded-3xl border border-slate-200 bg-white/75 p-7 shadow-sm backdrop-blur sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                <span className="h-2 w-2 rounded-full bg-slate-900" />
                FocusFuze Workspace
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Welcome, <span className="text-slate-600">{username}</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                A calm, productivity-driven space to plan goals, collaborate with your
                team, take notes, and stay on top of your schedule.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/personal-goals"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99]"
              >
                Go to Personal Goals
              </Link>
              <Link
                to="/team-goals"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
              >
                Open Team Workspace
              </Link>
            </div>
          </div>

          {/* Quick stats (static placeholders – can wire later) */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Stat label="Today’s focus" value="Plan + Execute" />
            <Stat label="Next step" value="Review goals" />
            <Stat label="Momentum" value="Keep it steady" />
          </div>
        </div>

        {/* Section header */}
        <div className="mt-10 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Quick Access
          </h2>
          <div className="hidden sm:block text-sm text-slate-500">
            Jump into your main tools
          </div>
        </div>

        {/* Cards */}
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Personal Goals"
            desc="Create goals, track progress, and stay accountable with clean goal cards."
            to="/personal-goals"
            tag="Goals"
          />
          <FeatureCard
            title="Team Goals"
            desc="Collaborate with teammates, assign tasks, comment, and run meetings."
            to="/team-goals"
            tag="Team"
          />
          <FeatureCard
            title="Notes"
            desc="Capture ideas quickly and keep everything organized in one place."
            to="/notes"
            tag="Notes"
          />
          <FeatureCard
            title="Calendar"
            desc="Plan deadlines, track upcoming work, and stay consistent."
            to="/calendar"
            tag="Schedule"
          />
          <FeatureCard
            title="NoteTube"
            desc="Save videos and create video notes for learning and revision."
            to="/save-video"
            tag="Media"
          />
          <FeatureCard
            title="Dashboard"
            desc="Get a high-level overview of your productivity and activity."
            to="/dashboard"
            tag="Overview"
          />
        </div>

        {/* Bottom strip */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Tip for today
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Pick 1 important goal, break it into 2 small tasks, and finish one task
                before lunch.
              </p>
            </div>

            <Link
              to="/personal-goals"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
            >
              Start with a goal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
