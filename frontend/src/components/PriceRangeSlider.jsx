import React, { useCallback, useEffect, useState, useRef } from 'react'

const valueCSS = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    gap: "2px",
    paddingTop: "10px",
};

const DEFAULT_SNAP_POINTS = [1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000];

const snapToNearest = (value, points, threshold) => {
    const closest = points.reduce((a, b) =>
        Math.abs(b - value) < Math.abs(a - value) ? b : a
    );
    return Math.abs(closest - value) <= threshold ? closest : value;
};

export default function PriceRangeSlider({
    min,
    max,
    trackColor = "rgba(255,255,255,0.14)",
    onChange,
    rangeColor = "rgba(255,255,255,0.55)",
    valueStyle = valueCSS,
    width = "300px",
    currencyText = "$",
    mobileScreen = false,
    snapPoints = DEFAULT_SNAP_POINTS,
    snapThreshold = 200,
    thumbSize = 12,
    showLabel = false,
}) {

    const [minVal, setMinVal] = useState(min);
    const [maxVal, setMaxVal] = useState(max);
    const minValRef = useRef(min);
    const maxValRef = useRef(max);
    const range = useRef(null);
    const sliderWidth = mobileScreen ? "150px" : width || "300px";

    const uid = useRef(`prs-${Math.random().toString(36).slice(2, 7)}`).current;

    const getPercent = useCallback(
        (value) => Math.round(((value - min) / (max - min)) * 100),
        [min, max]
    );

    useEffect(() => {
        setMinVal(min);
        setMaxVal(max);
        minValRef.current = min;
        maxValRef.current = max;
    }, [min, max])

    useEffect(() => {
        if (minVal !== minValRef.current || maxVal !== maxValRef.current) {
            onChange({ min: minVal, max: maxVal });
            minValRef.current = minVal;
            maxValRef.current = maxVal;
        }
    }, [minVal, maxVal, onChange]);

    useEffect(() => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxValRef.current);
        if (range.current) {
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, getPercent]);

    useEffect(() => {
        const minPercent = getPercent(minValRef.current);
        const maxPercent = getPercent(maxVal);
        if (range.current) {
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [maxVal, getPercent]);

    const handleMinChange = (event) => {
        const raw = Math.min(Number(event.target.value), maxVal - 1);
        // const snapped = snapPoints.length ? snapToNearest(raw, snapPoints, snapThreshold) : raw;
        // const value = Math.min(snapped, maxVal - 1);
        setMinVal(raw);
    };

    const handleMaxChange = (event) => {
        const raw = Math.max(Number(event.target.value), minVal + 1);
        // const snapped = snapPoints.length ? snapToNearest(raw, snapPoints, snapThreshold) : raw;
        // const value = Math.max(snapped, minVal + 1);
        setMaxVal(raw);
    };



    return (
        <div style={{
            background: "transparent",
            width: "100%",
            maxWidth: 560,
            boxSizing: "border-box",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}>

            {showLabel && (
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                }}>
                    <span style={{
                        fontSize: 10.5,
                        fontWeight: 500,
                        letterSpacing: "0.09em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.4)",
                    }}>
                        Year range
                    </span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontVariantNumeric: "tabular-nums" }}>
                        {minVal} — {maxVal}
                    </span>
                </div>
            )}

            {/* Scoped thumb-size override */}
            <style>{`
                #${uid} .thumb::-webkit-slider-thumb {
                    width: ${thumbSize}px;
                    height: ${thumbSize}px;
                    background: #e8e8e6;
                    border: 2px solid rgba(11,15,20,0.9);
                    box-shadow: 0 0 0 1px rgba(255,255,255,0.25);
                }
                #${uid} .thumb::-moz-range-thumb {
                    width: ${thumbSize}px;
                    height: ${thumbSize}px;
                    background: #e8e8e6;
                    border: 2px solid rgba(11,15,20,0.9);
                    box-shadow: 0 0 0 1px rgba(255,255,255,0.25);
                }
            `}</style>



            {/* Slider */}
            <div id={uid} className="multi-slide-input-container" style={{ width: sliderWidth, position: "relative" }}>
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minVal}
                    onChange={handleMinChange}
                    className="thumb thumb-left"
                    style={{
                        width: sliderWidth,
                        zIndex: minVal > max - 100 || minVal === maxVal ? 5 : undefined,
                    }}
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={maxVal}
                    onChange={handleMaxChange}
                    className="thumb thumb-right"
                    style={{
                        width: sliderWidth,
                        zIndex: minVal > max - 100 || minVal === maxVal ? 4 : undefined,
                    }}
                />
                <div className="slider">
                    <div style={{ backgroundColor: trackColor }} className="track-slider" />
                    <div ref={range} style={{ backgroundColor: rangeColor }} className="range-slider" />
                </div>
            </div>

        </div>
    );
};