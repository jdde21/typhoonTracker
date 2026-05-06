import React, { useState, useContext } from 'react';
import { Card } from './ui/card';
import { Trash } from 'lucide-react';
import { TyphoonDataContext } from '../App';
import { Plus } from "lucide-react";



export default function DrawerForm() {

    const { _, setTyphoonLocations } = useContext(TyphoonDataContext);

    let coordinate = function (index) {
        return <>
            <InputForm pointNumber={index}></InputForm>
        </>
    }

    const typhoon_locations = []
    const [numberOfCoords, setNumberOfCoords] = useState([coordinate(0)]);

    function incrementNumberOfCoords() {
        let tempDict = [...numberOfCoords];
        tempDict.push(coordinate(tempDict.length));
        setNumberOfCoords(tempDict);
    }

    function decrementNumberOfCoords() {
        let tempDict = [...numberOfCoords];
        setNumberOfCoords(tempDict.slice(0, tempDict.length - 1));
    }

    async function submitForm() {
        let list_coordinates = [];
        for (let i = 0; i < numberOfCoords.length; i++) {
            let temp = []
            let latitude = document.getElementById(`latitude${i}`).value;
            let longitude = document.getElementById(`longitude${i}`).value;
            let time = document.getElementById(`time${i}`).value;
            latitude = Number(latitude);
            longitude = Number(longitude);
            time = Number(time);
            temp.push(latitude);
            temp.push(longitude);
            temp.push(time);
            list_coordinates.push(temp);
        }
        let list = await getData(list_coordinates);
        list.forEach((value, index) => {
            let location = { id: index + 1, lat: value[0], lng: value[1], name: 'random' };
            typhoon_locations.push(location);
        })
        console.log(typhoon_locations)
        setTyphoonLocations(typhoon_locations);
    }

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

    return (
        <Card className="flex col h-full w-full p-0 overflow-hidden justify-start items-center bg-[#F8FAFC]">
            <div className='flex bg-[#191C1E] text-white w-full justify-center p-4 font-[Quicksand] font-bold'>Route points</div>

            <div className='flex flex-col justify-between h-full'>
                <div className='flex flex-col px-2 gap-1'>
                    <div className="flex flex-col max-h-50 overflow-y-auto scrollbar-hide gap-1">
                        {
                            numberOfCoords
                        }
                    </div>

                    <button onClick={incrementNumberOfCoords} className="w-full py-3 border-2 border-dashed border-gray-400 text-gray-600 rounded-md hover:bg-gray-100 transition">
                        + Add Input
                    </button>
                </div>
                <div className='p-2'>
                    <button onClick={(e) => {
                        e.preventDefault();
                        console.log("cli");
                        submitForm();
                    }} className="w-full h-16 bg-[#191C1E] text-white flex items-center justify-center rounded-md hover:opacity-90 transition">
                        Process
                    </button>
                </div>
            </div>

        </Card>
    )
}

function MapDrawer() {
    const [inputs, setInputs] = useState([""]);

    const handleChange = (value, index) => {
        const updated = [...inputs];
        updated[index] = value;
        setInputs(updated);
    };

    const addInput = () => {
        setInputs([...inputs, ""]);
    };

    return (
        <div className="absolute bottom-0 left-0 w-full flex justify-center pointer-events-none">

            {/* Drawer */}
            <div className="pointer-events-auto w-full max-w-md bg-[#1E1E1E] text-white rounded-t-2xl shadow-2xl border border-[#2A2A2A]">

                {/* Drag Handle */}
                <div className="w-full flex justify-center py-2">
                    <div className="w-10 h-1.5 bg-gray-500 rounded-full" />
                </div>

                {/* Content */}
                <div className="flex flex-col h-[350px]">

                    {/* Scrollable Inputs */}
                    <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-2">
                        {inputs.map((input, index) => (
                            <input
                                key={index}
                                value={input}
                                onChange={(e) => handleChange(e.target.value, index)}
                                placeholder={`Point ${index + 1}`}
                                className="w-full p-3 rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        ))}

                        {/* Add Button */}
                        <button
                            onClick={addInput}
                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                        >
                            <Plus size={16} />
                            Add field
                        </button>
                    </div>

                    {/* Bottom Button */}
                    <div className="p-4 border-t border-[#2A2A2A]">
                        <button className="w-full bg-blue-600 hover:bg-blue-500 transition rounded-lg py-3 font-semibold">
                            Submit
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

function InputForm({ pointNumber }) {
    return <>
        <label className="flex justify-start text-sm font-semibold rounded text-black mb-2 bg-[#191C1Egit]">
            POINT {pointNumber + 1}
        </label>
        <div className='flex gap-2'>
            <div className='flex flex-col justify-center items-start'>
                <label className="block text-sm font-semibold text-[#64748B] mb-2">
                    Latitude
                </label>
                <input
                    id={`latitude${pointNumber}`}
                    type="text"
                    placeholder="Enter route point..."
                    className="w-full px-3 py-3 rounded-md bg-white text-black border text-xs border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#64748B]"
                />
            </div>
            <div className='flex flex-col justify-center items-start'>
                <label className="block text-sm font-semibold text-[#64748B] mb-2">
                    Longitude
                </label>
                <input
                    id={`longitude${pointNumber}`}
                    type="text"
                    placeholder="Enter route point..."
                    className="w-full px-3 py-3 rounded-md bg-white text-black border text-xs border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#64748B]"
                />
            </div>
        </div>
        <div className='flex flex-col justify-center items-start w-full'>
            <label className="block text-sm font-semibold text-[#64748B] mb-2">
                Time
            </label>
            <input
                id={`time${pointNumber}`}
                type="text"
                placeholder="Enter route point..."
                className="w-full px-3 py-3 rounded-md bg-white text-black border text-xs border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#64748B]"
            />
        </div>
        <div className="w-full h-px bg-gray-700 my-3" />
    </>
}

