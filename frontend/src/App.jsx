import { Button } from "@/components/ui/button"
import ParisMap from "./components/parisMap"
import Cabinet from "./components/cabinet"
import DrawerForm from "./components/drawerForm"
import TyphoonInfo from "./components/typhoonInfo"
import PopUpDrawer from "./components/popupDrawer"
import { createContext, useState } from "react"
import './App.css';
import RoutePoints from "./components/routesForm"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const TyphoonDataContext = createContext();
export const queryClient = new QueryClient();

export function App() {

  const [typhoonLocations, setTyphoonLocations] = useState([]);
  const [neighboringTyphoons, setNeighboringTyphoons] = useState({});
  const [neighboringTyphoonsNames, setNeighboringTyphoonsNames] = useState({});


  const [neighborTyphoonsLocations, setNeighborTyphoonsLocations] = useState([]);
  const [neighborTyphoonsSID, setNeighborTyphoonsSID] = useState([]);
  const [showNeighbor, setShowNeighbor] = useState(null);

  return (

    <div className="relative h-screen">
      <QueryClientProvider client={queryClient}>
      <TyphoonDataContext.Provider value={{ typhoonLocations, setTyphoonLocations, neighboringTyphoons, 
        setNeighboringTyphoons, neighborTyphoonsLocations, setNeighborTyphoonsLocations, neighborTyphoonsSID, 
        setNeighborTyphoonsSID, showNeighbor, setShowNeighbor, neighboringTyphoonsNames, setNeighboringTyphoonsNames }}>
        <div className="h-full w-full">
          <ParisMap />
        </div>

        <div className="absolute top-[5%] w-[20%] h-[90%] z-10">
          {/* <PopUpDrawer /> */}
          <RoutePoints/>
        </div>

        <div className="absolute top-[14%] left-[1%] w-[20%] z-10">
          <Cabinet
            neighboringTyphoons={neighboringTyphoons}
            onSelect={(item) => console.log("selected", item)}
          />
        </div>
      </TyphoonDataContext.Provider>
      </QueryClientProvider>
    </div>
  )
}

export default App
