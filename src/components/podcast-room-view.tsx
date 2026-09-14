"use client";

import Link from "next/link";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { DeployNotReady } from "@/components/deploy-not-ready";
import { EmbeddedChat } from "@/components/embedded-chat";
import {
  EpisodePlayer,
  PLAYBACK_RATES,
} from "@/components/episode-player";
import { GlareMark } from "@/components/glare-mark";
import { NameChip } from "@/components/name-chip";
import { RoomGate } from "@/components/room-gate";
import { SiteFooter } from "@/components/site-footer";
import { TranscriptPanel } from "@/components/transcript-panel";
import { useIdentity } from "@/hooks/use-identity";
import { useLegalAck } from "@/hooks/use-legal-ack";
import { usePodcastTab } from "@/hooks/use-podcast-tab";
import { useRealtimeConfig } from "@/hooks/use-realtime-config";
import { useRoomChannel } from "@/hooks/use-room-channel";
import type { PodcastEpisode, TranscriptCue } from "@/lib/podcast/types";
import { SAFETY_BANNER } from "@/lib/legal";
import { curatedFileSrc } from "@/lib/podcast/catalog";

const ETHICS_SOFT_NUDGES = [
  "If you’re ahead, mark spoilers.",
  "Disagree with the idea, not the person.",
];

export function PodcastRoomView({ episode }: { episode: PodcastEpisode }) {
  const legal = useLegalAck();
  const config = useRealtimeConfig();

  if (!legal.ready || !config.ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted">
        Warming the room…
      </div>
    );
  }

  if (config.provider === "unconfigured" || config.botGuard === "missing") {
    return <DeployNotReady provider={config.provider} botGuard={config.botGuard} />;
  }

  const needsLegal = !legal.acknowledged;
  const needsHuman = config.botGuard === "turnstile" && !config.verified;
  if (needsLegal || needsHuman) {
    return (
      <RoomGate
        room={episode.roomSlug}
        needsLegal={needsLegal}
        needsHuman={needsHuman}
        turnstileSiteKey={config.turnstileSiteKey}
        onAccept={() => {
          if (needsLegal) legal.acknowledge();
          if (needsHuman) config.markVerified();
        }}
      />
    );
  }

  return <PodcastRoomLive episode={episode} />;
}

