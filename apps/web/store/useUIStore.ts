import { create } from 'zustand';

interface UIState {
  activeTile: string | null;
  setActiveTile: (tile: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTile: null,
  setActiveTile: (tile) => set({ activeTile: tile }),
}));
