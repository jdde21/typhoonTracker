import { useState, useContext } from "react";
import { createPortal } from "react-dom";
import { ChevronUp, ChevronDown } from "lucide-react";
import { TyphoonDataContext } from '../../App';
import '../css/neighborTyphoonCard.css'

const BADGE_STYLES = {
  CAT1: { bg: "rgba(243,156,18,0.18)", color: "#f7b955" },
  CAT2: { bg: "rgba(230,126,34,0.18)", color: "#f0954f" },
  CAT3: { bg: "rgba(211,84,0,0.2)", color: "#f0854a" },
  CAT4: { bg: "rgba(192,57,43,0.2)", color: "#f0736b" },
  CAT5: { bg: "rgba(123,36,28,0.28)", color: "#e88b83" },
  DEP:  { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" },
  TS:   { bg: "rgba(243,156,18,0.12)", color: "#f0c67a" },
};

export default function NeighborTyphoonCard({ name, sid, category, wind, pressure, tracks, score }) {
  const [expanded, setExpanded] = useState(false);
  const [cardRef, setCardRef] = useState(null);
  const { setShowNeighbor } = useContext(TyphoonDataContext);

  const badge = BADGE_STYLES[category] ?? BADGE_STYLES["DEP"];
  const label = category.startsWith("CAT")
    ? `CAT ${category.replace("CAT", "")}`
    : category;

  const rect = cardRef?.getBoundingClientRect();

  return (
    <>
      {expanded && rect && createPortal(
        <div style={{
          position: "fixed",
          bottom: window.innerHeight - rect.top + 4,
          left: rect.left,
          width: rect.width,
          background: "rgba(26, 30, 38, 0.6)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 10,
          padding: "14px 16px",
          zIndex: 9999,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}>
          <div className="waypoint-card__waypoint-title">Trajectory waypoints</div>
          {tracks.map((track, i) => (
            <div key={i} className="waypoint-card__waypoint-row">
              <span className="waypoint-card__waypoint-label">Pt {i + 1}:</span>
              <span className="waypoint-card__waypoint-value">
                {track[0]}, {track[1]}
              </span>
            </div>
          ))}
        </div>,
        document.body
      )}

      <div
        ref={setCardRef}
        className="waypoint-card waypoint-card--clickable"
        onClick={() => {
          if (!expanded) {
            setShowNeighbor(prev => [sid, ...prev]);
          } else {
            setShowNeighbor(prev => prev.filter(item => item !== sid));
          }
          setExpanded((prev) => !prev);
        }}
      >
        <div className="waypoint-card__header">
          <span className="waypoint-card__name">{name}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ ...styles.badge, background: badge.bg, color: badge.color }}>
              {score.toFixed(2)}
            </span>
            <span className="waypoint-card__chevron">
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </span>
          </div>
        </div>

        <div className="waypoint-card__stats">
          <div>
            <div className="waypoint-card__stat-label">Wind</div>
            <div className="waypoint-card__stat-value">{wind}</div>
          </div>
          <div>
            <div className="waypoint-card__stat-label">Pres</div>
            <div className="waypoint-card__stat-value">{pressure}</div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  badge: {
    fontSize: 10,
    fontWeight: 500,
    padding: "3px 8px",
    borderRadius: 4,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
};