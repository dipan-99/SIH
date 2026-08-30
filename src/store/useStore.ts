import { create } from 'zustand';

interface ViewerState {
  displayMode: number;
  confidenceThreshold: number;
  setDisplayMode: (mode: number) => void;
  setConfidenceThreshold: (threshold: number) => void;
}

export const useStore = create<ViewerState>((set) => ({
  displayMode: 0,
  confidenceThreshold: 0.65,
  setDisplayMode: (mode) => set({ displayMode: mode }),
  setConfidenceThreshold: (threshold) => set({ confidenceThreshold: threshold }),
}));
