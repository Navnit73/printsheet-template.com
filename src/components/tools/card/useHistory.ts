"use client";

import { useCallback, useReducer, useRef } from "react";

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

type Action<T> =
  | { type: "push"; updater: (prev: T) => T }
  | { type: "replace"; updater: (prev: T) => T }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; next: T };

const LIMIT = 100;

function reducer<T>(s: HistoryState<T>, a: Action<T>): HistoryState<T> {
  switch (a.type) {
    case "push": {
      const next = a.updater(s.present);
      if (Object.is(next, s.present)) return s;
      return { past: [...s.past.slice(-(LIMIT - 1)), s.present], present: next, future: [] };
    }
    case "replace": {
      const next = a.updater(s.present);
      return Object.is(next, s.present) ? s : { ...s, present: next };
    }
    case "undo":
      if (!s.past.length) return s;
      return { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] };
    case "redo":
      if (!s.future.length) return s;
      return { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) };
    case "reset":
      return { past: [], present: a.next, future: [] };
  }
}

/**
 * Undo / redo state. `set` with the same `groupKey` as the previous call (and, for
 * non-drag keys, within 800 ms) folds into one undo step, so a drag or a burst of
 * typing is a single Ctrl+Z.
 */
export function useHistory<T>(initial: T) {
  const [state, dispatch] = useReducer(reducer<T>, { past: [], present: initial, future: [] });
  const last = useRef<{ key: string; at: number } | null>(null);

  const set = useCallback((updater: (prev: T) => T, groupKey?: string) => {
    const now = Date.now();
    const grouped =
      !!groupKey &&
      last.current?.key === groupKey &&
      (groupKey.startsWith("drag") || now - last.current.at < 800);
    last.current = groupKey ? { key: groupKey, at: now } : null;
    dispatch({ type: grouped ? "replace" : "push", updater });
  }, []);

  return {
    present: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    set,
    undo: useCallback(() => {
      last.current = null;
      dispatch({ type: "undo" });
    }, []),
    redo: useCallback(() => {
      last.current = null;
      dispatch({ type: "redo" });
    }, []),
    reset: useCallback((next: T) => {
      last.current = null;
      dispatch({ type: "reset", next });
    }, []),
    /** Change the current state without adding an undo step (e.g. a generated QR image arriving). */
    patchSilently: useCallback((updater: (prev: T) => T) => dispatch({ type: "replace", updater }), []),
  };
}
