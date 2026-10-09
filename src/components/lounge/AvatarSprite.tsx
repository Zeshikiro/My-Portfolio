import { getAvatar, type AvatarStyle } from "@/lib/lounge";

/**
 * Side-view character, facing right. Walking/idle animations and left/right
 * flipping are driven by CSS (see `.lounge-avatar` in globals.css) via the
 * `data-moving` / `data-dir` attributes on an ancestor.
 */
export default function AvatarSprite({ avatar, className }: { avatar: string; className?: string }) {
  const a = getAvatar(avatar);
  return (
    <svg viewBox="0 0 48 64" className={className} overflow="visible" aria-hidden>
      <ellipse className="av-shadow" cx="24" cy="61" rx="12" ry="3.2" fill="rgba(0,0,0,0.4)" />
      <g className="av-flip">
        <g className="av-bob">
          {/* back arm */}
          <rect className="av-arm av-arm-back" x="27" y="33" width="5" height="13" rx="2.5" fill={a.shade} />
          {/* legs */}
          <rect className="av-leg av-leg-back" x="25" y="46" width="6" height="14" rx="3" fill="#20202e" />
          <rect className="av-leg av-leg-front" x="17" y="46" width="6" height="14" rx="3" fill="#2c2c40" />
          {/* body */}
          <rect x="14" y="31" width="20" height="19" rx="7" fill={a.body} />
          <rect x="14" y="44" width="20" height="4" fill={a.shade} opacity="0.6" />
          {/* front arm */}
          <rect className="av-arm av-arm-front" x="16" y="33" width="5" height="13" rx="2.5" fill={a.body} stroke={a.shade} strokeWidth="1" />
          {/* head */}
          <circle cx="24" cy="19" r="12" fill="#ffd9b8" />
          <Hair a={a} />
          {/* face (looking right) */}
          <circle cx="27.5" cy="20" r="1.7" fill="#1a1a2e" />
          <circle cx="32.5" cy="20" r="1.7" fill="#1a1a2e" />
          <circle cx="28" cy="19.4" r="0.5" fill="#fff" />
          <circle cx="33" cy="19.4" r="0.5" fill="#fff" />
          <ellipse cx="25.5" cy="24" rx="2" ry="1.2" fill="#ff9aa8" opacity="0.6" />
          <path d="M29 25.2 q1.8 1.4 3.6 0" stroke="#7a3b2e" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <Hat a={a} />
        </g>
      </g>
    </svg>
  );
}

function Hair({ a }: { a: AvatarStyle }) {
  if (a.hat === "beanie" || a.hat === "cap") return null;
  return (
    <>
      <path d="M12 19 C11 9 18 6 24 6 C31 6 37 10 36 17 C32 13 27 12.5 22 13 C18 13.5 15 15.5 12 19 Z" fill={a.hair} />
      {a.hat === "bow" && <path d="M12 18 C10 24 11 30 13 33 L16 32 C14 28 14 23 15 19 Z" fill={a.hair} />}
    </>
  );
}

function Hat({ a }: { a: AvatarStyle }) {
  switch (a.hat) {
    case "cap":
      return (
        <>
          <path d="M12 17 C12 9 18 5.5 24 5.5 C30 5.5 36 9 36 15 Z" fill={a.hatColor} />
          <rect x="30" y="13" width="11" height="3.2" rx="1.6" fill={a.hatColor} />
          <circle cx="24" cy="6" r="1.4" fill="#fff" opacity="0.7" />
        </>
      );
    case "beanie":
      return (
        <>
          <path d="M11.5 18 C11.5 8.5 17 4.5 24 4.5 C31 4.5 36.5 8.5 36.5 18 Z" fill={a.hatColor} />
          <rect x="11" y="15" width="26" height="4.5" rx="2.2" fill="#fff" opacity="0.25" />
          <circle cx="24" cy="4" r="2.8" fill={a.hatColor} />
        </>
      );
    case "headphones":
      return (
        <>
          <path d="M13 19 C12 6 36 6 35 19" stroke={a.hatColor} strokeWidth="2.6" fill="none" />
          <rect x="17" y="15.5" width="6" height="9" rx="2.5" fill={a.hatColor} />
        </>
      );
    case "bow":
      return (
        <g transform="translate(17 7)">
          <path d="M0 0 L-6 -3.5 L-6 3.5 Z M0 0 L6 -3.5 L6 3.5 Z" fill={a.hatColor} />
          <circle cx="0" cy="0" r="1.8" fill={a.hatColor} stroke="#00000033" strokeWidth="0.6" />
        </g>
      );
    case "crown":
      return <path d="M15 9 L16.5 1.5 L20.5 5.5 L24 -0.5 L27.5 5.5 L31.5 1.5 L33 9 Z" fill={a.hatColor} stroke="#c99a1f" strokeWidth="0.8" />;
    default:
      return null;
  }
}
