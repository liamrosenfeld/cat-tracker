/*
  Actual implementation of the map
  Markers are grabbed from the backend and rendered onto a google maps API
*/
import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { mapContainerStyle, center, zoom, options } from './settings';
import ReportMarker, { ReportMarkerType } from './Markers';
import { createStyles, LoadingOverlay } from '@mantine/core';

// stylesheet attempt for removing scroll bar overflow
const useStyles = createStyles( ( theme ) => ( {

  wrapper: {
    maxWidth: '100%',
    maxHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 'none',
    margin: 'none',
  }
} ) );

// render the map if the API key is available
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

  // don't load the map until we have obtained the API key
  return ( key !== undefined ) && key != "" ? <div style={ { margin: 0 } }><MapChild apiKey={ key } /></div> :
    <LoadingOverlay
      loaderProps={ { size: 'xl', color: 'black', variant: 'bars' } }
      overlayOpacity={ 0 }
      overlayColor="#c5c5c5"
      visible
    />;
};

const MapChild: React.FC<{ apiKey: string; }> = ( props ) =>
{

  /**********TEMPORARY MARKER DATA***********/

  var baseLat = 29.639;
  var baseLng = -82.360;

  // attempt to grab data from API and store in rawPoints
  const [ rawPoints, setRawPoints ] = useState( [] );
  const [ points, setPoints ] = useState<Array<ReportMarkerType>>();
  const [ mapLoaded, setMapLoaded ] = useState( false );
  useEffect( () =>
  {
    async function loadMap () 
    {
      let response = await fetch( "/api/reports/recent?hours_back=100" );

      // store the response in rawPoints
      const data = await response.json();
      setRawPoints( data );
    }
    if ( !mapLoaded )
    {
      loadMap();
      setMapLoaded( true );
    }

  }, [ mapLoaded ] );

  // waits until rawPoints is fully set before converting the generic rawPoints to Strictly type Points
  useEffect( () =>
  {
    var tmpMarkers: Array<ReportMarkerType> = new Array<ReportMarkerType>();

    for ( var i = 0; i < rawPoints.length; i++ )
    {
      var tmpLatLng: google.maps.LatLngLiteral = {
        lat: rawPoints[ i ][ 'loc_x' ],
        lng: rawPoints[ i ][ 'loc_y' ],
      };
      var tmpReportMarker: ReportMarkerType = {
        id: rawPoints[ i ][ 'id' ],
        location: tmpLatLng,
      };
      tmpMarkers.push( tmpReportMarker );
    }

    setPoints( tmpMarkers );
  }, [ rawPoints ] );

  /******************************************/

  const { classes } = useStyles();

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
      <div className={ classes.wrapper }>
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
              <ReportMarker ReportMarkerStruct={ point } key={ point.id } />
            ) )
          }
        </GoogleMap>

      </div>
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
