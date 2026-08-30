import { useStore } from '../store/useStore';

export default function UI() {
  const displayMode = useStore((state) => state.displayMode);
  const confidenceThreshold = useStore((state) => state.confidenceThreshold);
  const setDisplayMode = useStore((state) => state.setDisplayMode);
  const setConfidenceThreshold = useStore((state) => state.setConfidenceThreshold);

  return (
    <div className="absolute top-4 left-0 w-full flex flex-col items-center gap-4 z-10 pointer-events-none">
      <div className="flex gap-2 pointer-events-auto bg-white/90 p-2 rounded-lg shadow-md backdrop-blur">
        <button
          onClick={() => setDisplayMode(0)}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            displayMode === 0 ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Photorealistic
        </button>
        <button
          onClick={() => setDisplayMode(1)}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            displayMode === 1 ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Confidence Heatmap
        </button>
        <button
          onClick={() => setDisplayMode(2)}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            displayMode === 2 ? 'bg-indigo-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Verified Only
        </button>
      </div>

      {displayMode === 2 && (
        <div className="pointer-events-auto bg-white/90 p-4 rounded-lg shadow-md backdrop-blur flex flex-col items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">
            Confidence Threshold: {confidenceThreshold.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-48 cursor-pointer accent-indigo-600"
          />
        </div>
      )}
    </div>
  );
}
