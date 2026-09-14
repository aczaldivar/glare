import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { GUIDELINES } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description:
    "How to use Glare Room: no illegal content, no harassment, public rooms, and how to report harm.",
};

export default function GuidelinesPage() {
  return <LegalPage doc={GUIDELINES} />;
}
