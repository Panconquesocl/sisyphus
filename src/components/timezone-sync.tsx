"use client";

import { useEffect } from "react";
import { setUserTimezone } from "@/app/actions";

/**
 * No renderiza nada. Reporta al servidor la zona horaria del navegador
 * la primera vez, y si el usuario se muda o viaja.
 */
export function TimezoneSync({ stored }: { stored: string | null }) {
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && tz !== stored) setUserTimezone(tz);
  }, [stored]);

  return null;
}