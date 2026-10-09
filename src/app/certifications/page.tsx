import type { Metadata } from "next";
import Certifications from "@/components/Certifications";

export const metadata: Metadata = { title: "Certifications" };

export default function CertificationsPage() {
  return <Certifications />;
}
