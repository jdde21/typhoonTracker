import ParisMap from "./components/parisMap"
import Cabinet from "./components/cabinet"
import { createContext, useState } from "react"
import './App.css';
import RoutePoints from "./components/routesForm"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NeighborTyphoonCard from "./components/neighborTyphoonCard";
import SliderPkg from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export const TyphoonDataContext = createContext();
export const queryClient = new QueryClient();

const typhoons = [
  {
    name: "Typhoon Mawar",
    category: "CAT4",
    wind: 240,
    pressure: 935,
  },
  {
    name: "Typhoon Bolaven",
    category: "CAT2",
    wind: 175,
    pressure: 960,
  },
  {
    name: "Active Cell TD-04",
    category: "DEP",
    wind: 55,
    pressure: 1004,
  },
  {
    name: "Typhoon Khanun",
    category: "CAT3",
    wind: 205,
    pressure: 945,
  },
  {
    name: "Typhoon Saola",
    category: "CAT5",
    wind: 260,
    pressure: 915,
  },
  {
    name: "Tropical Storm Nalgae",
    category: "TS",
    wind: 95,
    pressure: 992,
  },
];

const Slider = SliderPkg.default;

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


  const [neighborTyphoonsLocations, setNeighborTyphoonsLocations] = useState([]);
  const [neighborTyphoonsSID, setNeighborTyphoonsSID] = useState([]);
  const [showNeighbor, setShowNeighbor] = useState(null);


  return (

    <div className="relative h-screen">
      <QueryClientProvider client={queryClient}>
        <TyphoonDataContext.Provider value={{
          typhoonLocations, setTyphoonLocations, neighboringTyphoons,
          setNeighboringTyphoons, neighborTyphoonsLocations, setNeighborTyphoonsLocations, neighborTyphoonsSID,
          setNeighborTyphoonsSID, showNeighbor, setShowNeighbor, neighboringTyphoonsNames, setNeighboringTyphoonsNames
        }}>
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
                  Object.keys(neighboringTyphoons).map((sid) => <NeighborTyphoonCard name={neighboringTyphoonsNames[sid]} sid={sid} category={'CAT 5'} wind={'1000'} pressure={'100'} tracks={neighboringTyphoons[sid]}/>)
                }
              </Slider>
            </div>
          </div>

        </TyphoonDataContext.Provider>
      </QueryClientProvider>
    </div>
  )
}

export default App
