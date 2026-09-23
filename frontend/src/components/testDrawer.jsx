import { useState, useContext } from "react";
import { ChevronLeft, Wind, Gauge } from "lucide-react";
import { WiHurricane } from "react-icons/wi";
import { TyphoonDataContext } from '../App';
import { useQueryClient } from '@tanstack/react-query';
import PriceRangeSlider from "./PriceRangeSlider";

const CATEGORY_STYLES = {
  TS: { bg: "bg-amber-950", text: "text-amber-300" },
  "Cat 1": { bg: "bg-amber-950", text: "text-amber-300" },
  "Cat 2": { bg: "bg-orange-950", text: "text-orange-300" },
  "Cat 3": { bg: "bg-orange-950", text: "text-orange-300" },
  "Cat 4": { bg: "bg-red-950", text: "text-red-300" },
  "Cat 5": { bg: "bg-red-950", text: "text-red-300" },
};

const DATABASES = ["IBTrACS", "JTWC best track", "JMA RSMC", "CMA database"];
const BASINS = ["West Pacific", "All basins", "North Indian", "South Pacific"];

function categoryFromWind(wind) {
  if (wind < 64) return "TS";
  if (wind < 83) return "Cat 1";
  if (wind < 96) return "Cat 2";
  if (wind < 113) return "Cat 3";
  if (wind < 137) return "Cat 4";
  return "Cat 5";
}

function yearFromStormId(id) {
  return parseInt(String(id).slice(0, 4), 10);
}

