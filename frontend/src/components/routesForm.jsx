import { useState, useRef, useContext, useEffect } from "react";
import { Trash2, ChevronDown, ChevronUp, Plus, Radar, MapPin, Clock, Loader2 } from "lucide-react";
import { TyphoonDataContext } from '../App';
import { useQuery } from "@tanstack/react-query";
import PriceRangeSlider from "./PriceRangeSlider";
import "./scrollbars.css";


const TYPHOON_AGENCIES = ["Default", "JTWC", "JMA", "CMA", "HKO", "IMD", "KMA"];
const dummyTyphoons = [
    { id: 1, name: "Typhoon Co-may" },
    { id: 2, name: "Typhoon Francisco" },
    { id: 3, name: "Typhoon Krosa" },
];

export default function RoutePoints() {
    const { setFetching, setTyphoonLocations, setNeighboringTyphoons,
        setNeighboringTyphoonsNames, setNeighboringTyphoonsAdditionalProperties,
        database, setDatabase, year_range, get_live_typhoons_names } = useContext(TyphoonDataContext);
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

    async function getAutoTrackData(name) {
        const url = `http://127.0.0.1:8000/get_live_typhoons?name=${name}`
        try {
            setFetching(prev => !prev);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            setFetching(prev => !prev);
            return result;
        } catch (error) {
            console.error(error.message);
            setFetching(prev => !prev);
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
        const additionalProperties = await getNeighborsWindSpeedAndPressure();

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
        const list = await getData(list_coordinates);
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
        const temp = await getAutoTrackData(name);
        const list = await getData(temp);
        if (list) {
            // setAutoPreview(list);
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
                                                <TyphoonListItem storm={storm} onClick={() => handleAutoTrackToggle(storm)}></TyphoonListItem>
                                                // <button
                                                //     key={idx}
                                                //     onClick={() => handleAutoTrackToggle(storm)}
                                                //     className="flex items-center justify-between rounded-md border border-white/[0.07] bg-white/[0.02] px-3 py-2 hover:bg-white/[0.05] transition-colors"
                                                // >
                                                //     <span className="text-[13px] text-white/80">
                                                //         {storm}
                                                //     </span>

                                                //     <Radar size={14} className="text-emerald-400/70" />
                                                // </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* <div className="flex flex-col items-center gap-3 rounded-lg border border-white/[0.09] bg-white/[0.03] px-4 py-6">
                                        <div className="relative flex h-12 w-12 items-center justify-center">
                                            {autoTracking && (
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/20" />
                                            )}
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-full border ${autoTracking ? "border-emerald-400/40 bg-emerald-400/10" : "border-white/[0.09] bg-white/[0.04]"}`}
                                            >
                                                {autoTracking ? (
                                                    <Loader2 size={18} className="animate-spin text-emerald-400" />
                                                ) : (
                                                    <Radar size={18} className="text-white/40" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <p className="text-[13px] font-medium text-white/85">
                                                {autoTracking ? "Fetching live track" : autoPreview.length > 0 ? "Track ready" : "Auto-track idle"}
                                            </p>
                                            <p className="mt-0.5 text-[11.5px] text-white/40">
                                                {autoTracking
                                                    ? "Pulling the latest coordinates for this database"
                                                    : autoPreview.length > 0
                                                        ? `${autoPreview.length} points detected`
                                                        : "Fetch the active typhoon's coordinates automatically"}
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleAutoTrackToggle}
                                            disabled={autoTracking}
                                            className="mt-1 w-full rounded-md border border-white/[0.09] bg-white/[0.04] hover:bg-white/[0.07] text-white/85 py-2.5 text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {autoTracking ? "Tracking…" : "Start auto-track"}
                                        </button>
                                    </div> */}

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

function TyphoonListItem({ storm, onClick }) {
    const [isOpen, setIsOpen] = useState(false);
    const [typhoonCoordinates, setTyphoonCoordinates] = useState([]);
  
    // hardcoded for now — swap for storm.track once live data is wired up
    const coordinates = [
      { lat: 13.412, lng: 123.877 },
      { lat: 13.998, lng: 122.541 },
      { lat: 14.653, lng: 121.309 },
      { lat: 15.204, lng: 120.187 },
      { lat: 15.881, lng: 118.932 },
      { lat: 16.442, lng: 117.803 },
      { lat: 17.015, lng: 116.998 },
    ];

    async function getAutoTrackData(name) {
        const url = `http://127.0.0.1:8000/get_live_typhoons?name=${name}`
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
            console.log("clicked")
            return result;
        } catch (error) {
            console.error(error.message);
        }
    }

    async function clicked(storm) {
        if (!isOpen) setTyphoonCoordinates(await getAutoTrackData(storm));
        setIsOpen((prev) => !prev)
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
  
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="coord-scroll flex flex-col gap-1 rounded-md border border-white/[0.09] bg-white/[0.04] px-3 py-2 max-h-[120px] overflow-y-auto">
              {typhoonCoordinates.map((coord, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-[12px] text-white/60 py-0.5 shrink-0"
                >
                  <span className="text-white/35">{i + 1}</span>
                  <span>{coord[0]}, {coord[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }