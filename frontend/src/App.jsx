import ParisMap from "./components/parisMap"
import { createContext, useState, useRef, useEffect } from "react"
import './App.css';
import RoutePoints from "./components/routesForm"
import NeighborTyphoonCard from "./components/neighborTyphoonCard";
import SliderPkg from 'react-slick';
import { useQuery } from "@tanstack/react-query";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NeighboringTyphoonsDrawer from "./components/testDrawer";
export const TyphoonDataContext = createContext();


const Slider = SliderPkg.default;
const TYPHOON_AGENCIES = ["Default", "JTWC", "JMA", "CMA", "HKO", "IMD", "KMA"];

export function App() {

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 3,
  };

  const [typhoonLocations, setTyphoonLocations] = useState([]);
  const [neighboringTyphoons, setNeighboringTyphoons] = useState({});
  const [neighboringTyphoonsNames, setNeighboringTyphoonsNames] = useState({});
  const [neighboringTyphoonsAdditionalProperties, setNeighboringTyphoonsAdditionalProperties] = useState({});


  const [neighborTyphoonsLocations, setNeighborTyphoonsLocations] = useState([]);
  const [neighborTyphoonsSID, setNeighborTyphoonsSID] = useState([]);
  const [showNeighbor, setShowNeighbor] = useState([]);
  const [showTyphoon, setShowTyphoon] = useState(null);
  const [database, setDatabase] = useState(TYPHOON_AGENCIES[0]);
  const [sideDrawerDatabase, setSideDrawerDatabase] = useState(TYPHOON_AGENCIES[0]);
  const [fetching, setFetching] = useState(false);
  const itemsRef = useRef([0, 0]);


  const { data: all_typhoons, isFetching: sideDrawerLoading } = useQuery({
    queryKey: ["all_typhoons"],
    queryFn: async () => {
      const params = new URLSearchParams({
        start: itemsRef.current[0],
        end: itemsRef.current[1],
      });
      const res = await fetch(`http://127.0.0.1:8000/all_typhoons/${sideDrawerDatabase}?${params.toString()}`);
      return res.json();
    },
    refetchOnWindowFocus: false,
  });

  const { data: year_range } = useQuery({
    queryKey: ["year_range"],
    queryFn: async () => {
      const res = await fetch("http://127.0.0.1:8000/year_getter");
      return res.json();
    }
  });


  return (

    <div className="relative h-screen">
      <TyphoonDataContext.Provider value={{
        typhoonLocations, setTyphoonLocations, neighboringTyphoons,
        setNeighboringTyphoons, neighborTyphoonsLocations, setNeighborTyphoonsLocations, neighborTyphoonsSID,
        setNeighborTyphoonsSID, showNeighbor, setShowNeighbor, neighboringTyphoonsNames, setNeighboringTyphoonsNames,
        setNeighboringTyphoonsAdditionalProperties, database, setDatabase, setSideDrawerDatabase, sideDrawerDatabase, 
        all_typhoons, year_range, TYPHOON_AGENCIES, itemsRef, sideDrawerLoading, setFetching, showTyphoon, setShowTyphoon
      }}>

        <NeighboringTyphoonsDrawer></NeighboringTyphoonsDrawer>
        <div className="h-full w-full">
          <ParisMap />
        </div>

        <div className="absolute top-[5%] w-[20%] h-[90%] z-10">
          <RoutePoints />
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full">
          <div className="w-[80%] m-auto">
            {fetching ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-sm text-gray-300">Loading neighboring typhoons...</span>
                </div>
              </div>
            ) : (
              <Slider {...settings}>
                {Object.keys(neighboringTyphoons).map((sid) => (
                  <NeighborTyphoonCard
                    key={sid}
                    name={neighboringTyphoonsNames[sid]}
                    sid={sid}
                    category={'CAT 5'}
                    wind={
                      neighboringTyphoonsAdditionalProperties[sid].length !== 0
                        ? `${neighboringTyphoonsAdditionalProperties[sid][1]} knots`
                        : "No Data"
                    }
                    pressure={
                      neighboringTyphoonsAdditionalProperties[sid].length !== 0
                        ? `${neighboringTyphoonsAdditionalProperties[sid][2]} mb`
                        : "No Data"
                    }
                    tracks={neighboringTyphoons[sid][0]}
                    score={neighboringTyphoons[sid][1]}
                  />
                ))}
              </Slider>
            )}
          </div>
        </div>

      </TyphoonDataContext.Provider>
    </div>
  )
}

export default App