function PodcastRoomLive({ episode }: { episode: PodcastEpisode }) {
  const { identity, ready, updateName } = useIdentity();
  const channel = useRoomChannel(episode.roomSlug, identity);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentMs, setCurrentMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [follow, setFollow] = useState(true);
  const [quoteSeed, setQuoteSeed] = useState<{ id: number; text: string } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [mobileTab, selectMobileTab] = usePodcastTab(episode.roomSlug);
  const [playbackRate, setPlaybackRate] = useState(1);
  const fileSrc = curatedFileSrc(episode);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentMs(audio.currentTime * 1000);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onPause);
    };
  }, [fileSrc]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate, fileSrc]);

  function onToggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }

  function onSeek(ms: number) {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Math.min(Math.max(0, ms), episode.durationMs);
    audio.currentTime = next / 1000;
    setCurrentMs(next);
  }

  function onSkip(deltaMs: number) {
    onSeek(currentMs + deltaMs);
  }

  function onCycleRate() {
    const audio = audioRef.current;
    const current = audio?.playbackRate ?? playbackRate;
    const index = PLAYBACK_RATES.indexOf(
      current as (typeof PLAYBACK_RATES)[number],
    );
    const next = PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length];
    if (audio) audio.playbackRate = next;
    setPlaybackRate(next);
  }

  function onQuote(cue: TranscriptCue) {
    setQuoteSeed({ id: Date.now(), text: `“${cue.text}”` });
    selectMobileTab("chat");
  }

  function onMobileTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = mobileTab === "transcript" ? "chat" : "transcript";
    selectMobileTab(next);
    const id =
      next === "chat" ? "podcast-tab-chat" : "podcast-tab-transcript";
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.focus();
    });
  }

  async function shareRoom() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this room link", url);
    }
  }

  function onSaveName(event: FormEvent) {
    event.preventDefault();
    const result = updateName(nameDraft);
    if (result.ok) setEditingName(false);
  }

  const audioEl = fileSrc ? (
    <audio
      ref={audioRef}
      src={fileSrc}
      preload="metadata"
      aria-label={episode.title}
    />
  ) : null;

  if (!ready || !identity) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted">
        {audioEl}
        Warming the room…
      </div>
    );
  }

  const chat = (
    <EmbeddedChat
      room={episode.roomSlug}
      identity={identity}
      messages={channel.messages}
      connection={channel.connection}
      notice={channel.notice}
      send={channel.send}
      quoteSeed={quoteSeed}
      emptyTitle="Read, listen, or both"
      emptyBody="Quote a transcript line if you are citing it. Anyone with the link can walk in."
      emptyHint="Public room. Be decent with the people who walk in."
      placeholder="Quote a line, then add your take"
      helperText="Quote the transcript to cite a line. Public room — be decent."
      softNudges={ETHICS_SOFT_NUDGES}
      onShare={shareRoom}
      copied={copied}
    />
  );

  const transcript = (
    <TranscriptPanel
      cues={episode.transcript}
      currentMs={currentMs}
      follow={follow}
      onFollow={setFollow}
      onSeek={onSeek}
      onQuote={onQuote}
    />
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-[env(safe-area-inset-bottom)] pt-4 sm:px-6">
      {audioEl}

      <header className="panel mb-4 flex flex-col gap-4 rounded-[24px] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <Link href="/" className="shrink-0" aria-label="Back to Glare Room">
          <GlareMark compact />
        </Link>
        <div className="min-w-0 flex-1 sm:text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-muted">
            Podcast room · /r/{episode.roomSlug} · EN
          </p>
          <h1 className="truncate font-display text-3xl italic text-ink sm:text-4xl">
            {episode.title}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <NameChip
            identity={identity}
            editing={editingName}
            nameDraft={nameDraft}
            onNameDraft={setNameDraft}
            onStartEdit={() => {
              setNameDraft(identity.name);
              setEditingName(true);
            }}
            onSave={onSaveName}
          />
          <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-muted">
            {channel.members.length || 1} in chat
          </span>
          <button
            type="button"
            onClick={shareRoom}
            className="min-h-11 rounded-full bg-glare px-4 text-xs font-semibold tracking-wide text-[#2a1c0a] transition hover:bg-glare-hot"
          >
            {copied ? "Copied" : "Share link"}
          </button>
        </div>
      </header>

      {episode.contentWarning ? (
        <p
          role="status"
          className="mb-3 rounded-2xl border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember"
        >
          Content warning: {episode.contentWarning}
        </p>
      ) : null}

      <p className="mb-3 px-1 text-xs leading-5 text-ember">{SAFETY_BANNER}</p>
      <p className="mb-4 px-1 text-xs text-muted">
        Curated episode (rights-clear / in-repo). No user audio or transcript
        uploads. Quote the transcript to cite a line.
      </p>

      <div className="sticky top-2 z-10 mb-4 lg:hidden">
        <EpisodePlayer
          episode={episode}
          currentMs={currentMs}
          playing={playing}
          compact
          disabled={!fileSrc}
          playbackRate={playbackRate}
          onToggle={onToggle}
          onSeek={onSeek}
          onSkip={onSkip}
          onCycleRate={onCycleRate}
        />
      </div>
      <div className="sticky top-2 z-10 mb-4 hidden lg:block">
        <EpisodePlayer
          episode={episode}
          currentMs={currentMs}
          playing={playing}
          disabled={!fileSrc}
          playbackRate={playbackRate}
          onToggle={onToggle}
          onSeek={onSeek}
          onSkip={onSkip}
          onCycleRate={onCycleRate}
        />
      </div>

      <div
        className="mb-3 flex gap-2 lg:hidden"
        role="tablist"
        aria-label="Episode views"
        onKeyDown={onMobileTabKeyDown}
      >
        <button
          type="button"
          role="tab"
          id="podcast-tab-transcript"
          aria-controls="podcast-panel-transcript"
          aria-selected={mobileTab === "transcript"}
          tabIndex={mobileTab === "transcript" ? 0 : -1}
          onClick={() => selectMobileTab("transcript")}
          className={`min-h-11 flex-1 rounded-full border px-4 text-sm ${
            mobileTab === "transcript"
              ? "border-glare/50 text-ink"
              : "border-line text-muted"
          }`}
        >
          Transcript
        </button>
        <button
          type="button"
          role="tab"
          id="podcast-tab-chat"
          aria-controls="podcast-panel-chat"
          aria-selected={mobileTab === "chat"}
          tabIndex={mobileTab === "chat" ? 0 : -1}
          onClick={() => selectMobileTab("chat")}
          className={`min-h-11 flex-1 rounded-full border px-4 text-sm ${
            mobileTab === "chat"
              ? "border-glare/50 text-ink"
              : "border-line text-muted"
          }`}
        >
          Chat
        </button>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 pb-4 lg:grid-cols-[1.2fr_1fr]">
        <div
          id="podcast-panel-transcript"
          role="tabpanel"
          aria-labelledby="podcast-tab-transcript"
          className={`min-h-[50dvh] flex-col ${
            mobileTab === "transcript" ? "flex" : "hidden"
          } lg:flex`}
        >
          {transcript}
        </div>
        <div
          id="podcast-panel-chat"
          role="tabpanel"
          aria-labelledby="podcast-tab-chat"
          className={`min-h-[50dvh] flex-col ${
            mobileTab === "chat" ? "flex" : "hidden"
          } lg:flex`}
        >
          {chat}
        </div>
      </div>

      <SiteFooter compact />
    </div>
  );
}
