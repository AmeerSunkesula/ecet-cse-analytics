import { useSelector } from 'react-redux';
import { selectDashboardStats } from '../store/filterSlice';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  GraduationCap, Users, IndianRupee, GitBranch, TrendingUp,
} from 'lucide-react';

// Palette used to colour pie slices and bar segments
const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7',
  '#14b8a6', '#84cc16', '#e11d48', '#0ea5e9', '#d946ef',
];

/**
 * DashboardVisuals
 * ────────────────
 * Renders four KPI stat cards and two chart panels
 * (Seats by Branch pie · Seats by Region bar).
 */
export default function DashboardVisuals() {
  const {
    totalColleges,
    totalSeats,
    avgFee,
    totalBranches,
    branchBreakdown,
    regionBreakdown,
  } = useSelector(selectDashboardStats);

  /* ── Empty-state guard ─────────────────────────────────── */
  if (totalColleges === 0) {
    return (
      <div className="px-1 mb-8">
        <div className="glass rounded-xl p-10 text-center text-[var(--text-muted)]">
          No data matches your filters
        </div>
      </div>
    );
  }

  /* ── Stat card definitions ─────────────────────────────── */
  const stats = [
    {
      icon: GraduationCap,
      value: totalColleges,
      label: 'Colleges',
      bg: 'bg-indigo-500/15',
      text: 'text-indigo-400',
      delay: 0,
    },
    {
      icon: Users,
      value: totalSeats.toLocaleString('en-IN'),
      label: 'Total Seats',
      bg: 'bg-violet-500/15',
      text: 'text-violet-400',
      delay: 75,
    },
    {
      icon: IndianRupee,
      value: `₹${avgFee.toLocaleString('en-IN')}`,
      label: 'Avg Fee',
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      delay: 150,
    },
    {
      icon: GitBranch,
      value: totalBranches,
      label: 'Branches',
      bg: 'bg-cyan-500/15',
      text: 'text-cyan-400',
      delay: 225,
    },
  ];

  /* ── Custom pie-chart label ────────────────────────────── */
  const renderPieLabel = ({ name, percent }) =>
    `${name} ${(percent * 100).toFixed(0)}%`;

  return (
    <div className="px-1 mb-8">
      {/* ── Section 1 — Stat Cards ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, value, label, bg, text, delay }) => (
          <div
            key={label}
            className="glass rounded-xl p-5 card-lift stagger"
            style={{ '--delay': `${delay}ms` }}
          >
            <div className="flex items-center gap-4">
              {/* Icon badge */}
              <div className={`${bg} rounded-lg p-3`}>
                <Icon className={`w-6 h-6 ${text}`} />
              </div>

              {/* Value + label */}
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {value}
                </p>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                  {label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Section 2 — Charts ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Pie Chart: Seats by Branch ───────────────────── */}
        <div className="glass rounded-xl p-6 animate-fade-in-up">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
            Seats by Branch
          </h3>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={branchBreakdown}
                dataKey="seats"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={2}
                label={renderPieLabel}
              >
                {branchBreakdown.map((_, idx) => (
                  <Cell
                    key={`branch-${idx}`}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ── Bar Chart: Seats by Region ───────────────────── */}
        <div className="glass rounded-xl p-6 animate-fade-in-up">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
            Seats by Region
          </h3>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={regionBreakdown}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid rgba(148,163,184,0.12)',
                  borderRadius: '0.75rem',
                }}
              />
              <Bar dataKey="seats" radius={[6, 6, 0, 0]}>
                {regionBreakdown.map((_, idx) => (
                  <Cell
                    key={`region-${idx}`}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
