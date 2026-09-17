import Link from "next/link";
import { JoinForm } from "@/components/join-form";
import { GlareMark } from "@/components/glare-mark";
import { RoomPreview } from "@/components/room-preview";
import { SiteFooter } from "@/components/site-footer";
import { SUGGESTED_ROOMS } from "@/lib/constants";
import { SAFETY_BANNER } from "@/lib/legal";
import { roomPath } from "@/lib/rooms";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 pb-10 pt-6 sm:px-8">
      <header className="flex items-center justify-between">
        <GlareMark />
        <Link
          href={roomPath("lobby")}
          className="rounded-full border border-line px-4 py-2 text-xs font-medium tracking-wide text-muted transition hover:border-glare/40 hover:text-ink"
        >
          Open lobby
        </Link>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-x-16 gap-y-10 py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:grid-rows-[auto_auto] lg:items-start lg:py-12">
        <section className="rise-in flex min-h-[calc(100dvh-8.5rem)] flex-col justify-center lg:min-h-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-glare/80">
            Public rooms · live conversation · 13+
          </p>
          <h1 className="mt-5 max-w-xl font-display text-5xl leading-[1.05] text-ink sm:text-7xl">
            Walk in.
            <span className="italic text-glare-hot"> Talk live.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg">
            Glare Room is a public chatroom for the open internet. No accounts.
            Create a room — or join one by name — and share the link. No
            illegal content. We may remove rooms.
          </p>

          <div className="panel mt-8 rounded-[28px] p-5 sm:p-6">
            <JoinForm />
            <div className="mt-6 flex flex-wrap gap-2">
              {SUGGESTED_ROOMS.map((room) => (
                <Link
                  key={room.slug}
                  href={roomPath(room.slug)}
                  title={room.blurb}
                  className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm text-muted transition hover:border-glare/40 hover:text-ink"
                >
                  #{room.slug}
                  <span className="ml-2 hidden text-xs text-muted/70 lg:inline">
                    {room.blurb}
                  </span>
                </Link>
              ))}
              <Link
                href={roomPath("lobby-ep1")}
                title="Demo podcast episode"
                className="inline-flex min-h-11 items-center rounded-full border border-glare/30 px-4 text-sm text-glare transition hover:border-glare/60 hover:text-glare-hot"
              >
                #lobby-ep1
                <span className="ml-2 hidden text-xs text-muted/70 lg:inline">
                  Demo episode
                </span>
              </Link>
              <Link
                href={roomPath("news-ep1")}
                title="Open Tab — Ep. 1: What Stuck"
                className="inline-flex min-h-11 items-center rounded-full border border-glare/30 px-4 text-sm text-glare transition hover:border-glare/60 hover:text-glare-hot"
              >
                #news-ep1
                <span className="ml-2 hidden text-xs text-muted/70 lg:inline">
                  Open Tab Ep. 1
                </span>
              </Link>
            </div>
            <p className="mt-5 text-xs leading-5 text-ember">{SAFETY_BANNER}</p>
          </div>
        </section>

        <RoomPreview />

        <dl className="grid gap-4 text-sm text-muted sm:grid-cols-3 lg:col-start-1">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-glare/70">
              01
            </dt>
            <dd className="mt-1 text-ink">Name a room. The URL is the invite.</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-glare/70">
              02
            </dt>
            <dd className="mt-1 text-ink">Walk in with a display name — or skip it.</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-glare/70">
              03
            </dt>
            <dd className="mt-1 text-ink">Messages land live. Presence shows who&apos;s here.</dd>
          </div>
        </dl>
      </main>

      <SiteFooter />
    </div>
  );
}
