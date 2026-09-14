import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { TERMS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Plain-language terms for using Glare Room, a public real-time chatroom.",
};

export default function TermsPage() {
  return <LegalPage doc={TERMS} />;
}
