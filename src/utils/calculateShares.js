/**
 * calculateShares.js
 *
 * Pure utility that distributes fractional seat probabilities for a given
 * ECET intake size based on official AP statutory reservation percentages.
 *
 * Because AP ECET lateral entry seats are often tiny pools (6, 12, 28),
 * allocating absolute whole numbers is impossible — this returns fractional
 * probabilities formatted to 1 decimal place.
 */

/* ── A. Vertical Reservation Percentages ─────────────────────── */
const VERTICAL = {
  OC:     0.40,    // 40%
  EWS:    0.10,    // 10%
  BC_A:   0.07,    // 7%
  BC_B:   0.10,    // 10%
  BC_C:   0.01,    // 1%
  BC_D:   0.07,    // 7%
  BC_E:   0.04,    // 4%
  SC_I:   0.01,    // 1%  (G.O.Ms.No. 7 – Group 1)
  SC_II:  0.065,   // 6.5%
  SC_III: 0.075,   // 7.5%
  ST:     0.06,    // 6%
};

/* ── B. Regional Split (Applied to each vertical) ────────────── */
const LOCAL_SHARE = 0.85; // 85% Local (AU/SVU)
const UR_SHARE    = 0.15; // 15% Unreserved

/* ── C. Horizontal Gender Split (within Local and UR pools) ──── */
const GIRLS_SHARE = 1 / 3;   // 33.33%
const GEN_SHARE   = 2 / 3;   // 66.67%

/* ── D. Special Horizontal Pool Percentages (across total) ───── */
const SPECIALS = {
  PWD:  0.05,    // 5%  (G.O.Ms.No. 10)
  CAP:  0.02,    // 2%
  NCC:  0.01,    // 1%
  SG:   0.005,   // 0.5% (Scouts & Guides – G.O.Ms.No. 27)
};

/* ── Formatter ───────────────────────────────────────────────── */
function fmt(value) {
  const rounded = Math.round(value * 10) / 10;
  return rounded === 0 ? '0' : rounded.toFixed(1);
}

/**
 * Calculate seat probability distribution for a given intake.
 *
 * @param {number} ecetIntake – total ECET lateral entry seats for a branch
 * @returns {{ categories: Array, specials: Array, total: number }}
 */
export default function calculateShares(ecetIntake) {
  const intake = Number(ecetIntake) || 0;

  // ── Vertical → Regional → Horizontal breakdown ──────────────
  const categories = Object.entries(VERTICAL).map(([key, pct]) => {
    const pool = intake * pct;
    
    // Regional split
    const localPool = pool * LOCAL_SHARE;
    const urPool    = pool * UR_SHARE;

    return {
      key,
      label: key.replace(/_/g, ' - '),   // SC_I → SC - I
      pool:  fmt(pool),
      local: {
        pool:  fmt(localPool),
        gen:   fmt(localPool * GEN_SHARE),
        girls: fmt(localPool * GIRLS_SHARE),
      },
      ur: {
        pool:  fmt(urPool),
        gen:   fmt(urPool * GEN_SHARE),
        girls: fmt(urPool * GIRLS_SHARE),
      }
    };
  });

  // ── Special Horizontal pools ────────────────────────────────
  const specials = Object.entries(SPECIALS).map(([key, pct]) => ({
    key,
    label: key,
    value: fmt(intake * pct),
  }));

  return { categories, specials, total: intake };
}
