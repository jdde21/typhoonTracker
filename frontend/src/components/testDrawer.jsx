import { useMemo, useState, useContext } from "react";
import { ChevronLeft, Wind, Gauge, CircleDot } from "lucide-react";
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
      className={`w-full text-left rounded-xl px-3.5 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${selected
        ? "bg-[#162032] border-2 border-blue-500"
        : "bg-[#11151f] border border-[#232834] hover:border-[#3a4150]"
        }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`font-mono text-sm font-medium ${selected ? "text-blue-300" : "text-blue-400"}`}>
          {storm}
        </span>
        <span
          className={`text-[11px] font-medium px-2.5 py-0.5 rounded-md ${style.bg} ${style.text}`}
        >
          {category}
        </span>
      </div>
      <div className="flex gap-5">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <Wind size={14} className="text-slate-500" aria-hidden="true" />
          {storm.wind ?? "–"} kt
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <Gauge size={14} className="text-slate-500" aria-hidden="true" />
          {storm.pres ?? "–"} hPa
        </span>
      </div>
    </button>
  );
}

export default function NeighboringTyphoonsDrawer({
  storms = DEFAULT_STORMS,
  defaultOpen = true,
  onSelectStorm,
}) {
  const queryClient = useQueryClient();
  const { all_typhoons, setShowNeighbor, sideDrawerDatabase, setDatabase, setSideDrawerDatabase, TYPHOON_AGENCIES, year_range } = useContext(TyphoonDataContext);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [selectedId, setSelectedId] = useState(null);
  const [basin, setBasin] = useState(BASINS[0]);
  const [yearMin, setYearMin] = useState(1884);
  const [yearMax, setYearMax] = useState(2026);

  const handleRangeChange = (year_range) => {
    setRange([year_range.min, year_range.max])
  };

  const [range, setRange] = useState([0, 0]);

  const visibleStorms = useMemo(() => {
    const lo = Math.min(yearMin, yearMax);
    const hi = Math.max(yearMin, yearMax);
    return storms.filter((s) => {
      const year = yearFromStormId(s.id);
      return year >= lo && year <= hi;
    });
  }, [storms, yearMin, yearMax]);

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
          background-color: #2a2f3a;
          border-radius: 8px;
          border: 2px solid #0d1117;
        }
        .typhoon-scroll::-webkit-scrollbar-thumb:hover { background-color: #3a4150; }
        .typhoon-scroll { scrollbar-width: thin; scrollbar-color: #2a2f3a transparent; }
      `}</style>

        <div className="h-full bg-[#0d1117] border-r border-[#2a2f3a] flex flex-col font-sans shadow-2xl">
          <header className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#232834] shrink-0">
            <div className="flex items-center gap-2.5">
              <CircleDot size={18} className="text-blue-400" aria-hidden="true" />
              <div>
                <p className="text-[15px] font-medium text-slate-100">
                  Neighboring typhoons
                </p>
                <p className="text-xs text-slate-500">
                  {visibleStorms.length} storm{visibleStorms.length === 1 ? "" : "s"} in range
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Hide panel"
              className="text-slate-500 hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
            >
              <ChevronLeft size={18} />
            </button>
          </header>

          <div className="px-4 py-3.5 border-b border-[#232834] flex flex-col gap-3 shrink-0">
            <div className="flex gap-2">
              <label className="flex-1">
                <span className="sr-only">Database</span>
                <select
                  value={sideDrawerDatabase}
                  onChange={(e) => {
                    setSideDrawerDatabase(e.target.value);
                  }}
                  className="w-full bg-[#161b25] border border-[#2a2f3a] text-slate-100 rounded-md px-2.5 py-2 text-[13px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {TYPHOON_AGENCIES.map((db) => (
                    <option key={db}>{db}</option>
                  ))}
                </select>
              </label>
              <label className="flex-1">
                <span className="sr-only">Basin</span>
                <select
                  value={basin}
                  onChange={(e) => setBasin(e.target.value)}
                  className="w-full bg-[#161b25] border border-[#2a2f3a] text-slate-100 rounded-md px-2.5 py-2 text-[13px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {BASINS.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </label>
            </div>

            <div>
          
              <div className="relative h-6">
                <PriceRangeSlider min={!year_range ? 10 : year_range[sideDrawerDatabase][0]} max={!year_range ? 10 : year_range[sideDrawerDatabase][1]} onChange={handleRangeChange} />
              </div>
              <button
                type="button"
                onClick={() => { }}
                disabled={() => { }}
                className={`w-full text-sm font-medium rounded-md py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-blue-600 hover:bg-blue-500 text-white`}
              >
                Apply filters
              </button>
            </div>
          </div>


          <div className="typhoon-scroll flex flex-col gap-2 px-4 py-3 overflow-y-auto grow">

            {all_typhoons && (
              Object.keys(all_typhoons).map((sid, idx) => (
                <StormCard
                  key={idx}
                  storm={sid}
                  selected={sid === selectedId}
                  onSelect={() => {
                    if (sid == selectedId) {
                      setSelectedId(null); setShowNeighbor(null);
                    } else {
                      setSelectedId(sid); setShowNeighbor(sid);
                    }
                  }}
                />
              ))
            )}
          </div>

          <footer className="flex items-center justify-center gap-1.5 px-4 py-3 border-t border-[#232834] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-500">Live monitoring active</span>
          </footer>
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Show neighboring typhoons panel"
        className={`absolute top-4 left-0 z-10 bg-[#0d1117] border border-[#2a2f3a] border-l-0 rounded-r-md p-2 text-slate-400 hover:text-slate-200 transition-opacity duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
      >
        <CircleDot size={16} aria-hidden="true" />
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