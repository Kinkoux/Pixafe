/**
 * Phase 0 placeholder factory. Each station file imports this and exports a stub
 * with the right id/name. Phase 6 swaps the bodies for real Web Audio graphs.
 */
export const stubStation = (id, name) => ({
  id,
  name,
  start(/* ctx, dest */) {
    /* Phase 6 — build node graph here. */
  },
  stop() {
    /* Phase 6 — disconnect + null out nodes here. */
  },
  setVolume(/* v */) {
    /* Phase 6 — apply to station gain node. */
  },
});
