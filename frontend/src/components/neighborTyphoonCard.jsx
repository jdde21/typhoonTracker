import { useState, useContext } from "react";
import { createPortal } from "react-dom";
import { TyphoonDataContext } from '../App';

const BADGE_STYLES = {
  CAT1: { bg: "#f39c12", color: "#fff" },
  CAT2: { bg: "#e67e22", color: "#fff" },
  CAT3: { bg: "#d35400", color: "#fff" },
  CAT4: { bg: "#c0392b", color: "#fff" },
  CAT5: { bg: "#7b241c", color: "#fff" },
  DEP:  { bg: "#1a2560", color: "#8fa8f8" },
  TS:   { bg: "#1a3a5c", color: "#7ab8f5" },
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
          background: "#1a1f2e",
          border: "0.5px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          padding: "14px 16px",
          zIndex: 9999,
        }}>
          <div style={styles.waypointTitle}>Trajectory Waypoints</div>
          {tracks.map((track, i) => (
            <div key={i} style={styles.waypointRow}>
              <span style={styles.waypointLabel}>Pt {i + 1}:</span>
              <span style={styles.waypointValue}>
                {track[0]}, {track[1]}
              </span>
            </div>
          ))}
        </div>,
        document.body
      )}

      <div
        ref={setCardRef}
        style={{ ...styles.card, cursor: "pointer" }}
        onClick={() => {
          setShowNeighbor(expanded ? null : sid);
          setExpanded((prev) => !prev);
        }}
      >
        <div style={styles.header}>
          <span style={styles.name}>{name}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ ...styles.badge, background: badge.bg, color: badge.color }}>
              {score.toFixed(2)}
            </span>
            <span style={styles.chevron}>{expanded ? "▲" : "▼"}</span>
          </div>
        </div>

        <div style={styles.stats}>
          <div>
            <div style={styles.statLabel}>Wind</div>
            <div style={styles.statValue}>{wind} km/h</div>
          </div>
          <div>
            <div style={styles.statLabel}>Pres</div>
            <div style={styles.statValue}>{pressure} hPa</div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  card: {
    background: "#1a1f2e",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "14px 16px",
    minWidth: 180,
    flex: 1,
    transition: "all 0.2s ease",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: 500,
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  badge: {
    fontSize: 10,
    fontWeight: 600,
    padding: "3px 8px",
    borderRadius: 4,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  chevron: {
    fontSize: 9,
    color: "rgba(255,255,255,0.4)",
  },
  stats: {
    display: "flex",
    gap: 20,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 3,
  },
  statValue: {
    fontSize: 15,
    fontWeight: 500,
    color: "#e0e6f0",
  },
  waypointTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 10,
  },
  waypointRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    gap: 12,
  },
  waypointLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    fontFamily: "monospace",
    minWidth: 36,
  },
  waypointValue: {
    fontSize: 13,
    color: "#c8d8f0",
    fontFamily: "monospace",
    letterSpacing: "0.03em",
  },
};