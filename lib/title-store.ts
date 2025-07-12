import { create } from "zustand";

type TitleState = {
  title: string | null;
  isLoading: boolean;
  setTitle: (title: string | null) => void;
  setLoading: (loading: boolean) => void;
};

export const useTitleStore = create<TitleState>((set) => ({
  title: null,
  isLoading: false,
  setTitle: (title) => set({ title }),
  setLoading: (loading) => set({ isLoading: loading }),
}));