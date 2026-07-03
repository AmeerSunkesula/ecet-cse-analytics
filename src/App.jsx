import { useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardVisuals from './components/DashboardVisuals';
import CollegeGrid from './components/CollegeGrid';

function App() {
  const activeBranch = useSelector((state) => state.filters.activeBranch);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Responsive Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <main
        className="flex-1 min-h-screen transition-all duration-300 w-full"
        style={{ 
          marginLeft: '0px',
          paddingLeft: '0px',
        }}
      >
        {/* Sticky Header */}
        <Header onMenuToggle={() => setIsSidebarOpen(prev => !prev)} />

        {/* Content */}
        <div className="p-4 sm:p-6 lg:pl-76"> {/* Responsive padding to clear sidebar space on desktop */}
          {/* Always show DashboardVisuals (charts/stats) for real-time recalculations */}
          <DashboardVisuals />

          {activeBranch !== null && (
            /* Branch-specific header */
            <div className="mb-6 mt-4 animate-fade-in-up">
              <h2 className="text-2xl font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
                <span
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg mr-3 text-sm font-bold shrink-0"
                  style={{
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--accent-hover)',
                  }}
                >
                  {activeBranch}
                </span>
                Branch View
              </h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Showing colleges offering <strong style={{ color: 'var(--text-secondary)' }}>{activeBranch}</strong> branch
              </p>
            </div>
          )}

          <CollegeGrid />
        </div>
      </main>
    </div>
  );
}

export default App;
