import { useSelector } from 'react-redux';
import { selectFilteredColleges, selectDashboardStats } from '../store/filterSlice';
import { GraduationCap, BarChart3, Database, Menu } from 'lucide-react';

/**
 * Header – sticky top bar for the AP ECET CSE Analytics dashboard.
 *
 * Left  : menu toggle (mobile only) + app icon + title + subtitle
 * Right : two live stat badges (Colleges · Seats) driven by Redux selectors
 */
const Header = ({ onMenuToggle }) => {
  const filteredColleges = useSelector(selectFilteredColleges);
  const dashboardStats = useSelector(selectDashboardStats);

  const collegeCount = filteredColleges.length;
  const totalSeats = dashboardStats.totalSeats;

  return (
    <header className="sticky top-0 z-40 w-full glass-strong border-b border-[var(--border)] lg:pl-72">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* ── Left: Branding & Mobile Menu Toggle ── */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] border border-[var(--border)] transition cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Accent icon circle */}
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-[var(--accent)] shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>

          <div>
            <h1 className="text-base sm:text-xl font-bold text-[var(--text-primary)] leading-tight">
              AP ECET CSE Analytics
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">2025-26 Seat Data</p>
          </div>
        </div>

        {/* ── Right: Stat badges ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Colleges badge */}
          <div className="flex items-center gap-2 bg-[var(--bg-surface)] rounded-lg px-2 sm:px-4 py-1.5 sm:py-2">
            <Database className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                {collegeCount.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] sm:text-xs text-[var(--text-muted)]">Colleges</span>
            </div>
          </div>

          {/* Seats badge */}
          <div className="flex items-center gap-2 bg-[var(--bg-surface)] rounded-lg px-2 sm:px-4 py-1.5 sm:py-2">
            <BarChart3 className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                {totalSeats.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] sm:text-xs text-[var(--text-muted)]">Seats</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
