import { useState, useMemo } from 'react';
import { Grid3X3, TrendingUp, TrendingDown, Minus, IndianRupee, Users } from 'lucide-react';
import cutoffs2025 from '../ecet_cse-related_cutoffs_2025.json';
import cutoffs2024 from '../ecet_cse-related_cutoffs_2024.json';
import seatsData from '../ap_ecet_cse_seats.json';
import SeatMatrixModal from './SeatMatrixModal';

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const COURSE_NAMES = {
  ALL:  'All Courses',
  CSE:  'Computer Science & Engineering',
  CSM:  'CSE (AI & Machine Learning)',
  CSD:  'CSE (Data Science)',
  CAI:  'CSE (Artificial Intelligence)',
  INF:  'Information Technology',
  AID:  'AI & Data Science',
  AIM:  'AI & Machine Learning',
  CSC:  'CSE (Cyber Security)',
  CSO:  'CSE (IoT)',
  CSB:  'CSE (Blockchain)',
  CIC:  'CSE (IoT & Cyber Security)',
  AI:   'Artificial Intelligence',
};

const CASTE_LABELS = {
  OC:   'OC (Open Category)',
  BC_A: 'BC-A',
  BC_B: 'BC-B',
  BC_C: 'BC-C',
  BC_D: 'BC-D',
  BC_E: 'BC-E',
  EWS:  'EWS',
  SC_I: 'SC - I',
  SC_II: 'SC - II',
  SC_III: 'SC - III',
  ST:   'ST',
};

