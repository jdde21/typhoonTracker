import { useState, useContext } from "react";
import { ChevronLeft, ChevronRight, Folder, Info } from "lucide-react";
import { TyphoonDataContext } from '../App';

const TYPHOONS = [
    {
        id: 1,
        name: "Typhoon Mawar",
        category: "CAT 4",
        catColor: "#e0473e",
        wind: "240 km/h",
        pressure: "935 hPa",
    },
    {
        id: 2,
        name: "Typhoon Bolaven",
        category: "CAT 2",
        catColor: "#c2632f",
        wind: "175 km/h",
        pressure: "960 hPa",
    },
    {
        id: 3,
        name: "Active Cell TD-04",
        category: "DEP",
        catColor: "#3b82f6",
        wind: "55 km/h",
        pressure: "1004 hPa",
        active: true,
    },
    {
        id: 4,
        name: "Typhoon Khanun",
        category: "CAT 3",
        catColor: "#d9772f",
        wind: "195 km/h",
        pressure: "950 hPa",
    },
    {
        id: 5,
        name: "Typhoon Lan",
        category: "CAT 1",
        catColor: "#3f7fd1",
        wind: "120 km/h",
        pressure: "980 hPa",
    },
    {
        id: 6,
        name: "Tropical Storm Doksuri",
        category: "TS",
        catColor: "#5b6478",
        wind: "85 km/h",
        pressure: "995 hPa",
    },
    {
        id: 7,
        name: "Typhoon Lan",
        category: "CAT 1",
        catColor: "#3f7fd1",
        wind: "120 km/h",
        pressure: "980 hPa",
    },
    {
        id: 8,
        name: "Tropical Storm Doksuri",
        category: "TS",
        catColor: "#5b6478",
        wind: "85 km/h",
        pressure: "995 hPa",
    },
];

export default function NeighboringTyphoonsDrawer() {
    const { all_typhoons, setShowNeighbor } = useContext(TyphoonDataContext);
    const [open, setOpen] = useState(true);
    const [selectedId, setSelectedId] = useState(null);

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                zIndex: 30,
                fontFamily: "Inter, system-ui, sans-serif",
                pointerEvents: "none",
            }}
        >
            <style>{`
        .neighboring-typhoons-list {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #1d2032;
        }
        .neighboring-typhoons-list::-webkit-scrollbar {
          width: 8px;
        }
        .neighboring-typhoons-list::-webkit-scrollbar-track {
          background: #1d2032;
          border-radius: 8px;
        }
        .neighboring-typhoons-list::-webkit-scrollbar-thumb {
          background-color: #3b82f6;
          border-radius: 8px;
          border: 2px solid #1d2032;
        }
        .neighboring-typhoons-list::-webkit-scrollbar-thumb:hover {
          background-color: #60a5fa;
        }
      `}</style>
            {/* Drawer */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: open ? "300px" : "0px",
                    pointerEvents: open ? "auto" : "none",
                    background: "#161826",
                    borderRight: open ? "3px solid #3b82f6" : "none",
                    overflow: "hidden",
                    transition: "width 0.28s ease",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div style={{ width: "300px", display: "flex", flexDirection: "column", height: "100%" }}>
                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            padding: "20px 16px 16px 16px",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                    >
                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                            <Folder size={18} color="#9aa0b4" style={{ marginTop: "2px" }} />
                            <div
                                style={{
                                    color: "#e7e9f3",
                                    fontWeight: 700,
                                    fontSize: "13px",
                                    letterSpacing: "0.04em",
                                    lineHeight: 1.4,
                                }}
                            >
                                NEIGHBORING
                                <br />
                                TYPHOONS
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Collapse panel"
                            style={{
                                background: "none",
                                border: "none",
                                color: "#9aa0b4",
                                cursor: "pointer",
                                padding: "4px",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                    </div>

                    {/* List */}
                    <div
                        className="neighboring-typhoons-list"
                        style={{
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            flex: 1,
                            overflowY: "auto",
                            minHeight: 0,
                        }}
                    >
                        {all_typhoons && Object.keys(all_typhoons).map((sid, idx) => {
                            const current_typhoon = all_typhoons[sid];
                            return <div
                                key={idx}
                                onClick={() => {
                                    if (sid == selectedId) {
                                        setSelectedId(null); setShowNeighbor(null);
                                    } else {
                                        setSelectedId(sid); setShowNeighbor(sid);
                                    }}}
                                role="button"
                                tabIndex={0}
                                style={{
                                    background: selectedId === sid ? "#27314f" : "#1d2032",
                                    borderRadius: "10px",
                                    padding: "14px",
                                    borderLeft:
                                        selectedId === sid
                                            ? "3px solid #3b82f6"
                                            : "3px solid transparent",
                                    boxShadow: selectedId === sid ? "0 0 0 1px #3b82f6" : "none",
                                    cursor: "pointer",
                                    transition: "background 0.15s ease, box-shadow 0.15s ease",
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedId !== sid) e.currentTarget.style.background = "#252840";
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedId !== sid) e.currentTarget.style.background = "#1d2032";
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "10px",
                                    }}
                                >
                                    <span style={{ color: "#93c5fd", fontWeight: 600, fontSize: "14px" }}>
                                        {sid}
                                    </span>
                                    <span
                                        style={{
                                            background: "#e0473e",
                                            color: "#fff",
                                            fontSize: "10px",
                                            fontWeight: 700,
                                            letterSpacing: "0.03em",
                                            padding: "3px 8px",
                                            borderRadius: "5px",
                                        }}
                                    >
                                        {"foo"}
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#9aa0b4" }}>
                                    <span>Wind: {"foo"}</span>
                                    <span>Pres: {"foo"}</span>
                                </div>
                            </div>
                        })}
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            borderTop: "1px solid rgba(255,255,255,0.06)",
                            padding: "14px",
                            textAlign: "center",
                            fontSize: "11px",
                            letterSpacing: "0.05em",
                            color: "#6b7088",
                            position: "relative",
                        }}
                    >
                        LIVE MONITORING ACTIVE
                        <div
                            style={{
                                position: "absolute",
                                right: "12px",
                                bottom: "10px",
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                background: "#2a2d40",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Info size={11} color="#9aa0b4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Toggle button when closed */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    aria-label="Expand panel"
                    style={{
                        position: "absolute",
                        top: "20px",
                        left: "0px",
                        background: "#3b82f6",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                        padding: "8px 6px",
                        borderRadius: "0 8px 8px 0",
                        display: "flex",
                        alignItems: "center",
                        pointerEvents: "auto",
                    }}
                >
                    <ChevronRight size={18} />
                </button>
            )}
        </div>
    );
}