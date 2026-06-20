import ParisMap from "./components/parisMap"
import { createContext, useState } from "react"
import './App.css';
import RoutePoints from "./components/routesForm"
import NeighborTyphoonCard from "./components/neighborTyphoonCard";
import SliderPkg from 'react-slick';
import NeighboringTyphoonsDrawer from "./components/typhoonsDrawer";
import { useQuery } from "@tanstack/react-query";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
  const [showNeighbor, setShowNeighbor] = useState(null);
  const [database, setDatabase] = useState(TYPHOON_AGENCIES[0]);

  const { data: all_typhoons, isLoading, isSuccess } = useQuery({
    queryKey: ["all_typhoons"],
    queryFn: async () => {
      const res = await fetch(`http://127.0.0.1:8000/all_typhoons/${database}`);
      return res.json();
    }
  });


  return (

    <div className="relative h-screen">
      <TyphoonDataContext.Provider value={{
        typhoonLocations, setTyphoonLocations, neighboringTyphoons,
        setNeighboringTyphoons, neighborTyphoonsLocations, setNeighborTyphoonsLocations, neighborTyphoonsSID,
        setNeighborTyphoonsSID, showNeighbor, setShowNeighbor, neighboringTyphoonsNames, setNeighboringTyphoonsNames,
        setNeighboringTyphoonsAdditionalProperties, database, setDatabase, all_typhoons
      }}>

        <NeighboringTyphoonsDrawer></NeighboringTyphoonsDrawer>
        <div className="h-full w-full">
          <ParisMap />
        </div>

        <div className="absolute top-[5%] w-[20%] h-[90%] z-10">
          {/* <PopUpDrawer /> */}
          <RoutePoints />
        </div>

        {/* <div className="absolute top-[14%] left-[1%] w-[20%] z-10">
            <Cabinet
              neighboringTyphoons={neighboringTyphoons}
              onSelect={(item) => console.log("selected", item)}
            />
          </div> */}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full">
          <div className="w-[80%] m-auto">
            <Slider {...settings}>
              {
                Object.keys(neighboringTyphoons).map((sid) => <NeighborTyphoonCard name={neighboringTyphoonsNames[sid]} sid={sid} category={'CAT 5'} wind={neighboringTyphoonsAdditionalProperties[sid].length !== 0 ? `${neighboringTyphoonsAdditionalProperties[sid][1]} knots` : "No Data"} pressure={neighboringTyphoonsAdditionalProperties[sid].length !== 0 ? `${neighboringTyphoonsAdditionalProperties[sid][2]} mb` : "No Data"} tracks={neighboringTyphoons[sid][0]} score={neighboringTyphoons[sid][1]} />)
              }
            </Slider>
          </div>
        </div>

      </TyphoonDataContext.Provider>
    </div>
  )
}

export default App
