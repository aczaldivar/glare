import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { PRIVACY } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What Glare Room stores in this version: guest names in your browser, ephemeral chat, and abuse reports.",
};

export default function PrivacyPage() {
  return <LegalPage doc={PRIVACY} />;
}
