import React, { useRef, useEffect } from 'react';
import PriceRangeSlider from '../utils/PriceRangeSlider';
import TyphoonList from './TyphoonList';
import { test } from '../../api/typhoons';

const Popup = ({ year_range, database, typhoonsWithinPerimeter, setTyphoonsWithinPerimeter, coords, setShowTyphoonPerimeter }) => {
    const [lat, lng] = coords;
    const rangeRef = useRef([]);

    useEffect(() => {
        if (year_range) rangeRef.current = [year_range[database][0], year_range[database][1]]
    }, [year_range])

    async function handleSubmit() {
        const res = await test([lat, lng], rangeRef.current);
        setTyphoonsWithinPerimeter(res);
    }

    const handleRangeChange = (year_range) => {
        rangeRef.current = [year_range.min, year_range.max]
    };

    return (
        <div
            className="flex flex-col gap-3 w-65 p-4 rounded-lg border border-white/10 shadow-lg"
            style={{
                background: "rgba(30, 34, 40, 0.55)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
            }}
        >
            <div className="flex flex-col gap-3 w-[90%] mx-auto">
                <PriceRangeSlider
                    showLabel
                    width="100%"
                    min={!year_range ? 10 : year_range[database][0]}
                    max={!year_range ? 10 : year_range[database][1]}
                    onChange={handleRangeChange}
                />
                <TyphoonList sids={(Object.keys(typhoonsWithinPerimeter)).slice(0, 5)} setShowTyphoonPerimeter={setShowTyphoonPerimeter} />
            </div>
            <button
                onClick={handleSubmit}
                className="w-full py-2 rounded-md bg-white/10 text-white text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors"
            >
                Submit
            </button>
        </div>
    )
}

export default Popup
