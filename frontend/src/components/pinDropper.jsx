import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

/**
 * PinDropper
 *
 * Click anywhere on the map to drop a pin. Clicking again moves the pin
 * to the new location. Calls onPinDropped(coords) every time the pin moves.
 *
 * Props:
 * - styleUrl: MapLibre style URL/JSON (default: MapLibre demo style)
 * - center: [lng, lat] initial map center
 * - zoom: initial zoom level
 * - onPinDropped: ({ lng, lat }) => void, called whenever a pin is placed/moved
 */
export default function PinDropper({
  styleUrl = 'https://demotiles.maplibre.org/style.json',
  center = [0, 0],
  zoom = 2,
  onPinDropped = () => {},
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center,
      zoom,
    });
    mapRef.current = map;

    const handleClick = (e) => {
      const { lng, lat } = e.lngLat;

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new maplibregl.Marker({ draggable: true, color: '#e11d48' })
          .setLngLat([lng, lat])
          .addTo(map);

        markerRef.current.on('dragend', () => {
          const pos = markerRef.current.getLngLat();
          setCoords(pos);
          onPinDropped(pos);
        });
      }

      setCoords({ lng, lat });
      onPinDropped({ lng, lat });
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-full min-h-96">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />

      <div className="absolute bottom-3 left-3 z-10 rounded-md bg-white/90 px-3 py-2 text-sm text-gray-800 shadow dark:bg-gray-900/90 dark:text-gray-100">
        {coords ? (
          <span>
            Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
          </span>
        ) : (
          <span>Click the map to drop a pin</span>
        )}
      </div>
    </div>
  );
}