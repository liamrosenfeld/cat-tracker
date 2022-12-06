/*
  Actual implementation of the map
  Markers are grabbed from the backend and rendered onto a google maps API
*/
import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { mapContainerStyle, center, zoom, options } from './settings';
import ReportMarker, { ReportMarkerType } from './Markers';
import { createStyles, LoadingOverlay, Slider, Stack } from '@mantine/core';
import ReportsButton from "../Reports/ReportsButton";

// stylesheet attempt for removing scroll bar overflow
const useStyles = createStyles( ( theme ) => ( {

  wrapper: {
    display: 'flex',
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'none',
    margin: 'none',
  },
  slider:
  {
    width: '75%',
    minWidth: '75%',
    position: 'absolute',
    bottom: '80px',
  },
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
  return ( key !== undefined ) && key !== "" ? <div style={ { margin: 0 } }><MapChild apiKey={ key } /></div> :
    <LoadingOverlay
      loaderProps={ { size: 'xl', color: 'black', variant: 'bars' } }
      overlayOpacity={ 0 }
      overlayColor="#c5c5c5"
      visible
    />;
};


const MapChild: React.FC<{ apiKey: string; }> = ( props ) =>
{
  const sliderRef = useRef<HTMLDivElement>( null );
  var hoursBack = 11;
  // fetch data from the api
  const fetchData = () =>
  {
    fetch( "/api/reports/recent?hours_back=" + hoursBack )
      .then( ( response ) => response.json() )
      .then( ( response ) =>
      {
        setRawPoints( response );
      } )
      .catch( () =>
      {
        console.log( 'error' );
      } );
  };

  // update the hours back and resend api
  const onUpdate = () =>
  {
    hoursBack = Number( sliderRef.current?.lastElementChild?.attributes[ 1 ].value );
    fetchData();
  };

  /**********GETTING MARKER DATA***********/
  // gainesville coordinates
  // var baseLat = 29.639;
  // var baseLng = -82.360;

  // attempt to grab data from API and store in rawPoints
  const [ rawPoints, setRawPoints ] = useState( [] );
  const [ points, setPoints ] = useState<Array<ReportMarkerType>>();
  const { classes } = useStyles();


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
      fetchData();
    };

    const marks = [
      { value: 11, label: '24 hours' },
      { value: 35, label: '10 days' },
      { value: 60, label: '1 month' },
      { value: 85, label: '2 months' },
    ];

    return (
      <Stack className={ classes.wrapper }>
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
          <ReportsButton />
        </GoogleMap>
        <Slider className={ classes.slider }
          color="blue"
          defaultValue={ 11 }
          marks={ marks }
          labelTransition="fade"
          size={ 4 }
          ref={ sliderRef }
          onChangeEnd={ onUpdate }
          styles={ ( theme ) => ( {
            track: {
              boxShadow: '5px 5px 7px black',
              backgroundColor:
                theme.colorScheme === 'dark' ? theme.colors.dark[ 3 ] : theme.colors.red,
            },
            mark: {
              width: 10,
              height: 10,
              borderRadius: 6,
              transform: 'translateX(-3px) translateY(-2px)',
              borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[ 3 ] : theme.colors.blue[ 1 ],
            },
            markFilled: {
              borderColor: theme.colors.blue[ 6 ],
            },
            markLabel: {
              fontSize: theme.fontSizes.xs,
              color: theme.colors.dark[ 4 ],
              marginBottom: 5,
              marginTop: 3,
            },
            thumb: {
              height: 20,
              width: 20,
              backgroundColor: theme.white,
              borderWidth: 1,
              boxShadow: theme.shadows.sm,
            },
          } ) }
          scale={ ( v ) => Math.round( ( v ** 2 ) / 5 ) }
        />
      </Stack>
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
