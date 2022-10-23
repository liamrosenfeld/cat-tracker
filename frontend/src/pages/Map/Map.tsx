import React from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { mapContainerStyle, center, zoom, options } from './settings';

const Map: React.FC = () => 
{
  // map reference variable
  const mapRef = React.useRef<google.maps.Map | null>(null);

  // save the map to the reference
  const onLoad = (map: google.maps.Map): void => 
  {
    mapRef.current = map;
  }

  // detach the map from the reference
  const onUnmount = (): void => 
  {
    mapRef.current = null;
  }

  // load the map
  const { isLoaded } = useJsApiLoader
  ({
    id: 'google-map-ide',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY! // set the key
  })

  if (!isLoaded) // map not loaded
  {
    return <div> Map Loading...</div>
  }
  else // map loaded
  {
    return (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          options={options as google.maps.MapOptions}
          center={center}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
        />
    );
  }
};

export default Map;