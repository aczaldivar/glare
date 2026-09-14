import Link from "next/link";
import { GlareMark } from "@/components/glare-mark";
import { SiteFooter } from "@/components/site-footer";
import {
  LEGAL_DRAFT_DISCLAIMER,
  LEGAL_EFFECTIVE_DATE,
  type LegalDoc,
} from "@/lib/legal";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 pb-10 pt-6 sm:px-8">
      <header className="flex items-center justify-between gap-4">
        <Link href="/" aria-label="Back to Glare Room">
          <GlareMark compact />
        </Link>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          Draft · {LEGAL_EFFECTIVE_DATE}
        </p>
      </header>

      <main className="flex-1 py-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-glare/80">
          {doc.kicker}
        </p>
        <h1 className="mt-3 font-display text-4xl italic text-ink sm:text-5xl">
          {doc.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-muted">{doc.summary}</p>

        <aside className="panel mt-6 rounded-2xl px-4 py-3 text-sm leading-6 text-ember">
          {LEGAL_DRAFT_DISCLAIMER}
        </aside>

        <div className="mt-10 space-y-8">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-2xl italic text-ink">
                {section.heading}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-[15px] leading-7 text-muted">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
