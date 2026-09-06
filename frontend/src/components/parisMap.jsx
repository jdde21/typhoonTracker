import React, { useContext } from 'react'
import { Map, MapControls, MapMarker, MarkerContent, MarkerTooltip, MarkerPopup } from './ui/map'
import { Card } from './ui/card'
import { TyphoonDataContext } from '../App';



const DEFAULT_COORDINATES = [128.6, 8.1]
const DEFAULT_ZOOM = 4


export default function ParisMap() {

  const { typhoonLocations, all_typhoons, showNeighbor, showTyphoon, neighboringTyphoons } = useContext(TyphoonDataContext);

  console.log(typhoonLocations)
  return (
    <Card className="flex h-full w-full p-0 overflow-hidden">
      <Map typhoonCoordinates={typhoonLocations} center={DEFAULT_COORDINATES} zoom={DEFAULT_ZOOM}>
        <MapControls recenterTarget={{ center: DEFAULT_COORDINATES, zoom: DEFAULT_ZOOM }}></MapControls>
        {
          typhoonLocations.map((location, idx) => {

            return <MapMarker
              key={idx}
              longitude={location.lng}
              latitude={location.lat}
            >
              <MarkerContent pulsating={typhoonLocations.length == idx + 1 ? true : false} total={typhoonLocations.length} index={idx}>
                <div className="size-4 rounded-full bg-primary border-2 border-white shadow-lg" />
              </MarkerContent>
              <MarkerTooltip>{`${(location.lat).toFixed(2)}, ${(location.lng).toFixed(2)}`}</MarkerTooltip>
              <MarkerPopup>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{location.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                </div>
              </MarkerPopup>
            </MapMarker>
})
        }
        {
          Object.keys(neighboringTyphoons).map((sid) => {
            const tracks = neighboringTyphoons[sid][0];
            if (showNeighbor.length == 0 || sid !== showNeighbor[0]) {
              console.log(showNeighbor[0], "yolo")
              return null;
            }
            return tracks.map((values, index) => {
              const longitude = values[1];
              const latitude = values[0];
              return <MapMarker
                key={index}
                longitude={longitude}
                latitude={latitude}
              >
                <MarkerContent pulsating={tracks.length == index + 1 ? true : false} total={tracks.length} index={index} neighbor={true}>
                  <div className="size-4 rounded-full bg-primary border-2 border-red-500 shadow-lg" />
                </MarkerContent>
                <MarkerTooltip>{`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`}</MarkerTooltip>
                <MarkerPopup>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{sid}</p>
                    <p className="text-xs text-muted-foreground">
                      {latitude.toFixed(4)}, {longitude.toFixed(4)}
                    </p>
                  </div>
                </MarkerPopup>
              </MapMarker>
            })
          })
        }
        {
          all_typhoons && Object.keys(all_typhoons).map((sid) => {
            const tracks = all_typhoons[sid];
            if (sid !== showTyphoon) {
              return null;
            }
            return tracks.map((values, index) => {
              const longitude = values[1];
              const latitude = values[0];
              return <MapMarker
                key={index}
                longitude={longitude}
                latitude={latitude}
              >
                <MarkerContent>
                  <div className="size-4 rounded-full bg-primary border-2 border-red-500 shadow-lg" />
                </MarkerContent>
                <MarkerTooltip>{`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`}</MarkerTooltip>
                <MarkerPopup>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{sid}</p>
                    <p className="text-xs text-muted-foreground">
                      {latitude.toFixed(4)}, {longitude.toFixed(4)}
                    </p>
                  </div>
                </MarkerPopup>
              </MapMarker>
            })
          })
        }

      </Map>
    </Card>
  )
}

