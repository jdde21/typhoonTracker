import MainMap from "./components/MainMap"
import { createContext, useState, useRef } from "react"
import './App.css';
import RoutePoints from "./components/typhoonPrediction/RoutesForm";
import NeighborTyphoonCard from "./components/typhoonPrediction/NeighborTyphoonCard";
import { useQuery } from "@tanstack/react-query";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import NeighboringTyphoonsDrawer from "./components/TyphoonDrawer";
import NeighborList from "./components/closestNeighbors/NeighborList";
import AiChatWidget from "./components/AiChatWidget";
import HideUI from "./components/utils/HideUi";
export const TyphoonDataContext = createContext();
import SliderPkg from 'react-slick';

const TYPHOON_AGENCIES = ["Default", "JTWC", "JMA", "CMA", "HKO", "IMD", "KMA"];
const MODELS = ["Per-point", "Nearest centroid"];
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
  const [neighboringTyphoonsAdditionalProperties, setNeighboringTyphoonsAdditionalProperties] = useState({});
  const [typhoonsWithinPerimeter, setTyphoonsWithinPerimeter] = useState({});
  const [showTyphoonPerimeter, setShowTyphoonPerimeter] = useState(null);


  const [neighborTyphoonsLocations, setNeighborTyphoonsLocations] = useState([]);
  const [neighborTyphoonsSID, setNeighborTyphoonsSID] = useState([]);
  const [showNeighbor, setShowNeighbor] = useState([]);
  const [showTyphoon, setShowTyphoon] = useState(null);
  const [database, setDatabase] = useState(TYPHOON_AGENCIES[0]);
  const [model, setModel] = useState(MODELS[0]);
  const [sideDrawerDatabase, setSideDrawerDatabase] = useState(TYPHOON_AGENCIES[0]);
  const [fetching, setFetching] = useState(false);
  const [isDraggable, setDraggable] = useState(false);
  const [hidden, setHidden] = useState(false);
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
      // console.log("origin", await res.json());
      return res.json();
    }
  });

  const { data: get_live_typhoons_names } = useQuery({
    queryKey: ["live_typhoons_names"],
    queryFn: async () => {
      const res = await fetch("http://127.0.0.1:8000/get_live_typhoons_names");
      return res.json();
    }
  });


  return (

    <div className="relative h-screen">
      <TyphoonDataContext.Provider value={{
        typhoonLocations, setTyphoonLocations, neighboringTyphoons,
        setNeighboringTyphoons, neighborTyphoonsLocations, setNeighborTyphoonsLocations, neighborTyphoonsSID,
        setNeighborTyphoonsSID, showNeighbor, setShowNeighbor, neighboringTyphoonsNames, setNeighboringTyphoonsNames,
        neighboringTyphoonsAdditionalProperties, setNeighboringTyphoonsAdditionalProperties, database, setDatabase, setSideDrawerDatabase, sideDrawerDatabase,
        all_typhoons, year_range, TYPHOON_AGENCIES, itemsRef, sideDrawerLoading, fetching, setFetching, showTyphoon, setShowTyphoon,
        get_live_typhoons_names, model, setModel, setDraggable, isDraggable, typhoonsWithinPerimeter, setTyphoonsWithinPerimeter,
        showTyphoonPerimeter, setShowTyphoonPerimeter, hidden, setHidden
      }}>

        <HideUI />
        <MainMap />
        {
          !hidden ? <>
            <NeighboringTyphoonsDrawer />
            <RoutePoints />
            <NeighborList></NeighborList>
          </> : null
        }


        <AiChatWidget
          onAsk={async (question) => {
            const res = await fetch("http://127.0.0.1:8000/chat", {
              method: "POST", headers: {
                'Content-Type': 'application/json'
              }, body: JSON.stringify({ question })
            });
            const data = await res.json();
            return data; // shown in the dialog
          }}
        />
      </TyphoonDataContext.Provider>
    </div>
  )
}

export default App
