import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { mapContainerStyle, center, zoom, options } from './settings';
import MapHeader from './MapHeader';

const Map: React.FC = () => {
  // get api key
  const [key, setKey] = useState<string>();
  useEffect(() => {
    async function getKey() {
      const response = await fetch('/api/keys/map');
      const key = await response.text();
      setKey(key);
    }

    getKey();
  }, []);

  return key !== undefined ? <div><MapHeader /><MapChild apiKey={key} /></div> : <div> Map Loading...</div>
};

const MapChild: React.FC<{ apiKey: string }> = (props) => {
  // load the map
  const { isLoaded, loadError } = useJsApiLoader
    ({
      id: 'google-map-ide',
      googleMapsApiKey: props.apiKey
    });

  const renderMap = () => {
    const onLoad = (_map: google.maps.Map): void => {
      console.log("map loaded")
    }

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        options={options as google.maps.MapOptions}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
      >
        {/* we can add the overlay here (just make sure to cache the components) */}
      </GoogleMap>
    );
  }

  if (loadError) {
    return <div>Map cannot be loaded right now, sorry.</div>
  }

  return isLoaded ? renderMap() : <div> Map Loading...</div>
}

export default Map;
