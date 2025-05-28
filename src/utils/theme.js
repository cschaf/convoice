// src/utils/theme.js
export const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  try {
    localStorage.setItem('theme', theme);
  } catch (error) {
    console.error("Failed to save theme to localStorage:", error);
  }
};

export const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
  } catch (error) {
    console.error("Failed to read theme from localStorage:", error);
    // Fallback if localStorage is unavailable or fails
  }
  // If no saved theme, check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light'; // Default to light
};
