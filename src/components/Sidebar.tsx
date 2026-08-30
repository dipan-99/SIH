import { useStore } from '../store/useStore';

export default function Sidebar() {
  const displayMode = useStore((state) => state.displayMode);
  const confidenceThreshold = useStore((state) => state.confidenceThreshold);
  const stats = useStore((state) => state.stats);
  const setDisplayMode = useStore((state) => state.setDisplayMode);
  const setConfidenceThreshold = useStore((state) => state.setConfidenceThreshold);

  const showMesh = useStore((state) => state.showMesh);
  const showPointCloud = useStore((state) => state.showPointCloud);
  const showGrid = useStore((state) => state.showGrid);
  const setShowMesh = useStore((state) => state.setShowMesh);
  const setShowPointCloud = useStore((state) => state.setShowPointCloud);
  const setShowGrid = useStore((state) => state.setShowGrid);

  const isMeasureMode = useStore((state) => state.isMeasureMode);
  const setIsMeasureMode = useStore((state) => state.setIsMeasureMode);

  return (
    <div className="w-full h-full bg-gray-900 text-gray-100 overflow-y-auto p-6 flex flex-col gap-6 font-sans">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Reconstruction Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Configure viewport and analysis layers.</p>
      </div>

      {/* 1. Display Mode */}
      <section className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
        <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider text-gray-400">Display Mode</h2>
        <div className="flex flex-col gap-2">
          {['Photorealistic', 'Confidence Heatmap', 'Verified Only'].map((mode, idx) => (
            <button
              key={mode}
              onClick={() => setDisplayMode(idx)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-left ${
                displayMode === idx 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Confidence Threshold */}
      {displayMode === 2 && (
        <section className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Confidence Threshold</h2>
            <span className="text-xs font-mono bg-gray-900 px-2 py-1 rounded text-indigo-400">
              {confidenceThreshold.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </section>
      )}

      {/* 3. Tools */}
      <section className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
        <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider text-gray-400">Tools</h2>
        <button
          onClick={() => setIsMeasureMode(!isMeasureMode)}
          className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-center ${
            isMeasureMode 
              ? 'bg-amber-600 text-white shadow-md hover:bg-amber-700' 
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {isMeasureMode ? 'Exit Measure Mode (Esc)' : 'Measure Distance'}
        </button>
      </section>

      {/* 4. Layers */}
      <section className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
        <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider text-gray-400">Layers</h2>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={showMesh} onChange={(e) => setShowMesh(e.target.checked)} className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-800 bg-gray-700 cursor-pointer" />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Base Mesh</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={showPointCloud} onChange={(e) => setShowPointCloud(e.target.checked)} className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-800 bg-gray-700 cursor-pointer" />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Point Cloud Overlay</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-800 bg-gray-700 cursor-pointer" />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Grid Helper</span>
          </label>
        </div>
      </section>

      {/* 4. Legend */}
      <section className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
        <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider text-gray-400">Legend</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
            <span className="text-sm text-gray-300">Directly Observed (&ge;0.7)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
            <span className="text-sm text-gray-300">Inferred / Extrapolated (0.3-0.69)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></div>
            <span className="text-sm text-gray-300">Gap / Unobserved (&lt;0.3)</span>
          </div>
        </div>
      </section>

      {/* 5. Live Stats */}
      <section className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm mt-auto">
        <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider text-gray-400">Live Stats</h2>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 bg-gray-900 rounded-lg">
            <span className="text-xs text-gray-500 mb-1">Observed</span>
            <span className="text-lg font-bold text-green-400">{stats.high.toFixed(1)}%</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-900 rounded-lg">
            <span className="text-xs text-gray-500 mb-1">Inferred</span>
            <span className="text-lg font-bold text-amber-400">{stats.medium.toFixed(1)}%</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-gray-900 rounded-lg">
            <span className="text-xs text-gray-500 mb-1">Gap</span>
            <span className="text-lg font-bold text-red-400">{stats.low.toFixed(1)}%</span>
          </div>
        </div>
      </section>

    </div>
  );
}
