import { getAutoTrackData, getNeighbors, getNames, getNeighborsWindSpeedAndPressure, getData } from "../api/typhoons.js";
import { Trash2, ChevronDown, ChevronUp, Plus, Radar, MapPin, Clock } from "lucide-react";
import { useState, useRef, useContext, useEffect } from "react";
import PriceRangeSlider from "./PriceRangeSlider";
import { TyphoonDataContext } from '../App';
import "./scrollbars.css";


const TYPHOON_AGENCIES = ["Default", "JTWC", "JMA", "CMA", "HKO", "IMD", "KMA"];
const MODELS = ["Per-point", "Nearest centroid", "Random forest"];

export default function RoutePoints() {
    const { setFetching, setTyphoonLocations, setNeighboringTyphoons,
        setNeighboringTyphoonsNames, setNeighboringTyphoonsAdditionalProperties,
        database, setDatabase, year_range, get_live_typhoons_names, model, setModel } = useContext(TyphoonDataContext);

    const [mode, setMode] = useState("manual");
    const [neighbors, setNeighbors] = useState(0);
    const [points, setPoints] = useState([{ lat: "", lng: "", timegap: "" }]);
    const [pos, setPos] = useState({ x: 900, y: 100 });
    const dragging = useRef(false);
    const offset = useRef({ x: 0, y: 0 });
    const [neighborsError, setNeighborsError] = useState(false);

    // automatic mode state
    const [autoTracking, setAutoTracking] = useState(false);
    const [autoPreview, setAutoPreview] = useState([]);

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

    const updateNeighbors = (e) => {
        const number_of_neighbors = Number(e.target.value);

        if (number_of_neighbors > 0) setNeighbors(number_of_neighbors);
    }

    useEffect(() => {
        if (year_range) {
            const first_year = year_range[database][0];
            const last_year = year_range[database][1]
            setRange([first_year, last_year]);
        }
    }, [year_range, database]);

    const [range, setRange] = useState([0, 0]);
    const [collapsed, setCollapsed] = useState(false);

    async function applyResult(list) {
        let currentHours = 0;
        const locations = [];
        list.forEach((value, index) => {
            currentHours += value[2]
            let location = { id: index + 1, lat: value[0], lng: value[1], name: `${Math.floor(currentHours)} hours` };
            locations.push(location);
        })

        const neighboringTyphoons = await getNeighbors();
        const neighboringTyphoonsNames = await getNames();
        const additionalProperties = await getNeighborsWindSpeedAndPressure(database);

        setTyphoonLocations(locations);
        setNeighboringTyphoons(neighboringTyphoons);
        setNeighboringTyphoonsNames(neighboringTyphoonsNames);
        setNeighboringTyphoonsAdditionalProperties(additionalProperties);
    }

    function validSubmit() {
        if (neighbors <= 0) {
            setNeighborsError(true);
            return false;
        }
        setNeighborsError(false);
        return true;
    }

    async function handleManualSubmit() {
        if (!validSubmit()) return;

        let list_coordinates = [];

        points.forEach((value) => {
            const temp = [];
            temp.push(Number(value.lat));
            temp.push(Number(value.lng));
            temp.push(Number(value.timegap));
            list_coordinates.push(temp);
        })
        const list = await getData(list_coordinates, database, range, neighbors, model);
        await applyResult(list);
        setPoints([{ lat: "", lng: "", timegap: "" }]);
    }

    async function handleAutoTrackToggle(name) {
        if (!validSubmit()) return;

        if (autoTracking) {
            setAutoTracking(false);
            return;
        }
        setAutoTracking(true);
        setFetching(prev => !prev);
        const temp = await getAutoTrackData(name);
        const list = await getData(temp, database, range, neighbors);
        setFetching(prev => !prev);
        if (list) {
            await applyResult(list);
        }
        setAutoTracking(false);
    }



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
                        {/* mode switch */}
                        <div className="px-5 pt-5">
                            <div
                                onMouseDown={(e) => e.stopPropagation()}
                                className="relative grid grid-cols-2 rounded-md bg-white/[0.04] border border-white/[0.09] p-1"
                            >
                                <div
                                    className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[4px] bg-white/90 transition-transform duration-200 ease-out"
                                    style={{ transform: mode === "automatic" ? "translateX(calc(100% + 4px))" : "translateX(0)" }}
                                />
                                <button
                                    onClick={() => setMode("manual")}
                                    className={`relative z-10 py-1.5 text-[12.5px] font-medium tracking-wide transition-colors ${mode === "manual" ? "text-[#12151b]" : "text-white/45"}`}
                                >
                                    Manual
                                </button>
                                <button
                                    onClick={() => setMode("automatic")}
                                    className={`relative z-10 py-1.5 text-[12.5px] font-medium tracking-wide transition-colors ${mode === "automatic" ? "text-[#12151b]" : "text-white/45"}`}
                                >
                                    Automatic
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 px-5 pt-5">
                            {/* Row 1 */}
                            <div className="flex flex-row gap-3">
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
                                {/* No. of Neighbors */}
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <label className="text-[10.5px] font-medium tracking-widest text-white/40 uppercase">Neighbors</label>
                                    <input
                                        type="number"
                                        onChange={(e) => updateNeighbors(e)}
                                        value={neighbors}
                                        className={`w-full bg-white/[0.04] text-white/85 text-[13px] px-3 py-2 border rounded-md focus:outline-none ${neighborsError
                                            ? "border-red-500/60 focus:border-red-500"
                                            : "border-white/[0.09] focus:border-white/25"
                                            }`}
                                    />
                                    {neighborsError && (
                                        <span className="text-[11px] text-red-400">Invalid input</span>
                                    )}
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="flex flex-row gap-3">
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <label className="text-[10.5px] font-medium tracking-widest text-white/40 uppercase">Type of Model</label>
                                    <select
                                        defaultValue={model}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onChange={(e) => setModel(e.target.value)}
                                        className="w-full bg-white/[0.04] text-white/85 text-[13px] px-3 py-2 border border-white/[0.09] rounded-md focus:outline-none focus:border-white/25 cursor-pointer appearance-none"
                                    >
                                        {MODELS.map((agency, i) => (
                                            <option key={i} value={agency} className="bg-[#1a1e26]">{agency}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 w-[90%] mx-auto mt-5">
                            <PriceRangeSlider showLabel width="100%" min={!year_range ? 10 : year_range[database][0]} max={!year_range ? 10 : year_range[database][1]} onChange={handleRangeChange} />
                        </div>

                        {mode === "manual" ? (
                            <>
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
                                    <button onClick={handleManualSubmit} className="bg-white/90 hover:bg-white text-[#12151b] rounded-md py-2.5 text-[13px] font-medium w-full transition-colors">
                                        Submit route
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="px-5 py-4 flex flex-col gap-4">

                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10.5px] font-medium tracking-widest text-white/40 uppercase">
                                            Available Typhoons
                                        </span>

                                        <div className="typhoon-outer-scroll flex flex-col gap-1.5 max-h-60 overflow-y-scroll pr-0.5">
                                            {get_live_typhoons_names.map((storm, idx) => (
                                                <TyphoonListItem key={idx} storm={storm} onClick={() => handleAutoTrackToggle(storm)} range={range} neighbors={neighbors}></TyphoonListItem>
                                            ))}
                                        </div>
                                    </div>

                                    {autoPreview.length > 0 && !autoTracking && (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10.5px] font-medium tracking-widest text-white/40 uppercase">Detected points</span>
                                                <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-widest text-emerald-400 uppercase">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> live
                                                </span>
                                            </div>
                                            <div className="max-h-40 overflow-y-auto flex flex-col gap-1.5 pr-1">
                                                {autoPreview.map((p, i) => (
                                                    <div key={i} className="flex items-center justify-between rounded-md border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[12px]">
                                                        <span className="flex items-center gap-1.5 text-white/70">
                                                            <MapPin size={12} className="text-white/35" />
                                                            {Number(p[0]).toFixed(1)}, {Number(p[1]).toFixed(1)}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-white/40">
                                                            <Clock size={12} /> +{p[2]}h
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function TyphoonListItem({ storm, onClick, range, neighbors }) {
    const { typhoonLocations, setTyphoonLocations, setNeighboringTyphoons,
        setNeighboringTyphoonsNames, setNeighboringTyphoonsAdditionalProperties,
        database, model } = useContext(TyphoonDataContext);
    const [typhoonCoordinates, setTyphoonCoordinates] = useState([]);
    const [typhoonIncluded, setTyphoonIncluded] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const coordinatesIncluded = useRef([]);

    useEffect(() => {
        const temp = [...Array(typhoonCoordinates.length).keys()];
        setTyphoonIncluded(temp);
    }, [typhoonCoordinates])

    async function clicked(storm) {
        if (!isOpen) {
            const list = await getAutoTrackData(storm);
            setTyphoonCoordinates(list);
            applyResult(list);
        }
        else setTyphoonLocations([]);
        setIsOpen((prev) => !prev);
    }

    async function applyResult(list) {
        const locations = [];
        list.forEach((value, index) => {
            let location = { id: index + 1, lat: value[0], lng: value[1], name: "foo" };
            locations.push(location);
        })
        coordinatesIncluded.current = [...locations];
        setTyphoonLocations(locations);
    }

    async function applyResultFinal(list) {
        const locations = [];
        list.forEach((value, index) => {
            let location = { id: index + 1, lat: value[0], lng: value[1], name: `hours` };
            locations.push(location);
        })

        const neighboringTyphoons = await getNeighbors();
        const neighboringTyphoonsNames = await getNames();
        const additionalProperties = await getNeighborsWindSpeedAndPressure(database);

        setTyphoonLocations(locations);
        setNeighboringTyphoons(neighboringTyphoons);
        setNeighboringTyphoonsNames(neighboringTyphoonsNames);
        setNeighboringTyphoonsAdditionalProperties(additionalProperties);
    }

    async function handleAutomaticSubmit(list_coordinates) {
        const temp_list_coordinates = list_coordinates.slice(0, typhoonIncluded.at(-1) + 1);
        const list = await getData(temp_list_coordinates, database, range, neighbors, model);
        await applyResultFinal(list);
    }

    function checkboxChecked(i, coord) {
        const previousLocations = typhoonLocations;
        if (typhoonIncluded.includes(i)) {
            const temp = typhoonIncluded.slice(0, i);
            const index = previousLocations.findIndex((item) => item.id === i);
            previousLocations.splice(index + 1);
            setTyphoonIncluded(temp);
            setTyphoonLocations([...previousLocations]);
        } else {
            const last = typhoonIncluded.at(-1);
            const rangeToAdd = Array.from({ length: i - last }, (_, idx) => (idx + 1) + last);
            setTyphoonIncluded([...typhoonIncluded, ...rangeToAdd]);
            setTyphoonLocations([...previousLocations, ...coordinatesIncluded.current.slice(last + 1, i + 1)]);
        }
    }

    return (
        <div className="flex flex-col gap-1.5">

            <button
                onClick={() => clicked(storm)}
                className="w-full flex items-center justify-between rounded-md border border-white/[0.09] bg-white/[0.04] px-3 py-2 hover:bg-white/[0.06] transition-colors"
            >
                <span className="text-[13px] text-white/85">{storm}</span>
                <Radar size={14} className="text-emerald-400/70" />
            </button>

            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                    <div className="coord-scroll flex flex-col gap-1 rounded-md border border-white/[0.09] bg-white/[0.04] px-3 py-2 max-h-[120px] overflow-y-auto">
                        {typhoonCoordinates.map((coord, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 text-[12px] text-white/60 py-0.5 shrink-0"
                            >
                                <input
                                    type="checkbox"
                                    checked={typhoonIncluded.includes(i)}
                                    onChange={() => checkboxChecked(i, coord)}
                                    className="appearance-none w-3 h-3 rounded-sm border border-white/[0.15] bg-white/[0.04] checked:bg-emerald-400/80 checked:border-emerald-400/80 cursor-pointer transition-colors"
                                />
                                <span className="text-white/35">{i + 1}</span>
                                <span className="ml-auto">{coord[0]}, {coord[1]}</span>
                            </div>
                        ))}
                        <button
                            onClick={() => handleAutomaticSubmit(typhoonCoordinates)}
                            className="w-full text-[12.5px] font-medium rounded-md py-2 transition-colors bg-emerald-400/90 hover:bg-emerald-400 text-[#12151b]"
                        >
                            Submit route
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}