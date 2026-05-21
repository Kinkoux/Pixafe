export const library = {
  id: 'library',
  name: 'The Library',
  defaultStation: 'vinyl-lounge',
  lightingTint: null,
  seats: [
    { x: 80, y: 130 },
    { x: 120, y: 130 },
    { x: 160, y: 130 },
    { x: 200, y: 130 },
  ],
  drawBackground(ctx /*, t */) {
    // Phase 5 will draw the library. Stub.
    ctx.fillStyle = '#3a2818';
    ctx.fillRect(0, 0, 288, 180);
  },
};
