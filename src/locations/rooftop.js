export const rooftop = {
  id: 'rooftop',
  name: 'Rooftop Garden',
  defaultStation: 'ocean-tide',
  lightingTint: null,
  seats: [
    { x: 70, y: 130 },
    { x: 110, y: 130 },
    { x: 150, y: 130 },
    { x: 190, y: 130 },
  ],
  drawBackground(ctx /*, t */) {
    // Phase 5 will draw the rooftop. Stub: dusky sky gradient.
    const g = ctx.createLinearGradient(0, 0, 0, 180);
    g.addColorStop(0, '#3a2a4a');
    g.addColorStop(1, '#e89a4a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 288, 180);
  },
};
