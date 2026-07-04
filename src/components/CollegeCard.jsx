import React, { useState } from 'react';
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Users,
  Building2,
  Grid3X3,
} from 'lucide-react';
import SeatMatrixModal from './SeatMatrixModal';

// Color map for college type badges
const TYPE_STYLES = {
  PVT: 'bg-indigo-500/20 text-indigo-400',
  SF: 'bg-amber-500/20 text-amber-400',
  UNIV: 'bg-emerald-500/20 text-emerald-400',
  SS: 'bg-cyan-500/20 text-cyan-400',
};

function CollegeCard({ college, index }) {
  const [expanded, setExpanded] = useState(false);

  // Modal state — tracks which branch's matrix is open
  const [modalBranch, setModalBranch] = useState(null);

  const {
    code,
    name,
    place,
    district,
    region,
    type,
    details,
    _totalSeats,
    _minFee,
    _maxFee,
  } = college;

  // Resolve badge style, falling back to a neutral style for unknown types
  const typeBadgeClass =
    TYPE_STYLES[type] || 'bg-slate-500/20 text-slate-400';

  return (
    <>
      <div
        className="glass rounded-xl overflow-hidden card-lift stagger"
        style={{ '--delay': `${Math.min(index * 50, 500)}ms` }}
        onClick={() => setExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
      >
        {/* ── Header ── */}
        <div className="p-5 pb-3 cursor-pointer">
          {/* Top row: name + type badge */}
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2 leading-snug">
              {name}
            </h3>

            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${typeBadgeClass}`}
            >
              {type}
            </span>
          </div>

          {/* College code badge */}
          <span className="mt-1 text-[11px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface-hover)]/50 px-2 py-0.5 rounded inline-block">
            {code}
          </span>

          {/* Location */}
          <div className="mt-2.5 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <MapPin size={12} />
            <span>
              {place}, {district} &bull; {region}
            </span>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="px-5 pb-3 flex items-center gap-4">
          {/* Total seats */}
          <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <Users size={14} className="text-[var(--accent)]" />
            <span className="font-medium text-[var(--text-primary)]">
              {_totalSeats}
            </span>
            seats
          </span>

          {/* Fee range */}
          <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
            <IndianRupee size={14} className="text-emerald-400" />
            <span className="text-emerald-400">
              {_minFee === _maxFee
                ? `₹${_minFee.toLocaleString()}`
                : `₹${_minFee.toLocaleString()} - ₹${_maxFee.toLocaleString()}`}
            </span>
          </span>

          {/* Branch count — pushed to the right */}
          <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] ml-auto">
            <Building2 size={14} />
            {details.length} branches
          </span>
        </div>

        {/* ── Expand / Collapse Toggle ── */}
        <button
          className="w-full border-t border-[var(--border)] py-2 flex items-center justify-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)]/50 transition cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // prevent double-toggle from outer div
            setExpanded((prev) => !prev);
          }}
        >
          {expanded ? (
            <>
              Hide <ChevronUp size={14} />
            </>
          ) : (
            <>
              View Branches <ChevronDown size={14} />
            </>
          )}
        </button>

        {/* ── Expanded Branch Details ── */}
        {expanded && (
          <div className="border-t border-[var(--border)] bg-[var(--bg-primary)]/30">
            {details.map((branch) => (
              <div
                key={branch.branchCode}
                className="px-5 py-3 flex items-center justify-between border-b border-[var(--border)]/50 last:border-b-0"
              >
                {/* Left: code pill + branch name */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent-hover)] whitespace-nowrap">
                    {branch.branchCode}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] truncate max-w-[120px] sm:max-w-[160px]">
                    {branch.branchName}
                  </span>
                </div>

                {/* Right: seats + fee + seat matrix button */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                  <span className="text-xs font-medium text-[var(--text-primary)]">
                    {branch.seats} seats
                  </span>
                  <span className="text-xs text-emerald-400 hidden sm:inline">
                    ₹{branch.fee.toLocaleString()}
                  </span>

                  {/* View Seat Matrix button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalBranch(branch);
                    }}
                    className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent-hover)] hover:bg-[var(--accent)]/20 border border-[var(--accent)]/20 transition cursor-pointer whitespace-nowrap"
                    title="View Seat Matrix"
                  >
                    <Grid3X3 size={11} />
                    <span className="hidden sm:inline">Seat Matrix</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Seat Matrix Modal (rendered outside the card) ── */}
      <SeatMatrixModal
        isOpen={modalBranch !== null}
        onClose={() => setModalBranch(null)}
        collegeName={name}
        branchCode={modalBranch?.branchCode || ''}
        branchName={modalBranch?.branchName || ''}
        ecetIntake={modalBranch?.seats || 0}
      />
    </>
  );
}

export default React.memo(CollegeCard);
