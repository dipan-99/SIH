import Viewer from './components/Viewer';
import Sidebar from './components/Sidebar';
import Benchmark from './components/Benchmark';
import { useStore } from './store/useStore';

function App() {
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900 overflow-hidden font-sans">
      
      {/* Top Level Tab Switcher */}
      <header className="h-14 bg-gray-950 border-b border-gray-800 flex items-center px-6 shrink-0 shadow-sm z-20">
        <div className="flex gap-1 bg-gray-900 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('viewer')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'viewer' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            3D Viewer
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'benchmark' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            Benchmark
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-row overflow-hidden relative">
        
        {/* We use standard CSS display trick for Viewer so we don't lose WebGL Context/State on unmount */}
        <div className={`w-full h-full flex flex-row ${activeTab === 'viewer' ? 'block' : 'hidden'}`}>
          <div className="w-3/4 h-full relative">
            <Viewer />
          </div>
          <div className="w-1/4 h-full border-l border-gray-800 shrink-0 relative z-10">
            <Sidebar />
          </div>
        </div>

        {activeTab === 'benchmark' && (
          <div className="w-full h-full absolute inset-0 z-10 bg-gray-900">
            <Benchmark />
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
