import { create } from "zustand";

interface UIState {
    bottomNavHideCount: number;
    isBottomNavHidden: boolean;
    hideBottomNav: () => void;
    showBottomNav: () => void;
    setBottomNavHidden: (hidden: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    bottomNavHideCount: 0,
    isBottomNavHidden: false,
    hideBottomNav: () =>
        set((state) => {
            const next = state.bottomNavHideCount + 1;
            return { bottomNavHideCount: next, isBottomNavHidden: next > 0 };
        }),
    showBottomNav: () =>
        set((state) => {
            const next = Math.max(0, state.bottomNavHideCount - 1);
            return { bottomNavHideCount: next, isBottomNavHidden: next > 0 };
        }),
    setBottomNavHidden: (hidden) =>
        set({ isBottomNavHidden: hidden, bottomNavHideCount: hidden ? 1 : 0 }),
}));
