import { create } from "zustand";

const getSystemTheme = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (theme) => {
  const root = document.documentElement;

  const actualTheme =
    theme === "system" ? getSystemTheme() : theme;

  if (actualTheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("theme") || "light",

  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    applyTheme(theme);

    set({ theme });
  },

  initializeTheme: (theme) => {
    const savedTheme =
      theme || localStorage.getItem("theme") || "light";

    localStorage.setItem("theme", savedTheme);
    applyTheme(savedTheme);

    set({ theme: savedTheme });
  },
}));