// Renders a tiny AvatarSprite to an SVG data-URI for use as a custom mouse cursor.
// Stores/loads cursor preference from localStorage so it persists across pages.

import { getAvatar } from "./lounge";

const CURSOR_KEY = "jrn.cursor";
const CURSOR_SIZE = 32; // px — browsers clamp at 128px max

/** Build a minimal SVG string of the robot (front-facing, static). */
function avatarSvg(avatarId: string): string {
  const a = getAvatar(avatarId);

  // Hat helper
  let hat = "";
  switch (a.hat) {
    case "cap":
      hat = `<path d="M8 14 C8 3 40 3 40 14 Z" fill="${a.hatColor}"/>
             <ellipse cx="24" cy="14" rx="18.5" ry="2.6" fill="${a.hatColor}"/>
             <ellipse cx="24" cy="14" rx="18.5" ry="2.6" fill="#000" opacity="0.18"/>
             <circle cx="24" cy="4.2" r="1.4" fill="#fff" opacity="0.7"/>`;
      break;
    case "beanie":
      hat = `<path d="M7.5 15 C7.5 0.5 40.5 0.5 40.5 15 Z" fill="${a.hatColor}"/>
             <rect x="7" y="12" width="34" height="4.5" rx="2.2" fill="#fff" opacity="0.25"/>
             <circle cx="24" cy="1" r="3" fill="${a.hatColor}"/>`;
      break;
    case "headphones":
      hat = `<path d="M8 17 C6 -1 42 -1 40 17" stroke="${a.hatColor}" stroke-width="2.6" fill="none"/>
             <rect x="3.5" y="12.5" width="6.5" height="11" rx="3" fill="${a.hatColor}"/>
             <rect x="38" y="12.5" width="6.5" height="11" rx="3" fill="${a.hatColor}"/>`;
      break;
    case "bow":
      hat = `<g transform="translate(33 6.5)">
               <path d="M0 0 L-6.5 -4 L-6.5 4 Z M0 0 L6.5 -4 L6.5 4 Z" fill="${a.hatColor}"/>
               <circle cx="0" cy="0" r="2" fill="${a.hatColor}" stroke="#00000033" stroke-width="0.6"/>
             </g>`;
      break;
    case "crown":
      hat = `<path d="M14 7 L15.5 -1 L19.5 3 L24 -3.5 L28.5 3 L32.5 -1 L34 7 Z" fill="${a.hatColor}" stroke="#c99a1f" stroke-width="0.8"/>`;
      break;
    default:
      hat = `<line x1="24" y1="5.5" x2="24" y2="-1" stroke="#2a2a3c" stroke-width="1.6" stroke-linecap="round"/>
             <circle cx="24" cy="-2.2" r="2.3" fill="${a.hatColor}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64" width="${CURSOR_SIZE}" height="${Math.round(CURSOR_SIZE * (64 / 48))}">
    <ellipse cx="24" cy="61" rx="13" ry="3.2" fill="rgba(0,0,0,0.4)"/>
    <g>
      <g><rect x="16" y="48" width="6.5" height="12" rx="3" fill="#2a2a3c"/><rect x="15" y="57" width="8.5" height="3.6" rx="1.8" fill="#1c1c2a"/></g>
      <g><rect x="25.5" y="48" width="6.5" height="12" rx="3" fill="#2a2a3c"/><rect x="24.5" y="57" width="8.5" height="3.6" rx="1.8" fill="#1c1c2a"/></g>
      <g>
        <rect x="8.5" y="35" width="5.5" height="12" rx="2.75" fill="${a.shade}"/>
        <rect x="34" y="35" width="5.5" height="12" rx="2.75" fill="${a.shade}"/>
        <rect x="12.5" y="32.5" width="23" height="19" rx="9" fill="${a.body}" stroke="${a.shade}" stroke-width="1"/>
        <rect x="17" y="37.5" width="14" height="9" rx="4.5" fill="#ffffff" opacity="0.16"/>
        <circle cx="24" cy="42" r="1.7" fill="${a.hatColor}"/>
        <rect x="20.5" y="29.5" width="7" height="5" rx="2" fill="#2a2a3c"/>
        <g>
          <rect x="7" y="5" width="34" height="27" rx="13.5" fill="${a.body}" stroke="${a.shade}" stroke-width="1.2"/>
          <ellipse cx="17" cy="9.5" rx="6" ry="2.3" fill="#ffffff" opacity="0.28"/>
          <rect x="10.5" y="11" width="27" height="16" rx="8" fill="#12121e"/>
          <g>
            <circle cx="18.5" cy="19" r="4.6" fill="#f4f4ff"/>
            <circle cx="29.5" cy="19" r="4.6" fill="#f4f4ff"/>
            <g>
              <circle cx="18.5" cy="19" r="2.2" fill="#12121e"/>
              <circle cx="29.5" cy="19" r="2.2" fill="#12121e"/>
              <circle cx="19.4" cy="18" r="0.7" fill="#fff"/>
              <circle cx="30.4" cy="18" r="0.7" fill="#fff"/>
            </g>
          </g>
          ${hat}
        </g>
      </g>
    </g>
  </svg>`;
}

/** Encode the SVG into a CSS-safe `url(...)` value. */
function svgToDataUri(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\n\s*/g, ""))}")`;
}

/** Apply the avatar cursor site-wide. */
export function applyAvatarCursor(avatarId: string) {
  const uri = svgToDataUri(avatarSvg(avatarId));
  document.documentElement.style.cursor = `${uri} 16 0, auto`;
}

/** Remove custom cursor (back to default). */
export function clearAvatarCursor() {
  document.documentElement.style.cursor = "";
}

/** Save cursor preference. `null` = use default pointer. */
export function saveCursorPref(avatarId: string | null) {
  try {
    if (avatarId) {
      localStorage.setItem(CURSOR_KEY, avatarId);
    } else {
      localStorage.removeItem(CURSOR_KEY);
    }
  } catch { /* storage blocked */ }
}

/** Load saved cursor preference (returns avatar id or null). */
export function loadCursorPref(): string | null {
  try {
    return localStorage.getItem(CURSOR_KEY);
  } catch {
    return null;
  }
}

/** If a cursor pref is saved, apply it immediately. Call this once on app mount. */
export function initCursorFromStorage() {
  const pref = loadCursorPref();
  if (pref) applyAvatarCursor(pref);
}
