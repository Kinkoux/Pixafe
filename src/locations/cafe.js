export const cafe = {
  id: 'cafe',
  name: 'Pixafé Main Cafe',
  defaultStation: 'cafe-buzz',
  lightingTint: null,
  seats: [
    { x: 56, y: 120 },
    { x: 96, y: 120 },
    { x: 136, y: 120 },
    { x: 176, y: 120 },
    { x: 76, y: 150 },
    { x: 116, y: 150 },
    { x: 156, y: 150 },
    { x: 196, y: 150 },
  ],
  drawBackground(ctx /*, t */) {
    // Phase 2 will draw the real pixel cafe. Stub: warm wall band.
    ctx.fillStyle = '#5a3f2c';
    ctx.fillRect(0, 0, 288, 120);
    ctx.fillStyle = '#3a2a1f';
    ctx.fillRect(0, 120, 288, 60);
  },
};
