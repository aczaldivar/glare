"use client";

import { useCallback, useEffect, useState } from "react";
import type { BotGuardMode, RealtimeConfig, RealtimeProvider } from "@/lib/realtime/types";

export function useRealtimeConfig() {
  const [ready, setReady] = useState(false);
  const [provider, setProvider] = useState<RealtimeProvider | null>(null);
  const [botGuard, setBotGuard] = useState<BotGuardMode>("off");
  const [verified, setVerified] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/realtime/config")
      .then((res) => res.json())
      .then((data: Partial<RealtimeConfig>) => {
        if (cancelled) return;
        setProvider(data.provider ?? "unconfigured");
        setBotGuard(data.botGuard ?? "off");
        setVerified(Boolean(data.verified));
        setTurnstileSiteKey(data.turnstileSiteKey ?? null);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setProvider("unconfigured");
          setBotGuard("off");
          setVerified(false);
          setTurnstileSiteKey(null);
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const markVerified = useCallback(() => {
    setVerified(true);
  }, []);

  return {
    ready,
    provider,
    botGuard,
    verified,
    turnstileSiteKey,
    markVerified,
  };
}
