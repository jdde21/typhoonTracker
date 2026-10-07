import React from "react";
import '../css/scrollbars.css'

const DEFAULT_LOCATIONS = ["foo", "bar"];

function LocationRow({ sid, setShowTyphoonPerimeter }) {

    return (
        <li>
            <div
                onClick={() => {setShowTyphoonPerimeter(sid)}}
                className="flex h-12 items-center rounded-xl border border-white/20 bg-white/10 px-4 transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
                <span className="truncate text-sm font-semibold text-white">{sid}</span>
            </div>
        </li>
    );
}


export default function TyphoonList({ sids = DEFAULT_LOCATIONS, setShowTyphoonPerimeter }) {
    return (
        <>
            <ul className="typhoon-scroll flex max-h-26 w-full flex-col gap-2 overflow-y-auto pr-1">
                {sids.map((sid, idx) => (
                    <LocationRow key={idx} sid={sid} setShowTyphoonPerimeter={setShowTyphoonPerimeter} />
                ))}
            </ul>
        </>
    );
}