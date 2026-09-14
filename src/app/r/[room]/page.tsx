import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RoomView } from "@/components/room-view";
import { PodcastRoomView } from "@/components/podcast-room-view";
import { APP_NAME } from "@/lib/constants";
import { getPodcastEpisode } from "@/lib/podcast/catalog";
import { isValidRoomSlug, roomDisplayName, slugifyRoom } from "@/lib/rooms";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ room: string }>;
}): Promise<Metadata> {
  const { room } = await params;
  const slug = slugifyRoom(room);
  if (!isValidRoomSlug(slug)) {
    return { title: "Room not found" };
  }
  const episode = getPodcastEpisode(slug);
  if (episode) {
    return {
      title: episode.title,
      description: `${episode.title} on ${APP_NAME}. Listen, read the transcript, and talk live — no account required.`,
    };
  }
  const name = roomDisplayName(slug);
  return {
    title: name,
    description: `Join ${name} on ${APP_NAME}. Public live chat — no account required.`,
  };
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ room: string }>;
}) {
  const { room } = await params;
  const slug = slugifyRoom(decodeURIComponent(room));
  if (!isValidRoomSlug(slug)) notFound();
  if (slug !== room) redirect(`/r/${slug}`);
  const episode = getPodcastEpisode(slug);
  if (episode) {
    return <PodcastRoomView key={slug} episode={episode} />;
  }
  return <RoomView key={slug} room={slug} />;
}
