import { useSelector } from 'react-redux';
import { selectFilteredColleges } from '../store/filterSlice';
import CollegeCard from './CollegeCard';
import { SearchX } from 'lucide-react';

/**
 * CollegeGrid – Responsive grid that renders CollegeCard components.
 * Shows an empty-state illustration when no colleges match the active filters.
 */
const CollegeGrid = () => {
  const colleges = useSelector(selectFilteredColleges);

  // ---------- Empty state ----------
  if (colleges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <SearchX size={64} className="text-[var(--text-muted)]/30 mb-4" />
        <h3 className="text-lg font-semibold text-[var(--text-secondary)]">
          No colleges found
        </h3>
        <p className="text-sm text-[var(--text-muted)]">
          Try adjusting your filters to see more results
        </p>
      </div>
    );
  }

  // ---------- Results grid ----------
  return (
    <>
      {/* Results count bar */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          Showing{' '}
          <span className="font-semibold text-[var(--text-primary)]">
            {colleges.length}
          </span>{' '}
          colleges
        </p>
      </div>

      {/* Responsive card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {colleges.map((college, index) => (
          <CollegeCard key={college.code} college={college} index={index} />
        ))}
      </div>
    </>
  );
};

export default CollegeGrid;
