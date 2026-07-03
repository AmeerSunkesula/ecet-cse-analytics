import { useSelector } from 'react-redux';
import { selectFilteredColleges, selectDashboardStats } from '../store/filterSlice';
import { GraduationCap, BarChart3, Database } from 'lucide-react';

/**
 * Header – sticky top bar for the AP ECET CSE Analytics dashboard.
 *
 * Left  : app icon + title + subtitle
 * Right : two live stat badges (Colleges · Seats) driven by Redux selectors
 */
const Header = () => {
  const filteredColleges = useSelector(selectFilteredColleges);
  const dashboardStats = useSelector(selectDashboardStats);

  const collegeCount = filteredColleges.length;
  const totalSeats = dashboardStats.totalSeats;

  return (
    <header className="sticky top-0 z-40 w-full glass-strong border-b border-[var(--border)]">
      <div className="flex items-center justify-between px-6 py-3">
        {/* ── Left: Branding ── */}
        <div className="flex items-center gap-3">
          {/* Accent icon circle */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--accent)]">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              AP ECET CSE Analytics
            </h1>
            <p className="text-sm text-[var(--text-muted)]">2025-26 Seat Data</p>
          </div>
        </div>

        {/* ── Right: Stat badges ── */}
        <div className="flex items-center gap-3">
          {/* Colleges badge */}
          <div className="flex items-center gap-2 bg-[var(--bg-surface)] rounded-lg px-4 py-2">
            <Database className="w-4 h-4 text-[var(--accent)]" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {collegeCount.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[var(--text-muted)]">Colleges</span>
            </div>
          </div>

          {/* Seats badge */}
          <div className="flex items-center gap-2 bg-[var(--bg-surface)] rounded-lg px-4 py-2">
            <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {totalSeats.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-[var(--text-muted)]">Seats</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
