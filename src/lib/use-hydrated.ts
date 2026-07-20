"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

/**
 * `false` durante el SSR y la hidratación, `true` una vez en el navegador.
 * Para UI que depende de APIs del navegador (localStorage, matchMedia, zona horaria)
 * y que no puede renderizarse en el servidor sin provocar hydration mismatch.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}