// Probability tier config
const TIERS = {
  Safety: { label: 'Safety',  emoji: '🟢', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', multiplier: 0.85 },
  Match:  { label: 'Match',   emoji: '🟡', color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',   multiplier: 1.05 },
  Reach:  { label: 'Reach',   emoji: '🔴', color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/30',     multiplier: 1.20 },
};

/* ─────────────────────────────────────────────────────────────
   BUILD SEAT LOOKUP (college code → branch code → {seats, fee})
───────────────────────────────────────────────────────────── */
const seatLookup = {};
for (const college of seatsData.collegeDetails) {
  const branches = {};
  for (const d of college.details) {
    branches[d.branchCode] = { seats: d.seats, fee: d.fee, branchName: d.branchName };
  }
  seatLookup[college.code] = {
    name: college.name,
    place: college.place,
    district: college.district,
    region: college.region,
    type: college.type,
    branches,
  };
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

/**
 * Get best applicable cutoff from a course's category data.
 * For 2024: SC has no sub-types (just SC), so we map SC_I/II/III → SC
 * For 2025: SC_I, SC_II, SC_III are distinct
 */
function getApplicableCutoff(caste, gender, region, courseData, is2024 = false) {
  // For 2024 data, SC sub-types don't exist — map to generic SC
  let casteTokens = [caste];
  if (is2024 && (caste === 'SC_I' || caste === 'SC_II' || caste === 'SC_III')) {
    casteTokens = ['SC'];
  }

  const regions = region === 'UR' ? ['UR'] : [region, 'UR'];
  let best = null;

  for (const ct of casteTokens) {
    for (const reg of regions) {
      const genKey = `${ct}_GEN_${reg}`;
      if (courseData[genKey] != null) {
        best = best === null ? courseData[genKey] : Math.max(best, courseData[genKey]);
      }
      if (gender === 'F') {
        const girlsKey = `${ct}_GIRLS_${reg}`;
        if (courseData[girlsKey] != null) {
          best = best === null ? courseData[girlsKey] : Math.max(best, courseData[girlsKey]);
        }
      }
    }
  }
  return best;
}

function getTier(userRank, cutoff) {
  if (userRank <= cutoff * TIERS.Safety.multiplier) return 'Safety';
  if (userRank <= cutoff * TIERS.Match.multiplier)  return 'Match';
  if (userRank <= cutoff * TIERS.Reach.multiplier)  return 'Reach';
  return null;
}

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
export default function Predictor() {
  const [rank,   setRank]   = useState('');
  const [caste,  setCaste]  = useState('OC');
  const [region, setRegion] = useState('AU');
  const [gender, setGender] = useState('M');
  const [course, setCourse] = useState('ALL');

  // Seat Matrix modal state
  const [modalData, setModalData] = useState(null);

  /* ── Prediction Algorithm (combined 2024 + 2025) ─────────── */
  const results = useMemo(() => {
    const userRank = parseInt(rank, 10);
    if (!rank || isNaN(userRank) || userRank <= 0) return [];

    const output = [];

    // Iterate over 2025 colleges as primary dataset
    for (const [code, college] of Object.entries(cutoffs2025)) {
      const coursesToCheck =
        course === 'ALL'
          ? Object.keys(college.courses)
          : college.courses[course] ? [course] : [];

      for (const courseCode of coursesToCheck) {
        const courseData25 = college.courses[courseCode];
        if (!courseData25) continue;

        const cutoff25 = getApplicableCutoff(caste, gender, region, courseData25, false);
        if (cutoff25 == null) continue;

        const tier = getTier(userRank, cutoff25);
        if (!tier) continue;

        // Look up 2024 cutoff for comparison
        let cutoff24 = null;
        const college24 = cutoffs2024[code];
        if (college24 && college24.courses[courseCode]) {
          cutoff24 = getApplicableCutoff(caste, gender, region, college24.courses[courseCode], true);
        }

        // Look up seat/fee data
        const seatInfo = seatLookup[code];
        const branchInfo = seatInfo?.branches[courseCode];

        output.push({
          collegeCode: code,
          collegeName: college.collegeName,
          courseCode,
          courseName: COURSE_NAMES[courseCode] || courseCode,
          cutoff25,
          cutoff24,
          tier,
          gap: cutoff25 - userRank,
          // Enriched college data
          fee: branchInfo?.fee || null,
          seats: branchInfo?.seats || null,
          branchName: branchInfo?.branchName || COURSE_NAMES[courseCode] || courseCode,
          place: seatInfo?.place || null,
          district: seatInfo?.district || null,
          collegeRegion: seatInfo?.region || null,
          collegeType: seatInfo?.type || null,
        });
      }
    }

    return output.sort((a, b) => b.gap - a.gap);
  }, [rank, caste, region, gender, course]);

  /* ── Stats ──────────────────────────────────────────────── */
  const stats = useMemo(() => ({
    Safety: results.filter(r => r.tier === 'Safety').length,
    Match:  results.filter(r => r.tier === 'Match').length,
    Reach:  results.filter(r => r.tier === 'Reach').length,
  }), [results]);

  /* ── Helpers ─────────────────────────────────────────────── */
  const selectCls =
    'w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none cursor-pointer transition';
  const labelCls =
    'block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5';

  /** Render the cutoff trend inline (not a component to avoid reconciliation issues) */
  function renderCutoffTrend(c25, c24) {
    if (c24 == null) return (
      <div className="text-right">
        <div className="text-[var(--text-primary)] font-semibold tabular-nums">{c25.toLocaleString()}</div>
        <div className="text-[10px] text-[var(--text-muted)]">2025 · no 2024 data</div>
      </div>
    );
    const diff = c25 - c24;
    const pct = c24 !== 0 ? Math.round((diff / c24) * 100) : 0;
    const isUp = diff > 0;
    const isFlat = diff === 0;
    return (
      <div className="text-right">
        <div className="text-[var(--text-primary)] font-semibold tabular-nums">{c25.toLocaleString()}</div>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          <span className="text-[10px] text-[var(--text-muted)] tabular-nums">'24: {c24.toLocaleString()}</span>
          {isFlat ? (
            <Minus size={10} className="text-slate-400" />
          ) : isUp ? (
            <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-medium">
              <TrendingUp size={10} />+{pct}%
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-[10px] text-rose-400 font-medium">
              <TrendingDown size={10} />{pct}%
            </span>
          )}
        </div>
      </div>
    );
  }

  /** Open seat matrix modal for a result row */
  function openSeatMatrix(r) {
    setModalData({
      collegeName: r.collegeName,
      branchCode: r.courseCode,
      branchName: r.branchName,
      ecetIntake: r.seats || 0,
    });
  }

  return (
    <>
    <div className="animate-fade-in-up">
      {/* ── Page title ────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          🎓 College CSE Course Predictor
        </h2>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            📅 Compares 2024 & 2025 cutoffs
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            ℹ️ Enter your <strong className="mx-0.5">integrated rank</strong> for accurate predictions
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
            ⚠️ Results are <strong className="mx-0.5">indicative only</strong> — seat allotment is not guaranteed
          </span>
        </div>
      </div>

      {/* ── Filter Form ──────────────────────────────────── */}
      <div className="glass rounded-xl p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Rank */}
          <div>
            <label className={labelCls}>Your Rank</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 3500"
              value={rank}
              onChange={e => setRank(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition"
            />
          </div>

          {/* Caste */}
          <div>
            <label className={labelCls}>Caste</label>
            <select value={caste} onChange={e => setCaste(e.target.value)} className={selectCls}>
              {Object.entries(CASTE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div>
            <label className={labelCls}>Region</label>
            <select value={region} onChange={e => setRegion(e.target.value)} className={selectCls}>
              <option value="AU">AU Region (local + UR seats)</option>
              <option value="SVU">SVU Region (local + UR seats)</option>
              <option value="UR">UR Only (Non-Local seats)</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className={labelCls}>Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)} className={selectCls}>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>

          {/* Course */}
          <div>
            <label className={labelCls}>Course</label>
            <select value={course} onChange={e => setCourse(e.target.value)} className={selectCls}>
              {Object.entries(COURSE_NAMES).map(([v, l]) => (
                <option key={v} value={v}>{v === 'ALL' ? 'All Courses' : `${v} — ${l}`}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Stats summary ─────────────────────────────────── */}
      {results.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {Object.entries(TIERS).map(([key, tier]) => (
            <div key={key} className={`glass rounded-xl p-4 border ${tier.bg} text-center stagger`}
              style={{ '--delay': key === 'Safety' ? '0ms' : key === 'Match' ? '60ms' : '120ms' }}>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{stats[key]}</div>
              <div className={`text-xs font-semibold uppercase tracking-wider mt-0.5 ${tier.color}`}>
                {tier.emoji} {tier.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────── */}
      {!rank || rank === '' ? (
        <div className="glass rounded-xl p-16 text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h3 className="text-lg font-semibold text-[var(--text-secondary)]">Enter your rank to get started</h3>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Fill in your rank, caste, region, and gender above to see predicted college chances.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="glass rounded-xl p-16 text-center">
          <div className="text-5xl mb-4">😕</div>
          <h3 className="text-lg font-semibold text-[var(--text-secondary)]">No matches found</h3>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Try a higher rank, different caste category, or select &quot;All Courses&quot;.
          </p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {results.length} colleges found
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              Tap any row for seat matrix · Sorted safest first
            </span>
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="text-left px-5 py-3 font-semibold">College</th>
                  <th className="text-left px-4 py-3 font-semibold">Course</th>
                  <th className="text-right px-4 py-3 font-semibold">Cutoff (2025 vs 2024)</th>
                  <th className="text-right px-4 py-3 font-semibold">Fee</th>
                  <th className="text-right px-4 py-3 font-semibold">Gap</th>
                  <th className="text-center px-4 py-3 font-semibold">Chances</th>
                  <th className="text-center px-4 py-3 font-semibold">Matrix</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const tier = TIERS[r.tier];
                  return (
                    <tr
                      key={`${r.collegeCode}-${r.courseCode}-${i}`}
                      className="border-b border-[var(--border)]/50 last:border-b-0 hover:bg-[var(--bg-surface)]/40 transition cursor-pointer"
                      onClick={() => openSeatMatrix(r)}
                    >
                      {/* College */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent-hover)] shrink-0">
                            {r.collegeCode}
                          </span>
                          <div className="min-w-0">
                            <span className="text-[var(--text-primary)] font-medium text-xs leading-snug block truncate max-w-[200px]">
                              {r.collegeName}
                            </span>
                            {r.place && (
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {r.place}{r.district ? `, ${r.district}` : ''} · {r.collegeType || ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-violet-500/15 text-violet-400 inline-block w-fit">
                            {r.courseCode}
                          </span>
                          {r.seats && (
                            <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                              <Users size={9} />{r.seats} seats
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cutoff with trend */}
                      <td className="px-4 py-3">
                        {renderCutoffTrend(r.cutoff25, r.cutoff24)}
                      </td>

                      {/* Fee */}
                      <td className="px-4 py-3 text-right">
                        {r.fee ? (
                          <span className="flex items-center justify-end gap-1 text-xs text-emerald-400">
                            <IndianRupee size={10} />
                            {r.fee.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[var(--text-muted)]">—</span>
                        )}
                      </td>

                      {/* Gap */}
                      <td className="px-4 py-3 text-right">
                        <span className={`tabular-nums text-xs font-medium ${r.gap >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {r.gap >= 0 ? '+' : ''}{r.gap.toLocaleString()}
                        </span>
                      </td>

                      {/* Tier */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${tier.bg} ${tier.color}`}>
                          {tier.emoji} {tier.label}
                        </span>
                      </td>

                      {/* Seat Matrix button */}
                      <td className="px-4 py-3 text-center">
                        {r.seats ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); openSeatMatrix(r); }}
                            className="p-1.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent-hover)] hover:bg-[var(--accent)]/20 border border-[var(--accent)]/20 transition cursor-pointer"
                            title="View Seat Matrix"
                          >
                            <Grid3X3 size={13} />
                          </button>
                        ) : (
                          <span className="text-[10px] text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card layout */}
          <div className="lg:hidden divide-y divide-[var(--border)]/50">
            {results.map((r, i) => {
              const tier = TIERS[r.tier];
              return (
                <div
                  key={`${r.collegeCode}-${r.courseCode}-${i}`}
                  className="p-4 cursor-pointer hover:bg-[var(--bg-surface)]/30 transition"
                  onClick={() => openSeatMatrix(r)}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent-hover)] shrink-0">
                        {r.collegeCode}
                      </span>
                      <span className="text-xs font-semibold text-[var(--text-primary)] leading-snug truncate">
                        {r.collegeName}
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ${tier.bg} ${tier.color}`}>
                      {tier.emoji} {tier.label}
                    </span>
                  </div>

                  {/* Course + details */}
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-violet-500/15 text-violet-400">
                        {r.courseCode}
                      </span>
                      {r.fee && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                          <IndianRupee size={8} />{r.fee.toLocaleString('en-IN')}
                        </span>
                      )}
                      {r.seats && (
                        <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-0.5">
                          <Users size={8} />{r.seats}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-[var(--text-muted)]">'25</div>
                        <div className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                          {r.cutoff25.toLocaleString()}
                        </div>
                      </div>
                      {r.cutoff24 != null && (
                        <div className="text-right">
                          <div className="text-xs text-[var(--text-muted)]">'24</div>
                          <div className="text-sm font-semibold text-[var(--text-muted)] tabular-nums">
                            {r.cutoff24.toLocaleString()}
                          </div>
                        </div>
                      )}
                      <div className="text-right">
                        <div className="text-xs text-[var(--text-muted)]">Gap</div>
                        <div className={`text-sm font-semibold tabular-nums ${r.gap >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {r.gap >= 0 ? '+' : ''}{r.gap.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seat matrix hint */}
                  {r.seats && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-[var(--accent-hover)]">
                      <Grid3X3 size={10} />
                      Tap for seat matrix breakdown
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Legend ──────────────────────────────────────── */}
      {results.length > 0 && (
        <div className="mt-4 glass rounded-xl p-4 flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-secondary)]">Guide:</span>
          <span>🟢 <strong>Safety</strong> — rank ≤ 85% of cutoff</span>
          <span>🟡 <strong>Match</strong> — rank ≤ 105% of cutoff</span>
          <span>🔴 <strong>Reach</strong> — rank ≤ 120% of cutoff</span>
          <span>· <strong>Gap</strong> = cutoff − your rank</span>
          <span>· <strong>UR seats</strong> are always included</span>
          <span>· <TrendingUp size={10} className="inline text-emerald-400" /> cutoff rose vs 2024 · <TrendingDown size={10} className="inline text-rose-400" /> cutoff dropped</span>
        </div>
      )}

    </div>

    {/* ── Seat Matrix Modal (rendered outside main content div) ── */}
    <SeatMatrixModal
      isOpen={modalData !== null}
      onClose={() => setModalData(null)}
      collegeName={modalData?.collegeName || ''}
      branchCode={modalData?.branchCode || ''}
      branchName={modalData?.branchName || ''}
      ecetIntake={modalData?.ecetIntake || 0}
    />
    </>
  );
}
