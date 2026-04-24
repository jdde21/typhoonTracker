import { Button } from "@/components/ui/button"
import ParisMap from "./components/parisMap"
import DrawerForm from "./components/drawerForm"
import TyphoonInfo from "./components/typhoonInfo"
import { createContext, useState } from "react"
import './App.css';

export const TyphoonDataContext = createContext();

export function App() {
  const [typhoonLocations, setTyphoonLocations] = useState([]);

  return (
    
    <div className="relative h-screen">

      <TyphoonDataContext.Provider value={{typhoonLocations, setTyphoonLocations}}>
      <div className="h-full w-full">
        <ParisMap />
      </div>

      <div className="absolute top-[5%] left-[1%] w-[20%] h-[90%] z-10">
        <DrawerForm />
      </div>
      </TyphoonDataContext.Provider>

    </div>
  )
}

export default App
