// Kept separate from theme.ts (a client module) so the server layout can inline it.
export const THEME_KEY = "jrn.theme";

/** Runs before first paint: applies the saved theme so there's no dark/light flash. */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t="dark";document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="dark";}`;
