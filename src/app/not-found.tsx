import Link from "next/link";
import { GlareMark } from "@/components/glare-mark";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center px-6 text-center">
      <GlareMark />
      <h1 className="mt-8 font-display text-4xl italic text-ink">
        That room doesn&apos;t exist.
      </h1>
      <p className="mt-3 text-muted">
        Room names are 2–32 letters, numbers, or hyphens, and they start with a
        letter.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-glare px-5 py-3 text-sm font-semibold text-[#2a1c0a]"
      >
        Back to Glare Room
      </Link>
      <div className="mt-10 w-full">
        <SiteFooter compact />
      </div>
    </div>
  );
}
