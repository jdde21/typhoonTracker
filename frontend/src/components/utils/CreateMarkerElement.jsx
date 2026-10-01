export function createMarkerElement({
    width = 24,
    height = 32,
    fill = 'rgba(30, 34, 40, 0.85)',
    stroke = 'rgba(255,255,255,0.2)',
    dotFill = 'rgba(255,255,255,0.8)',
  } = {}) {
    const el = document.createElement('div');
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
  
    el.innerHTML = `
      <svg width="${width}" height="${height}" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z"
          fill="${fill}"
          stroke="${stroke}"
          stroke-width="1"
        />
        <circle cx="12" cy="12" r="4" fill="${dotFill}" />
      </svg>
    `;
  
    return el;
  }