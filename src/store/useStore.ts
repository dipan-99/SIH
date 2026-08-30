import { create } from 'zustand';

interface Stats {
    high: number;
    medium: number;
    low: number;
}

interface ViewerState {
    activeTab: 'viewer' | 'benchmark';
    displayMode: number;
    confidenceThreshold: number;
    stats: Stats;
    showMesh: boolean;
    showPointCloud: boolean;
    showGrid: boolean;
    isMeasureMode: boolean;
    measurePoints: [number, number, number][];
    globalScaleFactor: number;
    setActiveTab: (tab: 'viewer' | 'benchmark') => void;
    setDisplayMode: (mode: number) => void;
    setConfidenceThreshold: (threshold: number) => void;
    setStats: (stats: Stats) => void;
    setShowMesh: (show: boolean) => void;
    setShowPointCloud: (show: boolean) => void;
    setShowGrid: (show: boolean) => void;
    setIsMeasureMode: (isMeasure: boolean) => void;
    setMeasurePoints: (points: [number, number, number][]) => void;
    setGlobalScaleFactor: (scale: number) => void;
}

export const useStore = create<ViewerState>((set) => ({
    activeTab: 'viewer',
    displayMode: 0,
    confidenceThreshold: 0.65,
    stats: { high: 0, medium: 0, low: 0 },
    showMesh: true,
    showPointCloud: true,
    showGrid: true,
    isMeasureMode: false,
    measurePoints: [],
    globalScaleFactor: 1.0,
    setActiveTab: (tab) => set({ activeTab: tab }),
    setDisplayMode: (mode) => set({ displayMode: mode }),
    setConfidenceThreshold: (threshold) => set({ confidenceThreshold: threshold }),
    setStats: (stats) => set({ stats }),
    setShowMesh: (show) => set({ showMesh: show }),
    setShowPointCloud: (show) => set({ showPointCloud: show }),
    setShowGrid: (show) => set({ showGrid: show }),
    setIsMeasureMode: (isMeasure) => set({ isMeasureMode: isMeasure, measurePoints: [] }),
    setMeasurePoints: (points) => set({ measurePoints: points }),
    setGlobalScaleFactor: (scale) => set({ globalScaleFactor: scale }),
}));
