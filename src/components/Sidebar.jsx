import { useSelector, useDispatch } from 'react-redux';
import {
  setActiveBranch,
  setSearchQuery,
  setSelectedRegion,
  setSelectedDistrict,
  setSelectedPlace,
  setFeeRange,
  setSortBy,
  setCollegeType,
  resetFilters,
  selectCascadeOptions,
  allBranchCodes,
  MIN_FEE,
  MAX_FEE,
} from '../store/filterSlice';
import {
  Search,
  Filter,
  RotateCcw,
  ChevronDown,
  SlidersHorizontal,
  MapPin,
  Building2,
  Tag,
  ArrowUpDown,
} from 'lucide-react';

/* ── Shared Tailwind class strings ───────────────────────────── */
const selectClasses =
  'w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none cursor-pointer appearance-none transition';

const labelClasses =
  'flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2';

const sectionClasses = 'border-t border-[var(--border)] pt-4';

/* ── Component ───────────────────────────────────────────────── */
export default function Sidebar() {
  const dispatch = useDispatch();

  // Pull filter state from Redux
  const activeBranch = useSelector((s) => s.filters.activeBranch);
  const searchQuery = useSelector((s) => s.filters.searchQuery);
  const selectedRegion = useSelector((s) => s.filters.selectedRegion);
  const selectedDistrict = useSelector((s) => s.filters.selectedDistrict);
  const selectedPlace = useSelector((s) => s.filters.selectedPlace);
  const feeRange = useSelector((s) => s.filters.feeRange);
  const sortBy = useSelector((s) => s.filters.sortBy);
  const collegeType = useSelector((s) => s.filters.collegeType);

  // Cascading location options (memoised selector)
  const { regions, districts, places } = useSelector(selectCascadeOptions);

  return (
    <aside className="fixed left-0 top-0 w-72 h-screen overflow-y-auto glass-strong rounded-none p-5 flex flex-col gap-5 z-50">
      {/* ── 1. Title + Reset ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
          <SlidersHorizontal size={20} className="text-[var(--accent)]" />
          Filters
        </h2>
        <button
          onClick={() => dispatch(resetFilters())}
          title="Reset all filters"
          className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] transition"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* ── 2. Search Input ─────────────────────────────────────── */}
      <div>
        <label className={labelClasses}>
          <Search size={14} />
          Search
        </label>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder="College, branch, place…"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition"
          />
        </div>
      </div>

      {/* ── 3. Branch Dropdown ──────────────────────────────────── */}
      <div className={sectionClasses}>
        <label className={labelClasses}>
          <Tag size={14} />
          Branch
        </label>
        <select
          value={activeBranch || ''}
          onChange={(e) => dispatch(setActiveBranch(e.target.value || null))}
          className={selectClasses}
        >
          <option value="">All Branches</option>
          {allBranchCodes.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>

      {/* ── 4. College Type Dropdown ────────────────────────────── */}
      <div className={sectionClasses}>
        <label className={labelClasses}>
          <Building2 size={14} />
          College Type
        </label>
        <select
          value={collegeType}
          onChange={(e) => dispatch(setCollegeType(e.target.value))}
          className={selectClasses}
        >
          <option value="">All Types</option>
          <option value="PVT">PVT</option>
          <option value="SF">SF</option>
          <option value="UNIV">UNIV</option>
          <option value="SS">SS</option>
        </select>
      </div>

      {/* ── 5. Cascading Location Dropdowns ─────────────────────── */}
      <div className={sectionClasses}>
        <label className={labelClasses}>
          <MapPin size={14} />
          Location
        </label>
        <div className="flex flex-col gap-2">
          {/* Region */}
          <select
            value={selectedRegion}
            onChange={(e) => dispatch(setSelectedRegion(e.target.value))}
            className={selectClasses}
          >
            <option value="">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* District — disabled when no region is selected */}
          <select
            value={selectedDistrict}
            onChange={(e) => dispatch(setSelectedDistrict(e.target.value))}
            disabled={!selectedRegion}
            className={`${selectClasses} ${!selectedRegion ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Place — disabled when no district is selected */}
          <select
            value={selectedPlace}
            onChange={(e) => dispatch(setSelectedPlace(e.target.value))}
            disabled={!selectedDistrict}
            className={`${selectClasses} ${!selectedDistrict ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">All Places</option>
            {places.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 6. Fee Range Sliders ────────────────────────────────── */}
      <div className={sectionClasses}>
        <label className={labelClasses}>
          <Filter size={14} />
          Fee Range
        </label>
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          ₹{feeRange[0].toLocaleString()} — ₹{feeRange[1].toLocaleString()}
        </p>

        {/* Min fee slider */}
        <input
          type="range"
          min={MIN_FEE}
          max={MAX_FEE}
          step={1000}
          value={feeRange[0]}
          onChange={(e) => {
            const val = Number(e.target.value);
            // Min cannot exceed current max
            dispatch(setFeeRange([Math.min(val, feeRange[1]), feeRange[1]]));
          }}
          className="w-full accent-[var(--accent)] mb-2"
        />

        {/* Max fee slider */}
        <input
          type="range"
          min={MIN_FEE}
          max={MAX_FEE}
          step={1000}
          value={feeRange[1]}
          onChange={(e) => {
            const val = Number(e.target.value);
            // Max cannot go below current min
            dispatch(setFeeRange([feeRange[0], Math.max(val, feeRange[0])]));
          }}
          className="w-full accent-[var(--accent)]"
        />
      </div>

      {/* ── 7. Sort Dropdown ────────────────────────────────────── */}
      <div className={sectionClasses}>
        <label className={labelClasses}>
          <ArrowUpDown size={14} />
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => dispatch(setSortBy(e.target.value))}
          className={selectClasses}
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="fee-asc">Fee (Low-High)</option>
          <option value="fee-desc">Fee (High-Low)</option>
          <option value="seats-desc">Seats (Most)</option>
        </select>
      </div>
    </aside>
  );
}
