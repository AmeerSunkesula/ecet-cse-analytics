import { useState, useMemo } from 'react';
import cutoffsData from '../ecet_cse-related_cutoffs_2025.json';

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
  SC:   'SC (All)',
  ST:   'ST',
};

// For SC we try all sub-types
const SC_SUBTYPES = ['SC_I', 'SC_II', 'SC_III'];

// Probability tier config
const TIERS = {
  Safety: { label: 'Safety',  emoji: '🟢', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', multiplier: 0.85 },
  Match:  { label: 'Match',   emoji: '🟡', color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',   multiplier: 1.05 },
  Reach:  { label: 'Reach',   emoji: '🔴', color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/30',     multiplier: 1.20 },
};

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

/**
 * Collect all cutoff keys that are applicable to this student.
 * 
 * Rules:
 *  - Always check both the selected region (AU/SVU) AND UR (Non-Local/Unreserved)
 *    because UR seats are open to all zones.
 *  - Males  : check _GEN_ keys only
 *  - Females: check both _GEN_ and _GIRLS_ keys (GIRLS seats can be accessed by females)
 *  - SC expands to SC_I, SC_II, SC_III subtypes
 *  - In ALL cases, take Math.max() across all found values — the highest
 *    (most forgiving) cutoff is the one that benefits the student most.
 */
function getApplicableCutoff(caste, gender, region, courseData) {
  const casteTokens = caste === 'SC' ? SC_SUBTYPES : [caste];
  // Always check selected region + UR (non-local seats open to all)
  const regions = region === 'UR' ? ['UR'] : [region, 'UR'];

  let best = null;

  for (const ct of casteTokens) {
    for (const reg of regions) {
      // GEN key — always applicable
      const genKey = `${ct}_GEN_${reg}`;
      if (courseData[genKey] != null) {
        best = best === null ? courseData[genKey] : Math.max(best, courseData[genKey]);
      }

      // GIRLS key — only applicable to females
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

/** Determine tier for a given userRank vs cutoff */
function getTier(userRank, cutoff) {
  if (userRank <= cutoff * TIERS.Safety.multiplier) return 'Safety';
  if (userRank <= cutoff * TIERS.Match.multiplier)  return 'Match';
  if (userRank <= cutoff * TIERS.Reach.multiplier)  return 'Reach';
  return null; // beyond reach
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

  /* ── Prediction Algorithm ───────────────────────────────── */
  const results = useMemo(() => {
    const userRank = parseInt(rank, 10);
    if (!rank || isNaN(userRank) || userRank <= 0) return [];

    const output = [];

    for (const [, college] of Object.entries(cutoffsData)) {
      const coursesToCheck =
        course === 'ALL'
          ? Object.keys(college.courses)
          : college.courses[course] ? [course] : [];

      for (const courseCode of coursesToCheck) {
        const courseData = college.courses[courseCode];
        if (!courseData) continue;

        const cutoff = getApplicableCutoff(caste, gender, region, courseData);
        if (cutoff == null) continue;

        const tier = getTier(userRank, cutoff);
        if (!tier) continue;

        output.push({
          collegeCode: college.collegeCode,
          collegeName: college.collegeName,
          courseCode,
          courseName: COURSE_NAMES[courseCode] || courseCode,
          cutoff,
          tier,
          gap: cutoff - userRank, // positive = safer
        });
      }
    }

    // Sort: safest first (largest positive gap)
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

  return (
    <div className="animate-fade-in-up">
      {/* ── Page title ────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          🎓 College CSE Course Predictor
        </h2>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            📅 Based on 2025 cutoffs
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
        /* Empty — no rank entered */
        <div className="glass rounded-xl p-16 text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h3 className="text-lg font-semibold text-[var(--text-secondary)]">Enter your rank to get started</h3>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Fill in your rank, caste, region, and gender above to see predicted college chances.
          </p>
        </div>
      ) : results.length === 0 ? (
        /* Empty — no matches */
        <div className="glass rounded-xl p-16 text-center">
          <div className="text-5xl mb-4">😕</div>
          <h3 className="text-lg font-semibold text-[var(--text-secondary)]">No matches found</h3>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Try a higher rank, different caste category, or select "All Courses".
          </p>
        </div>
      ) : (
        /* Results table */
        <div className="glass rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {results.length} colleges found
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              Sorted by safest options first
            </span>
          </div>

          {/* Mobile: card layout | Desktop: table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="text-left px-5 py-3 font-semibold">College</th>
                  <th className="text-left px-4 py-3 font-semibold">Course</th>
                  <th className="text-right px-4 py-3 font-semibold">Last Cutoff</th>
                  <th className="text-right px-4 py-3 font-semibold">Gap</th>
                  <th className="text-center px-5 py-3 font-semibold">Chances</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const tier = TIERS[r.tier];
                  return (
                    <tr
                      key={`${r.collegeCode}-${r.courseCode}-${i}`}
                      className="border-b border-[var(--border)]/50 last:border-b-0 hover:bg-[var(--bg-surface)]/40 transition"
                    >
                      {/* College */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent-hover)] shrink-0">
                            {r.collegeCode}
                          </span>
                          <span className="text-[var(--text-primary)] font-medium text-xs leading-snug">
                            {r.collegeName}
                          </span>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-violet-500/15 text-violet-400 inline-block w-fit">
                            {r.courseCode}
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)] leading-tight">
                            {r.courseName}
                          </span>
                        </div>
                      </td>

                      {/* Cutoff */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-[var(--text-primary)] font-semibold tabular-nums">
                          {r.cutoff.toLocaleString()}
                        </span>
                      </td>

                      {/* Gap */}
                      <td className="px-4 py-3 text-right">
                        <span className={`tabular-nums text-xs font-medium ${r.gap >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {r.gap >= 0 ? '+' : ''}{r.gap.toLocaleString()}
                        </span>
                      </td>

                      {/* Tier */}
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${tier.bg} ${tier.color}`}>
                          {tier.emoji} {tier.label}
                        </span>
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
                <div key={`${r.collegeCode}-${r.courseCode}-${i}`} className="p-4">
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

                  {/* Course + stats row */}
                  <div className="flex items-center justify-between gap-4 mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-violet-500/15 text-violet-400">
                        {r.courseCode}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">{r.courseName}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-[var(--text-muted)]">Cutoff</div>
                        <div className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                          {r.cutoff.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[var(--text-muted)]">Gap</div>
                        <div className={`text-sm font-semibold tabular-nums ${r.gap >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {r.gap >= 0 ? '+' : ''}{r.gap.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Legend ──────────────────────────────────────── */}
      {results.length > 0 && (
        <div className="mt-4 glass rounded-xl p-4 flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-secondary)]">Tier guide:</span>
          <span>🟢 <strong>Safety</strong> — rank ≤ 85% of cutoff</span>
          <span>🟡 <strong>Match</strong> — rank ≤ 105% of cutoff</span>
          <span>🔴 <strong>Reach</strong> — rank ≤ 120% of cutoff</span>
          <span>· <strong>Gap</strong> = cutoff − your rank (positive = safer)</span>
          <span>· <strong>UR seats</strong> are always included — they are open to all regions</span>
        </div>
      )}
    </div>
  );
}
