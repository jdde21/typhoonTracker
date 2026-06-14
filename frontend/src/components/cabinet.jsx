import { useState, useContext } from "react";
import { TyphoonDataContext } from '../App';

export default function Cabinet({ neighboringTyphoons = [], onSelect }) {
    const { setShowNeighbor, neighboringTyphoonsNames } = useContext(TyphoonDataContext);

    const [filter, setFilter] = useState("all");
    const [expandedSid, setExpandedSid] = useState(null);

    return (
        <div className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden text-sm shadow-sm h-full">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 text-base">🗂</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-100 flex-1">
                    Neighboring Typhoons
                </span>
            </div>

            {/* Rows */}
            <div className="overflow-y-auto flex-1">
                {Object.keys(neighboringTyphoons).length === 0 && (
                    <p className="text-zinc-400 text-xs text-center py-6">No items</p>
                )}
                {Object.keys(neighboringTyphoons).map((sid, idx) => {
                    const tracks = neighboringTyphoons[sid];
                    const name = neighboringTyphoonsNames[sid];
                    const isExpanded = expandedSid === sid;

                    return (
                        <div key={sid ?? idx}>
                            {/* Row */}
                            <div
                                className="flex items-center gap-2.5 px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                                onClick={() => {
                                    setShowNeighbor(isExpanded ? null : sid)
                                    setExpandedSid(isExpanded ? null : sid)}}
                            >
                                <span className="text-zinc-400 text-base shrink-0">🌀</span>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-zinc-800 dark:text-zinc-100 truncate">
                                        {name}
                                    </p>
                                </div>

                                <span className={`text-zinc-400 text-xs transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>›</span>
                            </div>

                            {/* Expanded details */}
                            {isExpanded && (
                                <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
                                    {tracks.map((track, i) => (
                                        <div key={i} className="flex justify-between">
                                            <span>{`Point ${i + 1}`}</span>
                                            <span>[{track[0]}, {track[1]}]</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}