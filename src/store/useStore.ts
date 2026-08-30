import { create } from 'zustand';

interface Stats {
  high: number;
  medium: number;
  low: number;
}

interface ViewerState {
  displayMode: number;
  confidenceThreshold: number;
  stats: Stats;
  setDisplayMode: (mode: number) => void;
  setConfidenceThreshold: (threshold: number) => void;
  setStats: (stats: Stats) => void;
}

export const useStore = create<ViewerState>((set) => ({
  displayMode: 0,
  confidenceThreshold: 0.65,
  stats: { high: 0, medium: 0, low: 0 },
  setDisplayMode: (mode) => set({ displayMode: mode }),
  setConfidenceThreshold: (threshold) => set({ confidenceThreshold: threshold }),
  setStats: (stats) => set({ stats }),
}));
