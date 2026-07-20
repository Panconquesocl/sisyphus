"use client";

import { useSyncExternalStore } from "react";
import { localToday } from "@/lib/dates";

// El día local no cambia durante una sesión típica, así que no hay a qué suscribirse.
// (Si algún día quisiéramos manejar el cruce de medianoche, este es el lugar.)
function subscribe() {
  return () => {};
}

function getServerSnapshot() {
  return null;
}

/**
 * Día local del usuario como "YYYY-MM-DD", o `null` mientras se renderiza en
 * el servidor / se hidrata. Los componentes deben tolerar ese `null` inicial.
 */
export function useLocalToday(): string | null {
  return useSyncExternalStore(subscribe, localToday, getServerSnapshot);
}