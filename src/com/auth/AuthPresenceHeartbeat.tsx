"use client";

import { useEffect } from "react";

const HEARTBEAT_INTERVAL_MS = 30_000;

function sendPresence(state: "online" | "offline") {
  const path = `/api/auth/presence?state=${state}`;

  if (state === "offline" && "sendBeacon" in navigator) {
    navigator.sendBeacon(path);
    return;
  }

  fetch(path, {
    method: "POST",
    keepalive: state === "offline",
  }).catch(() => undefined);
}

export default function AuthPresenceHeartbeat() {
  useEffect(() => {
    sendPresence("online");

    const intervalId = window.setInterval(() => {
      sendPresence("online");
    }, HEARTBEAT_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendPresence("online");
      }
    };
    const handlePageHide = () => sendPresence("offline");

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      sendPresence("offline");
    };
  }, []);

  return null;
}
