import { useState, useRef, useContext, useEffect } from "react";
import { Trash2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { TyphoonDataContext } from '../App';
import { useQuery } from "@tanstack/react-query";
import PriceRangeSlider from "./PriceRangeSlider";


const TYPHOON_AGENCIES = ["Default", "JTWC", "JMA", "CMA", "HKO", "IMD", "KMA"];

export default function RoutePoints() {
    const { setFetching, setTyphoonLocations, setNeighboringTyphoons, setNeighboringTyphoonsNames, setNeighboringTyphoonsAdditionalProperties, database, setDatabase, year_range } = useContext(TyphoonDataContext);
    const typhoon_locations = []


    async function getData(list_coordinates) {
        const url = "http://127.0.0.1:8000/input"
        try {
            setFetching(prev => !prev);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ coordinates: list_coordinates, database, range, neighbors })
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            setFetching(prev => !prev);
            return result
        } catch (error) {
            console.error(error.message);
        }
    }

    async function getNeighbors() {
        const url = "http://127.0.0.1:8000/neighbors"
        try {
            const response = await fetch(url, {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error(error.message);
        }
    }

    async function getNames() {
        const url = "http://127.0.0.1:8000/neighbors_names"
        try {
            const response = await fetch(url, {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error(error.message);
        }
    }

    async function getNeighborsWindSpeedAndPressure() {
        const url = `http://127.0.0.1:8000/neighbors_wind_speed_and_pressure/${database}`
        try {
            const response = await fetch(url, {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error(error.message);
        }
    }

    const [neighbors, setNeighbors] = useState(0);
    const [points, setPoints] = useState([{ lat: "", lng: "", timegap: "" }]);
    const [pos, setPos] = useState({ x: 900, y: 100 });
    const dragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    const handleRangeChange = (year_range) => {
        setRange([year_range.min, year_range.max])
    };

    const onMouseDown = (e) => {
        dragging.current = true;
        offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
        if (!dragging.current) return;
        setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    };

    const onMouseUp = () => {
        dragging.current = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    };

    const addPoint = () => setPoints([...points, { lat: "", lng: "", timegap: "" }]);

    const updatePoint = (i, field, val) => {
        const updated = [...points];
        updated[i] = { ...updated[i], [field]: val };
        setPoints(updated);
    };

    const removePoint = (i) => {
        setPoints(points.filter((_, idx) => idx !== i));
    };

    useEffect(() => {
        if (year_range) {
            const first_year = year_range[database][0];
            const last_year = year_range[database][1]
            setRange([first_year, last_year]);
        }
    }, [year_range, database]);

    const [range, setRange] = useState([0, 0]);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            className="fixed inset-0 pointer-events-none"
            style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
        >
            <div
                style={{
                    left: pos.x,
                    top: pos.y,
                    background: "rgba(30, 34, 40, 0.55)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                }}
                className="absolute pointer-events-auto border border-white/10 rounded-xl w-90 text-white select-none shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
            >
                {/* header — drag handle */}
                <div
                    onMouseDown={onMouseDown}
                    className={`flex justify-between items-center px-5 py-4 ${!collapsed ? "border-b border-white/[0.07]" : ""} cursor-grab active:cursor-grabbing`}
                >
                    <span className="text-[14px] font-medium text-white/90">Route points</span>
                    <button
                        onClick={() => setCollapsed((prev) => !prev)}
                        className="text-white/35 hover:text-white/70 transition-colors"
                        aria-label={collapsed ? "Expand panel" : "Collapse panel"}
                    >
                        {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                </div>

                {!collapsed && (
                    <>
                        <div className="flex flex-row px-5 pt-5 gap-3">
                            {/* Database */}
                            <div className="flex flex-col gap-1.5 flex-2">
                                <label className="text-[10.5px] font-medium tracking-widest text-white/40 uppercase">Database</label>
                                <select
                                    defaultValue={database}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onChange={(e) => setDatabase(e.target.value)}
                                    className="w-full bg-white/[0.04] text-white/85 text-[13px] px-3 py-2 border border-white/[0.09] rounded-md focus:outline-none focus:border-white/25 cursor-pointer appearance-none"
                                >
                                    {TYPHOON_AGENCIES.map((agency, i) => (
                                        <option key={i} value={agency} className="bg-[#1a1e26]">{agency}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Neighbors */}
                            <div className="flex flex-col gap-1.5 flex-1">
                                <label className="text-[10.5px] font-medium tracking-widest text-white/40 uppercase">Neighbors</label>
                                <input
                                    type="number"
                                    onChange={(e) => setNeighbors(Number(e.target.value))}
                                    value={neighbors}
                                    className="w-full bg-white/[0.04] text-white/85 text-[13px] px-3 py-2 border border-white/[0.09] rounded-md focus:outline-none focus:border-white/25"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 w-[90%] mx-auto mt-5">
                            <PriceRangeSlider showLabel width="100%" min={!year_range ? 10 : year_range[database][0]} max={!year_range ? 10 : year_range[database][1]} onChange={handleRangeChange} />
                        </div>

                        {/* scrollable list */}
                        <div className="max-h-90 overflow-y-auto px-5 py-4 flex flex-col gap-4">
                            {points.map((p, i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10.5px] font-medium tracking-widest text-white/40 uppercase">
                                            Point {String(i + 1).padStart(2, "0")}
                                        </p>
                                        {points.length > 1 && (
                                            <button
                                                onClick={() => removePoint(i)}
                                                className="text-white/25 hover:text-red-400/80 transition-colors"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-[1fr_1fr_80px] gap-2 min-w-0">
                                        {["lat", "lng", "timegap"].map((field) => (
                                            <div key={field} className="flex flex-col gap-1.5 min-w-0">
                                                <span className="text-[10px] font-medium tracking-wider text-white/35 uppercase">
                                                    {field === "lat" ? "Latitude" : field === "lng" ? "Longitude" : "Timegap"}
                                                </span>
                                                <input
                                                    type="number"
                                                    placeholder={field === "timegap" ? "0" : "0.000"}
                                                    value={p[field]}
                                                    onChange={(e) => updatePoint(i, field, e.target.value)}
                                                    className="bg-white/[0.04] border border-white/[0.09] rounded-md px-2.5 py-2 text-[13px] w-full outline-none focus:border-white/25 placeholder:text-white/25"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* footer */}
                        <div className="px-5 py-4 border-t border-white/[0.07] flex flex-col gap-3">
                            <button onClick={addPoint} className="text-white/55 hover:text-white/85 text-[13px] flex items-center gap-1.5 transition-colors">
                                <Plus size={14} /> Add new point
                            </button>
                            <button onClick={async () => {
                                let list_coordinates = [];
                                points.forEach((value) => {
                                    const temp = [];
                                    temp.push(Number(value.lat));
                                    temp.push(Number(value.lng));
                                    temp.push(Number(value.timegap));
                                    list_coordinates.push(temp);
                                })
                                // const [list, neighboringTyphoons, neighboringTyphoonsNames, additionalProperties] = await Promise.all([getData(list_coordinates), getNeighbors(), getNames(), getNeighborsWindSpeedAndPressure()]);
                                const list = await getData(list_coordinates);
                                const neighboringTyphoons = await getNeighbors();
                                const neighboringTyphoonsNames = await getNames();
                                const additionalProperties = await getNeighborsWindSpeedAndPressure();

                                let currentHours = 0;
                                list.forEach((value, index) => {
                                    currentHours += value[2]
                                    let location = { id: index + 1, lat: value[0], lng: value[1], name: `${Math.floor(currentHours)} hours` };
                                    typhoon_locations.push(location);
                                })

                                setTyphoonLocations(typhoon_locations);
                                setNeighboringTyphoons(neighboringTyphoons);
                                setNeighboringTyphoonsNames(neighboringTyphoonsNames);
                                setNeighboringTyphoonsAdditionalProperties(additionalProperties);
                                setPoints([{ lat: "", lng: "", timegap: "" }]);
                            }} className="bg-white/90 hover:bg-white text-[#12151b] rounded-md py-2.5 text-[13px] font-medium w-full transition-colors">
                                Submit route
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}