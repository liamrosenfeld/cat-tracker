import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { mapContainerStyle, center, zoom, options } from './settings';
import MapHeader from './MapHeader';
import ReportMarker, { ReportMarkerType } from './Markers';

const Map: React.FC = () =>
{
  // get api key
  const [ key, setKey ] = useState<string>();
  useEffect( () =>
  {
    async function getKey ()
    {
      const response = await fetch( '/api/keys/map' );
      const key = await response.text();
      setKey( key );
    }

    getKey();
  }, [] );

  return key !== undefined ? <div><MapHeader /><MapChild apiKey={ key } /></div> : <div> Map Loading...</div>;
};

const MapChild: React.FC<{ apiKey: string; }> = ( props ) =>
{

  /**********TEMPORARY MARKER DATA***********/

  var baseLat = 29.639;
  var baseLng = -82.360;

  // generate the data || grab data from API
  var tmpMarkers: Array<ReportMarkerType> = new Array<ReportMarkerType>();
  for ( var i = 0; i < 10; i++ )
  {
    var tmpLatLng: google.maps.LatLngLiteral = {
      lat: ( baseLat + ( 0.001 * i ) ),
      lng: ( baseLng + ( 0.003 * i ) )
    };
    var tmpReportMarker: ReportMarkerType = {
      id: String( i ),
      location: tmpLatLng
    };
    tmpMarkers.push( tmpReportMarker );
  }

  // store data in a React Hook
  const [ points ] = useState<Array<ReportMarkerType>>( tmpMarkers );

  /******************************************/

  /*************MAP RENDERING****************/

  // load the map
  const { isLoaded, loadError } = useJsApiLoader
    ( {
      id: 'google-map-ide',
      googleMapsApiKey: props.apiKey
    } );

  const renderMap = () =>
  {
    const onLoad = ( _map: google.maps.Map ): void =>
    {
      console.log( "map loaded" );
    };

    return (
      <GoogleMap
        mapContainerStyle={ mapContainerStyle }
        options={ options as google.maps.MapOptions }
        center={ center }
        zoom={ zoom }
        onLoad={ onLoad }
      >
        {
          points?.map( point =>
          (
            <ReportMarker ReportMarkerStruct={ point } />
          ) )
        }
      </GoogleMap>
    );
  };

  if ( loadError )
  {
    return <div>Map cannot be loaded right now, sorry.</div>;
  }

  return isLoaded ? renderMap() : <div> Map Loading...</div>;

  /******************************************/
};

export default Map;