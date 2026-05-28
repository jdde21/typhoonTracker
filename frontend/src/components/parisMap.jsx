import React, { useContext } from 'react'
import { Map, MapControls, MapMarker, MarkerContent, MarkerTooltip, MarkerPopup } from './ui/map'
import { Card } from './ui/card'
import { TyphoonDataContext } from '../App';

export default function ParisMap() {

  const { typhoonLocations, neighborTyphoonsLocations, showNeighbor, neighboringTyphoons } = useContext(TyphoonDataContext);

  return (
    <Card className="flex h-full w-full p-0 overflow-hidden">
      <Map center={[128.6, 8.1]} zoom={4}>
        <MapControls></MapControls>
        {
          typhoonLocations.map((location) => (
            <MapMarker
              key={location.id}
              longitude={location.lng}
              latitude={location.lat}
            >
              <MarkerContent>
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
          ))
        }
        {
          Object.keys(neighboringTyphoons).map((sid) => {
            const tracks = neighboringTyphoons[sid];
            if (sid !== showNeighbor) {
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
        {/* {neighborTyphoonsLocations.map((tracks) => {
          return tracks.map((location, index) => (
            <MapMarker
              key={index}
              longitude={location.lng}
              latitude={location.lat}
            >
              <MarkerContent>
                <div className="size-4 rounded-full bg-primary border-2 border-red-500 shadow-lg" />
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
          ))
        })
        } */}

      </Map>
    </Card>
  )
}

