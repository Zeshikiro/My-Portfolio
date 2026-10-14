import type { CSSProperties } from "react";
import { getAvatar, type AvatarStyle } from "@/lib/lounge";

/**
 * Front-facing little robot (big round head, visor eyes, stubby body).
 * Rig parts are driven by CSS variables that Lounge.tsx's spring physics
 * writes each frame (see `.lounge-avatar` in globals.css):
 *   .av-rig   -> waddle / lean / squash & stretch / step bounce
 *   .av-head  -> springy head that lags and wobbles
 *   .av-pupils-> eyes look where the robot is walking
 */
export default function AvatarSprite({
  avatar, className, style,
}: { avatar: string; className?: string; style?: CSSProperties }) {
  const a = getAvatar(avatar);
  return (
    <svg viewBox="0 0 48 64" className={className} style={style} overflow="visible" aria-hidden>
      <ellipse className="av-shadow" cx="24" cy="61" rx="13" ry="3.2" fill="rgba(0,0,0,0.4)" />
      <g className="av-rig">
        {/* legs */}
        <g className="av-leg-l">
          <rect x="16" y="48" width="6.5" height="12" rx="3" fill="#2a2a3c" />
          <rect x="15" y="57" width="8.5" height="3.6" rx="1.8" fill="#1c1c2a" />
        </g>
        <g className="av-leg-r">
          <rect x="25.5" y="48" width="6.5" height="12" rx="3" fill="#2a2a3c" />
          <rect x="24.5" y="57" width="8.5" height="3.6" rx="1.8" fill="#1c1c2a" />
        </g>

        <g className="av-bob">
          {/* arms */}
          <rect className="av-arm av-arm-l" x="8.5" y="35" width="5.5" height="12" rx="2.75" fill={a.shade} />
          <rect className="av-arm av-arm-r" x="34" y="35" width="5.5" height="12" rx="2.75" fill={a.shade} />

          {/* body */}
          <rect x="12.5" y="32.5" width="23" height="19" rx="9" fill={a.body} stroke={a.shade} strokeWidth="1" />
          <rect x="17" y="37.5" width="14" height="9" rx="4.5" fill="#ffffff" opacity="0.16" />
          <circle className="lounge-led" cx="24" cy="42" r="1.7" fill={a.hatColor} />

          {/* neck */}
          <rect x="20.5" y="29.5" width="7" height="5" rx="2" fill="#2a2a3c" />

          {/* head */}
          <g className="av-head">
            <rect x="7" y="5" width="34" height="27" rx="13.5" fill={a.body} stroke={a.shade} strokeWidth="1.2" />
            <ellipse cx="17" cy="9.5" rx="6" ry="2.3" fill="#ffffff" opacity="0.28" />
            {/* visor */}
            <rect x="10.5" y="11" width="27" height="16" rx="8" fill="#12121e" />
            <g className="av-eyes">
              <circle cx="18.5" cy="19" r="4.6" fill="#f4f4ff" />
              <circle cx="29.5" cy="19" r="4.6" fill="#f4f4ff" />
              <g className="av-pupils">
                <circle cx="18.5" cy="19" r="2.2" fill="#12121e" />
                <circle cx="29.5" cy="19" r="2.2" fill="#12121e" />
                <circle cx="19.4" cy="18" r="0.7" fill="#fff" />
                <circle cx="30.4" cy="18" r="0.7" fill="#fff" />
              </g>
            </g>
            <Hat a={a} />
          </g>
        </g>
      </g>
    </svg>
  );
}

function Hat({ a }: { a: AvatarStyle }) {
  switch (a.hat) {
    case "cap":
      return (
        <>
          <path d="M8 14 C8 3 40 3 40 14 Z" fill={a.hatColor} />
          <ellipse cx="24" cy="14" rx="18.5" ry="2.6" fill={a.hatColor} />
          <ellipse cx="24" cy="14" rx="18.5" ry="2.6" fill="#000" opacity="0.18" />
          <circle cx="24" cy="4.2" r="1.4" fill="#fff" opacity="0.7" />
        </>
      );
    case "beanie":
      return (
        <>
          <path d="M7.5 15 C7.5 0.5 40.5 0.5 40.5 15 Z" fill={a.hatColor} />
          <rect x="7" y="12" width="34" height="4.5" rx="2.2" fill="#fff" opacity="0.25" />
          <circle cx="24" cy="1" r="3" fill={a.hatColor} />
        </>
      );
    case "headphones":
      return (
        <>
          <path d="M8 17 C6 -1 42 -1 40 17" stroke={a.hatColor} strokeWidth="2.6" fill="none" />
          <rect x="3.5" y="12.5" width="6.5" height="11" rx="3" fill={a.hatColor} />
          <rect x="38" y="12.5" width="6.5" height="11" rx="3" fill={a.hatColor} />
        </>
      );
    case "bow":
      return (
        <g transform="translate(33 6.5)">
          <path d="M0 0 L-6.5 -4 L-6.5 4 Z M0 0 L6.5 -4 L6.5 4 Z" fill={a.hatColor} />
          <circle cx="0" cy="0" r="2" fill={a.hatColor} stroke="#00000033" strokeWidth="0.6" />
        </g>
      );
    case "crown":
      return (
        <path
          d="M14 7 L15.5 -1 L19.5 3 L24 -3.5 L28.5 3 L32.5 -1 L34 7 Z"
          fill={a.hatColor}
          stroke="#c99a1f"
          strokeWidth="0.8"
        />
      );
    default:
      // No hat: a wobbly antenna instead.
      return (
        <g className="av-antenna">
          <line x1="24" y1="5.5" x2="24" y2="-1" stroke="#2a2a3c" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="24" cy="-2.2" r="2.3" fill={a.hatColor} />
        </g>
      );
  }
}
