import { useState, useContext } from "react";
import { createPortal } from "react-dom";
import { ChevronUp, ChevronDown } from "lucide-react";
import { TyphoonDataContext } from '../App';

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
          <div style={styles.waypointTitle}>Trajectory waypoints</div>
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
            <span style={styles.chevron}>
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </span>
          </div>
        </div>

        <div style={styles.stats}>
          <div>
            <div style={styles.statLabel}>Wind</div>
            <div style={styles.statValue}>{wind}</div>
          </div>
          <div>
            <div style={styles.statLabel}>Pres</div>
            <div style={styles.statValue}>{pressure}</div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  card: {
    background: "rgba(26, 30, 38, 0.55)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 10,
    padding: "14px 16px",
    minWidth: 180,
    flex: 1,
    transition: "all 0.2s ease",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
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
    color: "rgba(255,255,255,0.9)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
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
  chevron: {
    display: "flex",
    color: "rgba(255,255,255,0.35)",
  },
  stats: {
    display: "flex",
    gap: 20,
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: 500,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.09em",
    marginBottom: 3,
  },
  statValue: {
    fontSize: 15,
    fontWeight: 500,
    color: "rgba(255,255,255,0.85)",
  },
  waypointTitle: {
    fontSize: 10.5,
    fontWeight: 500,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: "0.09em",
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
    color: "rgba(255,255,255,0.45)",
    fontVariantNumeric: "tabular-nums",
    minWidth: 36,
  },
  waypointValue: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "0.01em",
  },
};