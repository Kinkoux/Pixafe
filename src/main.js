import { initCanvas } from './render/canvas.js';
import { LOCATIONS } from './locations/_index.js';
import { stationManager } from './audio/stationManager.js';

const sceneCanvas = document.getElementById('scene');
const uiRoot = document.getElementById('ui-root');

initCanvas(sceneCanvas);

const banner = document.createElement('div');
banner.className = 'phase0-banner';
banner.innerHTML = `
  PIXAFÉ
  <small>
    phase 0 scaffold ready · ${LOCATIONS.length} location stubs · ${stationManager.list().length} station stubs
    <br/>warm pixels, good company
  </small>
`;
uiRoot.appendChild(banner);

if (import.meta.hot) {
  import.meta.hot.accept();
}
