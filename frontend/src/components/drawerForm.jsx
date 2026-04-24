import React, { useState, useContext } from 'react';
import { Card } from './ui/card';
import { Trash } from 'lucide-react';
import { TyphoonDataContext } from '../App';



export default function DrawerForm() {

    const { _, setTyphoonLocations } = useContext(TyphoonDataContext);

    let coordinate = function (index) {
        return <>
            <InputForm pointNumber={index}></InputForm>
            {/* <label>Coordinate {index + 1}</label>
            <div className='flex flex-col items-baseline gap-1 w-full p-2'>
                <div className='flex items-center justify-center gap-1 w-full p-2'>
                    <input id={`coordinate${index}`} className='flex justify-center items-center bg-white rounded text-black text-center w-[50%]' type="text" placeholder="Enter coordinates" />
                    <input id={`time${index}`} className='flex justify-center items-center bg-white rounded text-black text-center w-[50%]' type="text" placeholder="Enter time" />
                </div>
            </div> */}
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
                    <div className="flex flex-col max-h-164 overflow-y-auto scrollbar-hide gap-1">
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


            {/* <div className='flex flex-col h-3/4 items-center justify-center'>
                <div className='flex flex-col w-full h-full items-center gap-3'>

                    <form className='flex items-center justify-center w-full'>
                        <div className='flex flex-col items-center justify-center gap-1 w-full'>
                            {
                                numberOfCoords
                            }
                            <button onClick={(e) => {
                                e.preventDefault();
                                submitForm();
                            }}>Submit</button>
                        </div>
                    </form>
                    <div className='flex justify-center items-center w-full gap-1'>
                        <button onClick={incrementNumberOfCoords} className="btn bg-black rounded text-white p-1 w-[40%]">Add coordinate</button>
                        <button onClick={decrementNumberOfCoords} className="btn bg-black rounded text-white p-1 w-[40%]">Sub coordinate</button>
                    </div>
                </div>
            </div> */}

        </Card>
    )
}

function InputForm({ pointNumber }) {
    return <>
        <label className="flex justify-center px-4 text-sm font-semibold rounded text-white mb-2 bg-[#191C1Egit]">
            Point {pointNumber + 1}
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
    </>
}