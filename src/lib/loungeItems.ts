// Interactable furniture in the lounge. Coordinates are world units (see WORLD in lounge.ts)
// and match the positions drawn in RoomDecor.tsx.
//
// Input-agnostic by design: an interaction is just "walk to `spot`, then run `action`".
// Mouse clicks, taps, keyboard (E near an item) or a future mobile joystick/action button
// all go through the same path in Lounge.tsx.

export type ItemAction = "clock" | "window" | "sit" | "plant" | "server" | "coffee" | "poster" | "neon" | "exit";

export type Interactable = {
  id: string;
  label: string;
  hint: string;
  action: ItemAction;
  /** Clickable area (world units). Kept generous so it's easy to hit with a finger later. */
  hit: { x: number; y: number; w: number; h: number };
  /** Where the avatar walks to before interacting. */
  spot: { x: number; y: number };
  /** Broadcast to others so they see the effect (plant rustle, rack flash...). */
  shared?: boolean;
};

export const ITEMS: Interactable[] = [
  { id: "clock", label: "Wall clock", hint: "Switch day / night", action: "clock",
    hit: { x: 772, y: 40, w: 72, h: 72 }, spot: { x: 808, y: 228 } },
  { id: "window", label: "Window", hint: "Peek outside", action: "window",
    hit: { x: 60, y: 28, w: 200, h: 122 }, spot: { x: 160, y: 228 } },
  { id: "neon", label: "Neon sign", hint: "Tap the sign", action: "neon", shared: true,
    hit: { x: 340, y: 40, w: 320, h: 80 }, spot: { x: 500, y: 228 } },
  { id: "poster", label: "Poster", hint: "Read a fun fact", action: "poster",
    hit: { x: 688, y: 42, w: 76, h: 100 }, spot: { x: 726, y: 228 } },
  { id: "server", label: "Server rack", hint: "Run a query", action: "server", shared: true,
    hit: { x: 852, y: 30, w: 100, h: 180 }, spot: { x: 880, y: 236 } },
  { id: "plant1", label: "Plant", hint: "Water it", action: "plant", shared: true,
    hit: { x: 278, y: 112, w: 64, h: 104 }, spot: { x: 310, y: 232 } },
  { id: "plant2", label: "Plant", hint: "Water it", action: "plant", shared: true,
    hit: { x: 912, y: 512, w: 72, h: 108 }, spot: { x: 900, y: 590 } },
  { id: "coffee", label: "Coffee table", hint: "Grab a coffee", action: "coffee", shared: true,
    hit: { x: 436, y: 372, w: 128, h: 68 }, spot: { x: 500, y: 456 } },
  { id: "sofa", label: "Sofa", hint: "Sit down", action: "sit",
    hit: { x: 46, y: 296, w: 108, h: 204 }, spot: { x: 104, y: 418 } },
  { id: "beanbag1", label: "Bean bag", hint: "Sit down", action: "sit",
    hit: { x: 716, y: 456, w: 92, h: 70 }, spot: { x: 762, y: 512 } },
  { id: "beanbag2", label: "Bean bag", hint: "Sit down", action: "sit",
    hit: { x: 208, y: 506, w: 92, h: 70 }, spot: { x: 254, y: 562 } },
  { id: "exit", label: "Exit door", hint: "Leave the lounge", action: "exit",
    hit: { x: 440, y: 200, w: 120, h: 190 }, spot: { x: 500, y: 400 } },
];

export const ITEM_BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

/** Random facts shown by the poster. */
export const FUN_FACTS = [
  "John built and troubleshot a full system unit from scratch on Sept 30, 2026.",
  "John's main lane is databases: MySQL, relational design and SQL querying.",
  "John daily-drives Linux (Ubuntu) and lives in the command line.",
  "John volunteers as Visual Media crew at his church.",
  "John led cadets in ROTC and was praised for quick critical thinking.",
  "This lounge runs on Next.js + Supabase Realtime, no game engine needed.",
  "John uses AI-assisted development and prompt engineering in his workflow.",
  "The robots here are pure SVG + CSS, animated with a tiny spring-physics loop.",
];
