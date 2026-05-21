/**
 * Phase 4 — Pomodoro timer + character reactions + growing plant + status line.
 * Defaults: 25m focus, 5m break, 15m long break after 4 cycles. All configurable.
 * Phase 0 ships the constants only.
 */

export const POMODORO_DEFAULTS = {
  focusMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
};

// Status text auto-derived from pomodoro mode unless user overrides.
export const STATUS_FOR_MODE = {
  focus: 'in flow',
  break: 'on break',
  longBreak: 'taking a long break',
  idle: 'hanging out',
};

export function renderPomodoro(/* root, store */) {
  // Phase 4.
}
