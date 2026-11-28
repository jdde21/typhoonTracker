import { useContext } from "react";
import { TyphoonDataContext } from '../../App.jsx';

export default function HideUI() {
    const { hidden, setHidden } = useContext(TyphoonDataContext);

    return (
        <button
            onClick={() => setHidden((h) => !h)}
            style={{
                position: "fixed",
                bottom: 16,
                right: 16,
                zIndex: 9999,
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                cursor: "pointer",
                backdropFilter: "blur(6px)",
            }}
        >
            {hidden ? "Show UI" : "Hide UI"}
        </button>
    );
}