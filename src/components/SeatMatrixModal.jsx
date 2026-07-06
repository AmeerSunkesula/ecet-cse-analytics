import { useEffect, useCallback, useMemo } from 'react';
import { X, Users, AlertTriangle, Shield, Award, Star, Footprints } from 'lucide-react';
import calculateShares from '../utils/calculateShares';

/* ── Category card accent colors (maps to caste key) ────────── */
const CAT_COLORS = {
  OC:     { bg: 'bg-sky-500/10',     border: 'border-sky-500/30',     text: 'text-sky-400',     badge: 'bg-sky-500/20 text-sky-300' },
  EWS:    { bg: 'bg-teal-500/10',    border: 'border-teal-500/30',    text: 'text-teal-400',    badge: 'bg-teal-500/20 text-teal-300' },
  'BC_A': { bg: 'bg-violet-500/10',  border: 'border-violet-500/30',  text: 'text-violet-400',  badge: 'bg-violet-500/20 text-violet-300' },
  'BC_B': { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', text: 'text-fuchsia-400', badge: 'bg-fuchsia-500/20 text-fuchsia-300' },
  'BC_C': { bg: 'bg-pink-500/10',    border: 'border-pink-500/30',    text: 'text-pink-400',    badge: 'bg-pink-500/20 text-pink-300' },
  'BC_D': { bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    text: 'text-rose-400',    badge: 'bg-rose-500/20 text-rose-300' },
  'BC_E': { bg: 'bg-orange-500/10',  border: 'border-orange-500/30',  text: 'text-orange-400',  badge: 'bg-orange-500/20 text-orange-300' },
  SC_I:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-400',   badge: 'bg-amber-500/20 text-amber-300' },
  SC_II:  { bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30',  text: 'text-yellow-400',  badge: 'bg-yellow-500/20 text-yellow-300' },
  SC_III: { bg: 'bg-lime-500/10',    border: 'border-lime-500/30',    text: 'text-lime-400',    badge: 'bg-lime-500/20 text-lime-300' },
  ST:     { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
};
const DEFAULT_COLOR = { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', badge: 'bg-slate-500/20 text-slate-300' };

/* ── Special icons ──────────────────────────────────────────── */
const SPECIAL_ICONS = {
  PWD: Shield,
  CAP: Award,
  NCC: Star,
  SG:  Footprints,
};
const SPECIAL_LABELS = {
  PWD: 'Persons with Disabilities',
  CAP: 'Children of Armed Personnel',
  NCC: 'National Cadet Corps',
  SG:  'Scouts & Guides',
};

/* ── Value styling helper ───────────────────────────────────── */
function valClass(strVal) {
  const n = parseFloat(strVal);
  if (isNaN(n) || n === 0) return 'text-[var(--text-muted)]';
  return n >= 1.0
    ? 'text-emerald-400 font-bold'
    : 'text-[var(--text-secondary)]';
}

/**
 * SeatMatrixModal
 *
 * Props:
 *  - isOpen       : boolean
 *  - onClose      : () => void
 *  - collegeName  : string
 *  - branchCode   : string
 *  - branchName   : string
 *  - ecetIntake   : number (total lateral entry seats for this branch)
 */
export default function SeatMatrixModal({
  isOpen,
  onClose,
  collegeName,
  branchCode,
  branchName,
  ecetIntake,
}) {
  /* ── Escape key handler ──────────────────────────────────── */
  const handleEsc = useCallback(
    (e) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEsc]);

  /* ── Seat calculation ────────────────────────────────────── */
  const { categories, specials, total } = useMemo(
    () => calculateShares(ecetIntake || 0),
    [ecetIntake]
  );

  if (!isOpen) return null;

  return (
    /* ── Backdrop ──────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up"
      onClick={onClose}
    >
      {/* ── Modal card ────────────────────────────────────── */}
      <div
        className="glass rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[var(--border)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────── */}
        <div className="sticky top-0 z-10 px-5 sm:px-6 py-4 border-b border-[var(--border)] flex items-start justify-between gap-3"
          style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(16px)' }}
        >
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-snug truncate">
              {collegeName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent-hover)]">
                {branchCode}
              </span>
              <span className="text-xs text-[var(--text-muted)] truncate">
                {branchName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Total seats badge */}
            <div className="flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/30 rounded-lg px-3 py-1.5">
              <Users size={14} className="text-indigo-400" />
              <span className="text-sm font-bold text-indigo-300">{total}</span>
              <span className="text-[10px] text-indigo-400/80 uppercase tracking-wide">ECET Seats</span>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Alert subtitle ─────────────────────────────── */}
        <div className="px-5 sm:px-6 pt-4 pb-2">
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/8 border border-amber-500/20">
            <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed text-amber-400/90">
              <strong>Note:</strong> AP ECET utilises a rotating state roster system.
              Calculated values below 1.0 signify fractional seat probability or rotation across admission cycles.
            </p>
          </div>
        </div>

        {/* ── Category Grid ──────────────────────────────── */}
        <div className="px-5 sm:px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const colors = CAT_COLORS[cat.key] || DEFAULT_COLOR;
              return (
                <div
                  key={cat.key}
                  className={`rounded-xl border p-3.5 transition hover:scale-[1.02] ${colors.bg} ${colors.border}`}
                >
                  {/* Category header */}
                  <div className="flex items-center justify-between mb-4 border-b border-[var(--border)]/40 pb-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${colors.badge}`}>
                      {cat.label}
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide block leading-none mb-1">Total Pool</span>
                      <span className={`text-sm font-bold tabular-nums leading-none ${colors.text}`}>
                        {cat.pool}
                      </span>
                    </div>
                  </div>

                  {/* Split Regional Grid */}
                  <div className="grid grid-cols-2 gap-3 divide-x divide-[var(--border)]/40">
                    
                    {/* Local 85% */}
                    <div className="pr-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)]">LOCAL <span className="opacity-60 font-normal">(85%)</span></span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Gen</span>
                          <span className={`text-xs tabular-nums ${valClass(cat.local.gen)}`}>{cat.local.gen}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Girls</span>
                          <span className={`text-xs tabular-nums ${valClass(cat.local.girls)}`}>{cat.local.girls}</span>
                        </div>
                      </div>
                    </div>

                    {/* UR 15% */}
                    <div className="pl-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)]">UR <span className="opacity-60 font-normal">(15%)</span></span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Gen</span>
                          <span className={`text-xs tabular-nums ${valClass(cat.ur.gen)}`}>{cat.ur.gen}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Girls</span>
                          <span className={`text-xs tabular-nums ${valClass(cat.ur.girls)}`}>{cat.ur.girls}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Special Categories Banner ──────────────────── */}
        <div className="px-5 sm:px-6 pb-5">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]/50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Special Horizontal Reservations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {specials.map((sp) => {
                const Icon = SPECIAL_ICONS[sp.key] || Shield;
                return (
                  <div
                    key={sp.key}
                    className="flex items-center gap-3 rounded-lg bg-[var(--bg-primary)]/60 border border-[var(--border)]/50 px-3 py-2.5"
                  >
                    <div className="p-1.5 rounded-md bg-[var(--accent)]/10">
                      <Icon size={14} className="text-[var(--accent)]" />
                    </div>
                    <div>
                      <span className={`text-sm tabular-nums ${valClass(sp.value)}`}>
                        {sp.value}
                      </span>
                      <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                        {SPECIAL_LABELS[sp.key] || sp.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Footer legend ──────────────────────────────── */}
        <div className="px-5 sm:px-6 pb-4">
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <strong>Bold green</strong> = ≥ 1.0 seat (high reliability)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
              <strong>Gray</strong> = &lt; 1.0 (roster rotation chance)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
