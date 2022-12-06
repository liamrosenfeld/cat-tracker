import { MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { Paper, Text, Divider, Spoiler, Space } from '@mantine/core';

/*
NOTE:
  https://react-google-maps-api-docs.netlify.app/
  https://github.com/JustFly1984/react-google-maps-api/issues/3019
  https://github.com/JustFly1984/react-google-maps-api/issues/3048#issuecomment-1166410403
  https://github.com/JustFly1984/react-google-maps-api/issues/2978
  https://codesandbox.io/s/react-google-maps-api-forked-8uvb39?file=%2Fsrc%2Findex.js
*/

// a struct representing required marker values
export type ReportMarkerType = {
  id: number;
  location: google.maps.LatLngLiteral;
};

// React FC for rendering Markers from a Marker Struct
const ReportMarker: React.FC<{ ReportMarkerStruct: ReportMarkerType; }> = props =>
{
  // load extra marker / Report window infomation
  const [ catName, setCatName ] = useState();
  const [ userName, setUserName ] = useState();
  const [ lastSeen, setLastSeen ] = useState();
  const [ createdOn, setCreatedOn ] = useState();
  const [ notes, setNotes ] = useState();

  const [ reportLoaded, setReportLoaded ] = useState( false );
  useEffect( () =>
  {
    async function loadReport () 
    {
      let response = await fetch( "/api/reports/" + props.ReportMarkerStruct.id );

      // store the response in multiple React Hooks
      const data = await response.json();
      setCatName( data.cat_name );
      setUserName( data.created_by );
      setLastSeen( data.last_seen );
      setCreatedOn( data.created_at );
      setNotes( data.notes );
    }
    if ( !reportLoaded )
    {
      loadReport();
      setReportLoaded( true );
    }

  }, [ reportLoaded, props.ReportMarkerStruct ] );

  // Parse out the React Hook data into local consts
  const ACatName: string = catName!;
  const AUserName: string = userName!;
  var ALastSeen: string = lastSeen!;
  const lastSeenDate = new Date( ALastSeen );
  const LastSeenString: string = lastSeenDate.getHours() + ":" + lastSeenDate.getMinutes() + ' ' + lastSeenDate.getUTCMonth() + "/" + lastSeenDate.getDate() + "/" + lastSeenDate.getUTCFullYear();
  const ACreatedOn: string = createdOn!;
  const createdOnDate = new Date( ACreatedOn );
  const CreatedOnString: string = createdOnDate.getHours() + ":" + createdOnDate.getMinutes() + ' ' + createdOnDate.getUTCMonth() + "/" + createdOnDate.getDate() + "/" + createdOnDate.getUTCFullYear();
  const ANotes: string = notes!;

  // onClick event handler for when a marker is clicked
  const [ switchToInfo, setSwitchToInfo ] = useState<boolean>();

  const OnClickReportMarker = () =>
  {
    if ( switchToInfo )
    {
      setSwitchToInfo( false );
    }
    else
    {
      setSwitchToInfo( true );
    }
  };

  // onClick event handler for when a Report window is closed
  const OnClickInfoWindowClose = () =>
  {
    setSwitchToInfo( false );
  };

  return (
    <MarkerF
      key={ props.ReportMarkerStruct.id }
      position={ props.ReportMarkerStruct.location }
      onClick={ () => OnClickReportMarker() }
      icon={ {
        url: '/images/logo.svg',
        origin: new window.google.maps.Point( 0, 0 ),
        anchor: new window.google.maps.Point( 15, 15 ),
        scaledSize: new window.google.maps.Size( 30, 30 )
      } }
    >
      { switchToInfo && (
        <InfoWindowF
          onCloseClick={ () => OnClickInfoWindowClose() }
        >
          <Paper
            p="xs"
          >
            <Spoiler maxHeight={ 170 } showLabel="Show more" hideLabel="Hide">
              <Text size="xl" weight={ 500 }>
                { ACatName }
              </Text>
              <Text size="xs">
                { AUserName }
              </Text>
              <Divider mt="xs" mb="sm" />
              <Text size="sm">
                Last Seen: { LastSeenString }
              </Text>
              <Text size="sm">
                First Seen: { CreatedOnString }
              </Text>
              <Divider mt="sm" mb="sm" />
              <Text size="sm">
                Location: { props.ReportMarkerStruct.location.lat }, { props.ReportMarkerStruct.location.lng }
              </Text>
              <Divider mt="sm" mb="sm" />
              <Text size="sm">
                Notes:
              </Text>
              <Text>
                { ANotes }
                <Space h="xs" />
              </Text>
            </Spoiler>
          </Paper>
        </InfoWindowF>
      ) }
    </MarkerF>

  );
};

export default ReportMarker;