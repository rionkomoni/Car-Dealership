import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "car_dealership_theme";

function readTheme() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "dark" || v === "light") return v;
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function applyTheme(mode) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", mode);
}

const initialTheme = readTheme();
applyTheme(initialTheme);

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: initialTheme },
  reducers: {
    setTheme: (state, action) => {
      state.mode = action.payload === "dark" ? "dark" : "light";
      applyTheme(state.mode);
      localStorage.setItem(STORAGE_KEY, state.mode);
    },
    toggleTheme: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
      applyTheme(state.mode);
      localStorage.setItem(STORAGE_KEY, state.mode);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
