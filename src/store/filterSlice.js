import { createSlice, createSelector } from '@reduxjs/toolkit';
import collegeData from '../ap_ecet_cse_seats.json';

/* ── Derived Constants ───────────────────────────────────────── */
const allColleges = collegeData.collegeDetails;
const grandTotals = collegeData.grandTotals;

// Pre-compute all unique branch codes from data
const allBranchCodes = [
  ...new Set(allColleges.flatMap((c) => c.details.map((d) => d.branchCode))),
].sort();

// Pre-compute all fee values for slider bounds
const allFees = allColleges.flatMap((c) => c.details.map((d) => d.fee));
const MIN_FEE = Math.min(...allFees);
const MAX_FEE = Math.max(...allFees);

// Pre-compute location hierarchy
const regionSet = [...new Set(allColleges.map((c) => c.region))].sort();

/* ── Initial State ───────────────────────────────────────────── */
const initialState = {
  activeBranch: null,       // null = Dashboard "All", string = branch code
  searchQuery: '',
  selectedRegion: '',
  selectedDistrict: '',
  selectedPlace: '',
  feeRange: [MIN_FEE, MAX_FEE],
  sortBy: 'name-asc',
  collegeType: '',          // '' | 'PVT' | 'SF' | 'UNIV' | 'SS'
};

/* ── Slice ───────────────────────────────────────────────────── */
const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setActiveBranch(state, action) {
      state.activeBranch = action.payload;
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    setSelectedRegion(state, action) {
      state.selectedRegion = action.payload;
      // Cascade reset
      state.selectedDistrict = '';
      state.selectedPlace = '';
    },
    setSelectedDistrict(state, action) {
      state.selectedDistrict = action.payload;
      // Cascade reset
      state.selectedPlace = '';
    },
    setSelectedPlace(state, action) {
      state.selectedPlace = action.payload;
    },
    setFeeRange(state, action) {
      state.feeRange = action.payload;
    },
    setSortBy(state, action) {
      state.sortBy = action.payload;
    },
    setCollegeType(state, action) {
      state.collegeType = action.payload;
    },
    resetFilters(state) {
      Object.assign(state, { ...initialState, activeBranch: state.activeBranch });
    },
  },
});

