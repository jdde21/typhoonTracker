const BADGE_STYLES = {
    CAT1: { bg: "#f39c12", color: "#fff" },
    CAT2: { bg: "#e67e22", color: "#fff" },
    CAT3: { bg: "#d35400", color: "#fff" },
    CAT4: { bg: "#c0392b", color: "#fff" },
    CAT5: { bg: "#7b241c", color: "#fff" },
    DEP:  { bg: "#1a2560", color: "#8fa8f8" },
    TS:   { bg: "#1a3a5c", color: "#7ab8f5" },
  };
  
  export default function NeighborTyphoonCard({ name, category, wind, pressure }) {
    const badge = BADGE_STYLES[category] ?? BADGE_STYLES["DEP"];
    const label = category.startsWith("CAT")
      ? `CAT ${category.replace("CAT", "")}`
      : category;
  
    return (
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.name}>{name}</span>
          <span style={{ ...styles.badge, background: badge.bg, color: badge.color }}>
            {label}
          </span>
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
    );
  }
  
  const styles = {
    card: {
      background: "#232839",
      border: "0.5px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      padding: "14px 16px",
      minWidth: 180,
      flex: 1,
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
  };
  
  // Usage example:
  // <TyphoonCard name="Typhoon Mawar" category="CAT4" wind={240} pressure={935} />
  // <TyphoonCard name="Typhoon Bolaven" category="CAT2" wind={175} pressure={960} />
  // <TyphoonCard name="Active Cell TD-04" category="DEP" wind={55} pressure={1004} />