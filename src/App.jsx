import { useState } from 'react';
import { useSelector } from 'react-redux';
import { LayoutGrid, Target } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardVisuals from './components/DashboardVisuals';
import CollegeGrid from './components/CollegeGrid';
import Predictor from './components/Predictor';

const TABS = [
  { id: 'grid',      label: 'College Database', icon: LayoutGrid },
  { id: 'predictor', label: 'Rank Predictor',   icon: Target },
];

function App() {
  const activeBranch  = useSelector((state) => state.filters.activeBranch);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab,     setActiveTab]     = useState('grid');

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar — only shown on the College Database tab */}
      {activeTab === 'grid' && (
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen transition-all duration-300 w-full">
        {/* Sticky Header */}
        <Header
          onMenuToggle={() => setIsSidebarOpen(prev => !prev)}
          showMenuToggle={activeTab === 'grid'}
          hasSidebar={activeTab === 'grid'}
        />

        {/* ── Tab Bar ──────────────────────────────────── */}
        <div className={`sticky top-[57px] z-30 border-b border-[var(--border)] ${activeTab === 'grid' ? 'lg:pl-72' : ''}`}
          style={{ background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(16px)' }}>
          <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 pb-0">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-200 cursor-pointer
                    ${isActive
                      ? 'border-[var(--accent)] text-[var(--accent-hover)] bg-[var(--accent)]/5'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border)]'}
                  `}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{id === 'grid' ? 'Database' : 'Predictor'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab Content ──────────────────────────────── */}
        <div className={`p-4 sm:p-6 ${activeTab === 'grid' ? 'lg:pl-76' : ''}`}>

          {/* ── COLLEGE DATABASE TAB ─────────────────── */}
          {activeTab === 'grid' && (
            <>
              <DashboardVisuals />

              {activeBranch !== null && (
                <div className="mb-6 mt-4 animate-fade-in-up">
                  <h2 className="text-2xl font-bold flex items-center"
                    style={{ color: 'var(--text-primary)' }}>
                    <span
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg mr-3 text-sm font-bold shrink-0"
                      style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent-hover)' }}
                    >
                      {activeBranch}
                    </span>
                    Branch View
                  </h2>
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    Showing colleges offering{' '}
                    <strong style={{ color: 'var(--text-secondary)' }}>{activeBranch}</strong> branch
                  </p>
                </div>
              )}

              <CollegeGrid />
            </>
          )}

          {/* ── RANK PREDICTOR TAB ───────────────────── */}
          {activeTab === 'predictor' && <Predictor />}
        </div>
      </main>
    </div>
  );
}

export default App;
