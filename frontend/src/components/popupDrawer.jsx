import React, { useState, useContext } from 'react';
import { TyphoonDataContext } from '../App';

export default function SideDrawer() {
    const { setTyphoonLocations, setNeighboringTyphoons, setNeighboringTyphoonsNames } = useContext(TyphoonDataContext);
    const typhoon_locations = []



    const [open, setOpen] = useState(false);
    const [points, setPoints] = useState([
        { lat: "", lon: "", time: 0 }
    ]);

    const handleChange = (index, field, value) => {
        const updated = [...points];
        updated[index][field] = value;
        setPoints(updated);
    };

    const addPoint = () => {
        setPoints([...points, { lat: "", lon: "", time: "" }]);
    };

    async function getData(list_coordinates) {
        const url = "http://127.0.0.1:8000/input"
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ coordinates: list_coordinates })
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

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
            >
                Open Drawer
            </button>

            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="h-full bg-[#1E1E1E] text-white shadow-2xl border-l border-[#2A2A2A] flex flex-col">

                    <div className="flex justify-between items-center px-4 py-3 border-b border-[#2A2A2A] shrink-0">
                        <span className="font-semibold">Route Points</span>
                        <button onClick={() => setOpen(false)}>✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

                        {points.map((point, i) => (
                            <div key={i} className="grid grid-cols-3 gap-2">

                                <input
                                    type="number"
                                    step="any"
                                    value={point.lat}
                                    onChange={(e) => handleChange(i, "lat", e.target.value)}
                                    placeholder="Lat"
                                    className="p-2 rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <input
                                    type="number"
                                    step="any"
                                    value={point.lon}
                                    onChange={(e) => handleChange(i, "lon", e.target.value)}
                                    placeholder="Lon"
                                    className="p-2 rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={point.time}
                                    onChange={(e) =>
                                        handleChange(i, "time", parseInt(e.target.value) || 0)
                                    }
                                    className="p-2 rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                            </div>
                        ))}

                        <button
                            onClick={addPoint}
                            className="flex items-center gap-2 text-blue-400 text-sm"
                        >
                            + Add point
                        </button>

                    </div>

                    <div className="p-4 border-t border-[#2A2A2A] shrink-0">
                        <button onClick={async () => {
                            let neighborLocations = []
                            let list_coordinates = [];
                            points.forEach((value) => {
                                const temp = [];
                                temp.push(Number(value.lat));
                                temp.push(Number(value.lon));
                                temp.push(Number(value.time));
                                list_coordinates.push(temp);
                            })
                            let list = await getData(list_coordinates);
                            let neighboringTyphoons = await getNeighbors();
                            let neighboringTyphoonsNames = await getNames();

                            let currentHours = 0;
                            list.forEach((value, index) => {
                                currentHours += value[2]
                                let location = { id: index + 1, lat: value[0], lng: value[1], name: `${Math.floor(currentHours)} hours` };
                                typhoon_locations.push(location);
                            })


                            setTyphoonLocations(typhoon_locations);
                            setNeighboringTyphoons(neighboringTyphoons);
                            setNeighboringTyphoonsNames(neighboringTyphoonsNames);
                            setPoints([{ lat: "", lon: "", time: 0 }])
                            setOpen(false);
                        }} className="w-full bg-blue-600 hover:bg-blue-500 transition rounded-lg py-3 font-semibold">
                            Submit
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}