export const {
  setActiveBranch,
  setSearchQuery,
  setSelectedRegion,
  setSelectedDistrict,
  setSelectedPlace,
  setFeeRange,
  setSortBy,
  setCollegeType,
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;

/* ── Exported Constants ──────────────────────────────────────── */
export { allBranchCodes, MIN_FEE, MAX_FEE, regionSet, grandTotals, allColleges };

/* ── Selectors ───────────────────────────────────────────────── */

// Base selector
const selectFilters = (state) => state.filters;

/**
 * Cascade options — regions are static, districts depend on region,
 * places depend on district.
 */
export const selectCascadeOptions = createSelector(
  [selectFilters],
  (filters) => {
    const regions = regionSet;

    let districtsSource = allColleges;
    if (filters.selectedRegion) {
      districtsSource = allColleges.filter((c) => c.region === filters.selectedRegion);
    }
    const districts = [...new Set(districtsSource.map((c) => c.district))].sort();

    let placesSource = districtsSource;
    if (filters.selectedDistrict) {
      placesSource = districtsSource.filter((c) => c.district === filters.selectedDistrict);
    }
    const places = [...new Set(placesSource.map((c) => c.place))].sort();

    return { regions, districts, places };
  }
);

/**
 * Filtered colleges — applies ALL active filters and returns a flat list of
 * { college, branch } entries ready for display.
 */
export const selectFilteredColleges = createSelector(
  [selectFilters],
  (filters) => {
    const {
      activeBranch,
      searchQuery,
      selectedRegion,
      selectedDistrict,
      selectedPlace,
      feeRange,
      sortBy,
      collegeType,
    } = filters;

    const query = searchQuery.toLowerCase().trim();

    // Step 1: Filter colleges
    let filtered = allColleges;

    if (selectedRegion) {
      filtered = filtered.filter((c) => c.region === selectedRegion);
    }
    if (selectedDistrict) {
      filtered = filtered.filter((c) => c.district === selectedDistrict);
    }
    if (selectedPlace) {
      filtered = filtered.filter((c) => c.place === selectedPlace);
    }
    if (collegeType) {
      filtered = filtered.filter((c) => c.type === collegeType);
    }
    if (query) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.code.toLowerCase().includes(query) ||
          c.place.toLowerCase().includes(query) ||
          c.details.some(
            (d) =>
              d.branchCode.toLowerCase().includes(query) ||
              d.branchName.toLowerCase().includes(query)
          )
      );
    }

    // Step 2: Flatten to { college, branch } entries
    let entries = [];
    for (const college of filtered) {
      // Filter branches by activeBranch if set
      const branches = activeBranch
        ? college.details.filter((d) => d.branchCode === activeBranch)
        : college.details;

      // Filter by fee range
      const feeFiltered = branches.filter(
        (d) => d.fee >= feeRange[0] && d.fee <= feeRange[1]
      );

      if (feeFiltered.length > 0) {
        entries.push({
          ...college,
          details: feeFiltered,
          _totalSeats: feeFiltered.reduce((sum, d) => sum + d.seats, 0),
          _minFee: Math.min(...feeFiltered.map((d) => d.fee)),
          _maxFee: Math.max(...feeFiltered.map((d) => d.fee)),
        });
      }
    }

    // Step 3: Sort
    switch (sortBy) {
      case 'name-asc':
        entries.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        entries.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'fee-asc':
        entries.sort((a, b) => a._minFee - b._minFee);
        break;
      case 'fee-desc':
        entries.sort((a, b) => b._maxFee - a._maxFee);
        break;
      case 'seats-desc':
        entries.sort((a, b) => b._totalSeats - a._totalSeats);
        break;
      default:
        break;
    }

    return entries;
  }
);

/**
 * Dashboard statistics — computes totals from the FILTERED dataset
 * so charts react in real-time to filter changes.
 */
export const selectDashboardStats = createSelector(
  [selectFilteredColleges],
  (colleges) => {
    const totalColleges = colleges.length;
    const totalSeats = colleges.reduce((sum, c) => sum + c._totalSeats, 0);

    const allFeeValues = colleges.flatMap((c) => c.details.map((d) => d.fee));
    const avgFee =
      allFeeValues.length > 0
        ? Math.round(allFeeValues.reduce((a, b) => a + b, 0) / allFeeValues.length)
        : 0;

    // Branch-wise breakdown for pie chart
    const branchMap = {};
    for (const college of colleges) {
      for (const detail of college.details) {
        if (!branchMap[detail.branchCode]) {
          branchMap[detail.branchCode] = { name: detail.branchCode, seats: 0, colleges: 0 };
        }
        branchMap[detail.branchCode].seats += detail.seats;
        branchMap[detail.branchCode].colleges += 1;
      }
    }
    const branchBreakdown = Object.values(branchMap).sort((a, b) => b.seats - a.seats);

    // Region-wise breakdown for bar chart
    const regionMap = {};
    for (const college of colleges) {
      if (!regionMap[college.region]) {
        regionMap[college.region] = { name: college.region, seats: 0, colleges: 0 };
      }
      regionMap[college.region].seats += college._totalSeats;
      regionMap[college.region].colleges += 1;
    }
    const regionBreakdown = Object.values(regionMap).sort((a, b) => b.seats - a.seats);

    // Type breakdown
    const typeMap = {};
    for (const college of colleges) {
      if (!typeMap[college.type]) {
        typeMap[college.type] = { name: college.type, seats: 0, colleges: 0 };
      }
      typeMap[college.type].seats += college._totalSeats;
      typeMap[college.type].colleges += 1;
    }
    const typeBreakdown = Object.values(typeMap).sort((a, b) => b.seats - a.seats);

    return {
      totalColleges,
      totalSeats,
      avgFee,
      totalBranches: branchBreakdown.length,
      branchBreakdown,
      regionBreakdown,
      typeBreakdown,
    };
  }
);
