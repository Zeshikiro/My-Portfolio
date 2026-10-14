import type { Metadata } from "next";
import LoungeClient from "@/components/lounge/LoungeClient";

export const metadata: Metadata = { title: "Lounge" };

export default function PlayPage() {
  return <LoungeClient />;
}
