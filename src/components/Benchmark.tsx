import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BenchmarkData {
  flightDuration: number;
  processingDuration: number;
  trajectoryRMSE: number;
  relativeScaleError: number;
}

interface Manifest {
  benchmark: {
    baseline: BenchmarkData;
    ours: BenchmarkData;
  };
}

export default function Benchmark() {
  const [data, setData] = useState<Manifest | null>(null);

  useEffect(() => {
    fetch('/assets/viewer_manifest.json')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to load benchmark manifest", err));
  }, []);

  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white font-sans">
        Loading Benchmark Data...
      </div>
    );
  }

  const { baseline, ours } = data.benchmark;

  // Calculate metrics
  const flightTimeSaved = ((baseline.flightDuration - ours.flightDuration) / baseline.flightDuration) * 100;
  
  // "Accuracy Retained": Since lower RMSE is better, perhaps (1 - (ours - baseline)/baseline) * 100?
  // If baseline is 0.05 and ours is 0.05, accuracy is 100%. If ours is 0.0528, 
  // error increased by (0.0528 - 0.05)/0.05 = 0.056 -> 5.6% worse -> 94.4% accuracy retained
  const accuracyRetained = (1 - (ours.trajectoryRMSE - baseline.trajectoryRMSE) / baseline.trajectoryRMSE) * 100;
  
  const totalProcessing = ours.processingDuration;

  // Prepare chart data
  const chartData = [
    {
      name: 'Flight Duration (s)',
      Baseline: baseline.flightDuration,
      Ours: ours.flightDuration,
    },
    {
      name: 'Processing (s)',
      Baseline: baseline.processingDuration,
      Ours: ours.processingDuration,
    },
    {
      name: 'RMSE',
      Baseline: baseline.trajectoryRMSE,
      Ours: ours.trajectoryRMSE,
    },
    {
      name: 'Scale Error',
      Baseline: baseline.relativeScaleError,
      Ours: ours.relativeScaleError,
    },
  ];

  return (
    <div className="w-full h-full bg-gray-900 text-gray-100 p-8 overflow-y-auto font-sans">
      <h1 className="text-3xl font-bold mb-8 text-white tracking-tight">Performance Benchmark</h1>

      {/* 3 Large Callout Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
          <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Flight Time Saved</h2>
          <p className="text-4xl font-bold text-green-400">{flightTimeSaved.toFixed(1)}%</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
          <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Accuracy Retained</h2>
          <p className="text-4xl font-bold text-blue-400">{accuracyRetained.toFixed(1)}%</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
          <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Processing</h2>
          <p className="text-4xl font-bold text-indigo-400">{(totalProcessing / 60).toFixed(1)} Mins</p>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md mb-10">
        <h2 className="text-xl font-semibold mb-6">Metrics Comparison</h2>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                itemStyle={{ color: '#E5E7EB' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Baseline" fill="#6B7280" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ours" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-700">
              <th className="p-4 text-sm font-semibold text-gray-300">Metric</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Baseline</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Ours</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {chartData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-750 transition-colors">
                <td className="p-4 font-medium">{row.name}</td>
                <td className="p-4 text-gray-400">{row.Baseline}</td>
                <td className="p-4 text-blue-400 font-semibold">{row.Ours}</td>
                <td className={`p-4 font-medium ${(row.Ours - row.Baseline) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {((row.Ours - row.Baseline) > 0 ? '+' : '')}
                  {(row.Ours - row.Baseline).toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
