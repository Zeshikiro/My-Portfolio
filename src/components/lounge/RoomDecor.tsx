import { memo, type CSSProperties, type ReactNode } from "react";
import { WORLD } from "@/lib/lounge";

/** Positions a piece of decor in world units. `z` defaults to its bottom edge for depth sorting. */
function Item({
  x, y, w, h, z, className = "", style, children,
}: {
  x: number; y: number; w: number; h: number; z?: number;
  className?: string; style?: CSSProperties; children?: ReactNode;
}) {
  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        left: `${(x / WORLD.w) * 100}%`,
        top: `${(y / WORLD.h) * 100}%`,
        width: `${(w / WORLD.w) * 100}%`,
        height: `${(h / WORLD.h) * 100}%`,
        zIndex: z ?? Math.round(y + h),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const STARS = [
  [12, 18], [30, 40], [48, 12], [70, 30], [86, 16], [22, 64], [58, 52], [92, 58], [40, 78], [76, 72],
];

function RoomDecor() {
  return (
    <>
      {/* Back wall */}
      <Item
        x={0} y={0} w={1000} h={WORLD.wall} z={0}
        style={{
          background:
            "repeating-linear-gradient(90deg, transparent 0 79px, rgba(255,255,255,0.025) 79px 80px), linear-gradient(180deg, #17172b 0%, #1c1c36 100%)",
        }}
      />
      <Item x={0} y={WORLD.wall - 6} w={1000} h={8} z={1} style={{ background: "linear-gradient(90deg, #6c63ff55, #00d4aa55)" }} />

      {/* Floor */}
      <Item
        x={0} y={WORLD.wall + 2} w={1000} h={WORLD.h - WORLD.wall} z={0}
        style={{
          background:
            "repeating-linear-gradient(180deg, transparent 0 7.6%, rgba(0,0,0,0.25) 7.6% 7.9%), repeating-linear-gradient(90deg, transparent 0 15%, rgba(255,255,255,0.025) 15% 15.2%), linear-gradient(180deg, #1a1622 0%, #14121b 100%)",
        }}
      />

      {/* Window with night sky */}
      <Item x={60} y={28} w={200} h={122} z={1} className="rounded-[6%] border-[3px] border-[#2e2e4a] overflow-hidden"
        style={{ background: "linear-gradient(180deg, #0b1030 0%, #23184a 70%, #3a1f4d 100%)" }}>
        {STARS.map(([l, t], i) => (
          <span key={i} className="absolute w-[2px] h-[2px] rounded-full bg-white lounge-led"
            style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${i * 0.37}s`, animationDuration: `${2 + (i % 3)}s` }} />
        ))}
        <span className="absolute right-[12%] top-[14%] w-[18%] aspect-square rounded-full bg-[#f5f1d0] shadow-[0_0_18px_#f5f1d088]" />
        <span className="absolute bottom-0 left-0 right-0 h-[28%]"
          style={{ background: "linear-gradient(0deg,#0d0d18 0 40%,transparent 40%), repeating-linear-gradient(90deg,#11111f 0 9%,#191930 9% 15%,#0f0f1c 15% 26%,transparent 26% 29%)" }} />
        <span className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-[#2e2e4a]" />
        <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-[#2e2e4a]" />
      </Item>

      {/* Neon sign */}
      <Item x={330} y={38} w={340} h={84} z={1} className="flex items-center justify-center">
        <span
          className="lounge-neon font-heading font-bold tracking-wide text-[clamp(14px,4.2cqw,46px)] leading-none"
          style={{
            color: "#f3f0ff",
            textShadow: "0 0 6px #6c63ff, 0 0 14px #6c63ff, 0 0 28px #00d4aa88",
          }}
        >
          the lounge
        </span>
      </Item>
      <Item x={380} y={126} w={240} h={18} z={1} className="flex items-center justify-center">
        <span className="font-mono text-[clamp(6px,1.1cqw,12px)] text-[#8888a0]">LISTEN lounge; -- say hi 👋</span>
      </Item>

      {/* Poster */}
      <Item x={690} y={44} w={72} h={96} z={1} className="rounded-[6%] border-2 border-[#2e2e4a] bg-[#101020] flex flex-col items-center justify-center gap-[6%] p-[6%]">
        <span className="w-[60%] aspect-square rounded-full bg-gradient-primary opacity-80" />
        <span className="font-mono text-[clamp(4px,0.8cqw,9px)] text-[#a29bfe] text-center leading-tight">SELECT *<br />FROM fun;</span>
      </Item>

      {/* Clock */}
      <Item x={786} y={52} w={44} h={44} z={1} className="rounded-full border-2 border-[#3a3a5c] bg-[#151528]">
        <span className="absolute left-1/2 top-[18%] w-[2px] h-[34%] -translate-x-1/2 bg-[#e8e8e8] origin-bottom" />
        <span className="absolute left-1/2 top-1/2 w-[30%] h-[2px] bg-[#00d4aa] origin-left rotate-[30deg]" />
      </Item>

      {/* Server rack (a small nod to the database theme) */}
      <Item x={856} y={34} w={92} h={172} className="rounded-[8%] bg-[#0e0e18] border-2 border-[#2a2a42] p-[8%] flex flex-col gap-[6%]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-1 rounded-sm bg-[#181828] border border-[#25253a] flex items-center gap-[8%] px-[10%]">
            <span className="lounge-led w-[9%] aspect-square rounded-full"
              style={{ background: i % 3 === 0 ? "#00d4aa" : i % 3 === 1 ? "#6c63ff" : "#ff6b9d", animationDelay: `${i * 0.23}s`, animationDuration: `${1.1 + (i % 4) * 0.35}s` }} />
            <span className="lounge-led w-[9%] aspect-square rounded-full bg-[#00d4aa]" style={{ animationDelay: `${i * 0.41}s` }} />
            <span className="flex-1 h-[2px] bg-[#2a2a42]" />
          </div>
        ))}
        <span className="text-center font-mono text-[clamp(4px,0.8cqw,9px)] text-[#555570]">jrn_db</span>
      </Item>

      {/* Plant by the window */}
      <Plant x={282} y={118} w={56} h={96} />

      {/* Rug */}
      <Item x={290} y={322} w={420} h={176} z={2} className="rounded-[50%]"
        style={{
          background:
            "radial-gradient(ellipse at center, #2a2350 0 45%, #3a2f6e 45% 49%, #241e44 49% 70%, #6c63ff55 70% 72%, #1f1a3a 72%)",
          boxShadow: "inset 0 0 0 2px #00000033",
        }}
      />

      {/* Coffee table */}
      <Item x={440} y={378} w={120} h={58} className="flex flex-col items-center">
        <div className="w-full h-[55%] rounded-[40%] bg-[#3b2d24] border-2 border-[#4d3b2f] shadow-[0_6px_0_#2a2019] relative">
          <span className="absolute left-[28%] top-[18%] w-[13%] h-[52%] rounded-sm bg-[#e8e8e8]" />
          <span className="absolute left-[56%] top-[24%] w-[22%] h-[42%] rounded-sm bg-[#6c63ff]" />
        </div>
        <div className="flex justify-between w-[70%] flex-1">
          <span className="w-[8%] h-full bg-[#2a2019]" />
          <span className="w-[8%] h-full bg-[#2a2019]" />
        </div>
      </Item>

      {/* Sofa on the left wall */}
      <Item x={50} y={300} w={100} h={196}>
        <div className="absolute inset-0 rounded-[18%] bg-[#3c3570] shadow-[0_8px_0_#26214a]" />
        <div className="absolute left-0 top-0 bottom-0 w-[34%] rounded-l-[30%] rounded-r-[14%] bg-[#4a4290]" />
        <div className="absolute left-[34%] right-[6%] top-[12%] h-[37%] rounded-[16%] bg-[#544ba3]" />
        <div className="absolute left-[34%] right-[6%] bottom-[12%] h-[37%] rounded-[16%] bg-[#544ba3]" />
        <div className="absolute left-0 right-0 top-0 h-[10%] rounded-t-[50%] bg-[#4a4290]" />
        <div className="absolute left-0 right-0 bottom-0 h-[10%] rounded-b-[50%] bg-[#4a4290]" />
        <div className="absolute left-[46%] top-[20%] w-[34%] h-[18%] rounded-[30%] bg-[#00d4aa] opacity-80 rotate-[-12deg]" />
      </Item>

      {/* Bean bags */}
      <BeanBag x={720} y={462} color="#ff6b9d" shade="#c94a77" />
      <BeanBag x={212} y={512} color="#00d4aa" shade="#00a184" />

      {/* Corner plant */}
      <Plant x={918} y={518} w={60} h={100} />

      {/* Welcome mat at the "door" (spawn point) */}
      <Item x={430} y={580} w={140} h={34} z={2} className="rounded-md bg-[#2a2440] border border-[#3a3360] flex items-center justify-center">
        <span className="font-mono text-[clamp(5px,1cqw,11px)] tracking-[0.2em] text-[#8888a0]">WELCOME</span>
      </Item>
    </>
  );
}

function Plant({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <Item x={x} y={y} w={w} h={h}>
      <span className="absolute left-[8%] top-[4%] w-[52%] h-[46%] rounded-full bg-[#1f7a5a]" />
      <span className="absolute right-[4%] top-[12%] w-[50%] h-[42%] rounded-full bg-[#27936c]" />
      <span className="absolute left-[24%] top-0 w-[48%] h-[38%] rounded-full bg-[#2fae80]" />
      <span className="absolute left-[18%] right-[18%] bottom-0 h-[44%] rounded-b-[30%] rounded-t-md bg-[#8a5a3c] border-t-4 border-[#a36d4a]" />
    </Item>
  );
}

function BeanBag({ x, y, color, shade }: { x: number; y: number; color: string; shade: string }) {
  return (
    <Item x={x} y={y} w={84} h={62}>
      <span className="absolute inset-x-0 bottom-0 h-[78%] rounded-[50%_50%_44%_44%]"
        style={{ background: `radial-gradient(ellipse at 40% 30%, ${color} 0 40%, ${shade} 100%)` }} />
      <span className="absolute left-[22%] top-[6%] w-[56%] h-[40%] rounded-full" style={{ background: color }} />
    </Item>
  );
}

export default memo(RoomDecor);