function StormCard({ storm, selected, onSelect }) {
  const category = categoryFromWind(storm.wind ?? 0);
  const style = CATEGORY_STYLES[category];

  return (
    <button
      type="button"
      onClick={() => onSelect?.(storm)}
      className={`w-full text-left rounded-lg px-3.5 py-3 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 ${selected
        ? "bg-white/[0.07] border border-white/25"
        : "bg-white/[0.02] border border-white/[0.07] hover:border-white/20"
        }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`font-mono text-[13px] font-medium ${selected ? "text-white/90" : "text-white/65"}`}>
          {storm}
        </span>
        <span
          className={`text-[10.5px] font-medium px-2.5 py-0.5 rounded-md ${style.bg} ${style.text}`}
        >
          {category}
        </span>
      </div>
      <div className="flex gap-5">
        <span className="flex items-center gap-1.5 text-xs text-white/40">
          <Wind size={13} className="text-white/30" aria-hidden="true" />
          {storm.wind ?? "–"} kt
        </span>
        <span className="flex items-center gap-1.5 text-xs text-white/40">
          <Gauge size={13} className="text-white/30" aria-hidden="true" />
          {storm.pres ?? "–"} hPa
        </span>
      </div>
    </button>
  );
}

export default function NeighboringTyphoonsDrawer({
  storms = DEFAULT_STORMS,
  defaultOpen = false,
  onSelectStorm,
}) {
  const queryClient = useQueryClient();
  const { all_typhoons, setShowTyphoon, sideDrawerDatabase, itemsRef, setSideDrawerDatabase, TYPHOON_AGENCIES, year_range, sideDrawerLoading } = useContext(TyphoonDataContext);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [selectedId, setSelectedId] = useState(null);
  const [basin, setBasin] = useState(BASINS[0]);
  const [yearMin] = useState(1884);
  const [yearMax] = useState(2026);


  const handleRangeChange = (year_range) => {
    itemsRef.current[0] = year_range.min; itemsRef.current[1] = year_range.max;
  };


  return (
    <>
      <aside
        className={`absolute top-0 left-0 h-full w-full max-w-sm z-20 transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <style>{`
        .typhoon-scroll::-webkit-scrollbar { width: 8px; }
        .typhoon-scroll::-webkit-scrollbar-track { background: transparent; }
        .typhoon-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.12);
          border-radius: 8px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .typhoon-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.22); }
        .typhoon-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent; }
      `}</style>

        <div
          style={{
            background: "rgba(20, 24, 30, 0.55)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
          className="h-full border-r border-white/[0.08] flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
        >
          <header className="flex items-center justify-between px-4 pt-4 pb-3.5 border-b border-white/[0.07] shrink-0">
            <div className="flex items-center gap-2.5">
              <WiHurricane size={35} color="rgba(255,255,255,0.5)" />
              <div>
                <p className="text-[14px] font-medium text-white/90">
                  Typhoon database
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Hide panel"
              className="text-white/35 hover:text-white/70 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded-md transition-colors"
            >
              <ChevronLeft size={17} />
            </button>
          </header>

          <div className="px-4 py-4 border-b border-white/[0.07] flex flex-col gap-3.5 shrink-0">
            <div className="flex gap-2">
              <label className="flex-1">
                <span className="sr-only">Database</span>
                <select
                  value={sideDrawerDatabase}
                  onChange={(e) => {
                    setSideDrawerDatabase(e.target.value);
                  }}
                  className="w-full bg-white/[0.04] border border-white/[0.09] text-white/85 rounded-md px-2.5 py-2 text-[13px] focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 focus:border-white/25"
                >
                  {TYPHOON_AGENCIES.map((db) => (
                    <option key={db} className="bg-[#181c24]">{db}</option>
                  ))}
                </select>
              </label>
              <label className="flex-1">
                <span className="sr-only">Basin</span>
                <select
                  value={basin}
                  onChange={(e) => setBasin(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.09] text-white/85 rounded-md px-2.5 py-2 text-[13px] focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 focus:border-white/25"
                >
                  {BASINS.map((b) => (
                    <option key={b} className="bg-[#181c24]">{b}</option>
                  ))}
                </select>
              </label>
            </div>

            <PriceRangeSlider
              showLabel
              width="100%"
              min={!year_range ? 10 : year_range[sideDrawerDatabase][0]}
              max={!year_range ? 10 : year_range[sideDrawerDatabase][1]}
              onChange={handleRangeChange}
            />

            <button
              type="button"
              onClick={() => { queryClient.invalidateQueries({ queryKey: ["all_typhoons"] }); }}
              disabled={false}
              className="w-full text-[13px] font-medium rounded-md py-2.5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-white/90 hover:bg-white text-[#12151b] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply filters
            </button>
          </div>

          <div className="typhoon-scroll flex flex-col gap-2 px-4 py-3.5 overflow-y-auto grow">

            {sideDrawerLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-lg bg-white/[0.05] animate-pulse"
                  />
                ))}
              </div>
            ) : (
              all_typhoons && (
                Object.keys(all_typhoons).map((sid, idx) => (
                  <StormCard
                    key={idx}
                    storm={sid}
                    selected={sid === selectedId}
                    onSelect={() => {
                      if (sid == selectedId) {
                        setSelectedId(null); setShowTyphoon(null);
                      } else {
                        setSelectedId(sid); setShowTyphoon(sid);
                      }
                    }}
                  />
                ))
              )
            )}
          </div>

        </div>
      </aside>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Show neighboring typhoons panel"
        style={{
          background: "rgba(20, 24, 30, 0.55)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
        className={`absolute top-4 left-0 z-10 flex items-center border border-white/[0.08] border-l-0 rounded-r-md px-3 py-2 text-white/40 hover:text-white/75 text-[13px] font-medium transition-opacity duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 ${isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
      >
        <WiHurricane size={25} color="currentColor" />
        Typhoon database
      </button>
    </>
  );
}

export const DEFAULT_STORMS = [
  { id: "1884177N17124", wind: 62, pres: 985 },
  { id: "1884186N16125", wind: 88, pres: 962 },
  { id: "1884191N15127", wind: 115, pres: 941 },
  { id: "1884201N18129", wind: 135, pres: 918 },
  { id: "1884208N13127", wind: 55, pres: 992 },
  { id: "1884215N13130", wind: 150, pres: 902 },
  { id: "1884231N11128", wind: 72, pres: 978 },
  { id: "1884236N13127", wind: 98, pres: 955 },
];