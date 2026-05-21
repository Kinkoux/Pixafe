export const home = {
  id: 'home',
  name: 'Home',
  defaultStation: 'rainy-day',
  lightingTint: null,
  seats: [
    { x: 100, y: 130 },
    { x: 160, y: 130 },
  ],
  drawBackground(ctx /*, t */) {
    // Phase 5 will draw the cozy apartment. Stub.
    ctx.fillStyle = '#4a3220';
    ctx.fillRect(0, 0, 288, 180);
  },
};
