import { MAP_SAFE_ZONES } from '../data/mapLocations';
import type { MapRealm } from '../types';

interface MapSafeZonesOverlayProps {
  realm: MapRealm;
  compact?: boolean;
}

/**
 * Crisp vector SVG overlay rendering Green Safe Zones (მწვანე ზონა)
 * around major towns on the map. Uses non-scaling-stroke so borders remain
 * razor-sharp at every zoom level.
 */
export function MapSafeZonesOverlay({
  realm,
  compact = false,
}: MapSafeZonesOverlayProps) {
  const zones = MAP_SAFE_ZONES.filter((z) => z.realm === realm);
  const vbWidth = realm === 'mainland' ? 1300 : 1600;
  const vbHeight = realm === 'mainland' ? 929 : 900;

  return (
    <svg
      viewBox={`0 0 ${vbWidth} ${vbHeight}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      data-testid="map-safe-zones-overlay"
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-[5]"
    >
      <defs>
        <radialGradient id={`safe-zone-grad-${realm}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.30" />
          <stop offset="72%" stopColor="#16a34a" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#15803d" stopOpacity="0.06" />
        </radialGradient>
      </defs>

      {zones.map((zone) => {
        const cx = (zone.cx / 100) * vbWidth;
        const cy = (zone.cy / 100) * vbHeight;
        const rx = (zone.rx / 100) * vbWidth;
        const ry = (zone.ry / 100) * vbHeight;

        return (
          <g key={zone.id}>
            {/* Translucent Green Safe Zone Fill */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={`url(#safe-zone-grad-${realm})`}
            />
            {/* Crisp Outer Dashed Emerald Perimeter */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill="none"
              stroke="#15803d"
              strokeOpacity="0.88"
              strokeWidth={compact ? 1.5 : 2}
              strokeDasharray={compact ? '4 3' : '6 4'}
              vectorEffect="non-scaling-stroke"
            />
            {/* Inner Subtle Highlight Ring */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={Math.max(4, rx - 3)}
              ry={Math.max(4, ry - 3)}
              fill="none"
              stroke="#4ade80"
              strokeOpacity="0.55"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        );
      })}
    </svg>
  );
}
