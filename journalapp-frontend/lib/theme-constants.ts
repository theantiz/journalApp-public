export type Theme = "light" | "dark";

export const THEME_KEY = "journalapp.theme";
export const THEME_EVENT = "journalapp-theme-change";

export const themeInitScript = `
  (function () {
    try {
      var key = "${THEME_KEY}";
      var storedTheme = window.localStorage.getItem(key);
      var theme =
        storedTheme === "dark" || storedTheme === "light"
          ? storedTheme
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch (error) {
      document.documentElement.dataset.theme = "light";
      document.documentElement.style.colorScheme = "light";
    }
  })();
`;
