"use client";

import { useEffect } from "react";

export default function RecoveryRedirect() {
  useEffect(() => {
    if (window.location.pathname === "/auth/reset-password") return;

    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));

    if (params.get("type") === "recovery" && params.has("access_token")) {
      window.location.replace(`/auth/reset-password${hash}`);
    }
  }, []);

  return null;
}
