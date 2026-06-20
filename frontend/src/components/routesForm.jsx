import { useState, useRef, useContext, useEffect } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { TyphoonDataContext } from '../App';
import { useQuery } from "@tanstack/react-query";
import PriceRangeSlider from "./PriceRangeSlider";


const TYPHOON_AGENCIES = ["Default", "JTWC", "JMA", "CMA", "HKO", "IMD", "KMA"];

export default function RoutePoints() {
    const { setTyphoonLocations, setNeighboringTyphoons, setNeighboringTyphoonsNames, setNeighboringTyphoonsAdditionalProperties, database, setDatabase } = useContext(TyphoonDataContext);
    const typhoon_locations = []

    const { data: year_range, isLoading } = useQuery({
        queryKey: ["year_range"],
        queryFn: async () => {
            const res = await fetch("http://127.0.0.1:8000/year_getter");
            return res.json();
        }
    });


    async function getData(list_coordinates) {
        const url = "http://127.0.0.1:8000/input"
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ coordinates: list_coordinates, database: selected, range, neighbors })
            });
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const result = await response.json();
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
        >
            <div
                style={{ left: pos.x, top: pos.y }}
                className="absolute pointer-events-auto bg-[#161b27] rounded-2xl w-90 text-white select-none"
            >
                {/* header — drag handle */}
                <div
                    onMouseDown={onMouseDown}
                    className={`flex justify-between items-center px-4 py-3 ${!collapsed ? "border-b border-white/10" : ""} cursor-grab active:cursor-grabbing`}
                >
                    <span className="font-medium">Route Points</span>
                    <button
                        onClick={() => setCollapsed((prev) => !prev)}
                        className="text-white/50 hover:text-white transition-colors"
                        aria-label={collapsed ? "Expand panel" : "Collapse panel"}
                    >
                        {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                </div>

                {!collapsed && (
                    <>
                <div className="flex flex-row mx-2 my-2 gap-3">
                    {/* Database */}
                    <div className="flex flex-col gap-1 flex-2">
                        <label className="text-[10px] font-semibold tracking-widest text-white/50 uppercase">Database</label>
                        <select
                            defaultValue={database}
                            onMouseDown={(e) => e.stopPropagation()}
                            onChange={(e) => setDatabase(e.target.value)}
                            style={{ backgroundColor: "#1c2130" }}
                            className="w-full text-white text-sm px-3 py-1.5 border border-white/10 rounded-lg focus:outline-none cursor-pointer appearance-none"
                        >
                            {TYPHOON_AGENCIES.map((agency, i) => (
                                <option key={i} value={agency}>{agency}</option>
                            ))}
                        </select>
                    </div>

                    {/* Neighbors */}
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[10px] font-semibold tracking-widest text-white/50 uppercase">Neighbors</label>
                        <input
                            type="number"
                            onChange={(e) => setNeighbors(Number(e.target.value))}
                            value={neighbors}
                            style={{ backgroundColor: "#1c2130" }}
                            className="w-full text-white text-sm px-3 py-1.5 border border-white/10 rounded-lg focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1 w-[90%] m-auto">
                    <PriceRangeSlider min={!year_range ? 10 : year_range[database][0]} max={!year_range ? 10 : year_range[database][1]} onChange={handleRangeChange} />
                </div>

                {/* scrollable list */}
                <div className="max-h-90 overflow-y-auto px-4 py-3 flex flex-col gap-4">
                    {points.map((p, i) => (
                        <div key={i}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[11px] tracking-widest text-white/40">
                                    POINT {String(i + 1).padStart(2, "0")}
                                </p>
                                {points.length > 1 && (
                                    <button
                                        onClick={() => removePoint(i)}
                                        className="text-white/30 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-[1fr_1fr_80px] gap-2 min-w-0">
                                {["lat", "lng", "timegap"].map((field) => (
                                    <div key={field} className="flex flex-col gap-1 min-w-0">
                                        <span className="text-[10px] tracking-wider text-white/40">
                                            {field === "lat" ? "LATITUDE" : field === "lng" ? "LONGITUDE" : "TIMEGAP"}
                                        </span>
                                        <input
                                            type="number"
                                            placeholder={field === "timegap" ? "0" : "0.000"}
                                            value={p[field]}
                                            onChange={(e) => updatePoint(i, field, e.target.value)}
                                            className="bg-[#1c2130] border border-white/10 rounded-lg px-2 py-2 text-sm w-full outline-none focus:border-white/30"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* footer */}
                <div className="px-4 py-3 border-t border-white/10 flex flex-col gap-2">
                    <button onClick={addPoint} className="text-blue-400 text-sm flex items-center gap-1">
                        ⊕ Add new point
                    </button>
                    <button onClick={async () => {
                        let neighborLocations = []
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
                    }} className="bg-blue-500 hover:bg-blue-400 rounded-xl py-3 font-semibold w-full">
                        Submit Route
                    </button>
                </div></>)}
            </div>
        </div>
    );
}