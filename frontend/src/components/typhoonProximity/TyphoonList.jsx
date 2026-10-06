import React from "react";
import '../css/scrollbars.css'

const DEFAULT_LOCATIONS = ["foo", "bar"];

function LocationRow({ sid, onSelect }) {
    console.log(sid)
    return (
        <li>
            <div
                role={onSelect ? "button" : undefined}
                tabIndex={onSelect ? 0 : undefined}
                onClick={onSelect ? () => onSelect(sid) : undefined}
                onKeyDown={
                    onSelect
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onSelect(sid);
                            }
                        }
                        : undefined
                }
                className="flex h-12 items-center rounded-xl border border-white/20 bg-white/10 px-4 transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
                <span className="truncate text-sm font-semibold text-white">{sid}</span>
            </div>
        </li>
    );
}


/**
 * Scrollable list of location names. Shows two rows at a time (each row is h-12
 * with gap-2 between, so 2 * 48px + 8px = 104px = max-h-26), then scrolls.
 *
 * Props:
 *  - locations: [{ id, name }]
 *  - onSelect(location): optional, called when a row is clicked
 */
export default function TyphoonList({ sids = DEFAULT_LOCATIONS, onSelect }) {
    console.log(sids, DEFAULT_LOCATIONS)
    return (
        <>
            <ul className="typhoon-scroll flex max-h-26 w-full flex-col gap-2 overflow-y-auto pr-1">
                {sids.map((sid, idx) => (
                    <LocationRow key={idx} sid={sid} onSelect={onSelect} />
                ))}
            </ul>
        </>
    );
}