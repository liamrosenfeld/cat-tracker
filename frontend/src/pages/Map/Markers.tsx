import { MarkerF } from '@react-google-maps/api';
import ReportMarkerIcon from './images/map-pin.svg';

// a struct representing required marker values
export type ReportMarkerType = {
  id: string;
  location: google.maps.LatLngLiteral;
};

// onClick event handler
const onClickReportMarker = ( marker: ReportMarkerType ) => console.log( "clicked" ); // this needs to be chagned to bring up details about the report

// React FC for rendering Markers from a Marker Struct
const ReportMarker: React.FC<{ ReportMarkerStruct: ReportMarkerType; }> = props =>
{
  return <MarkerF
    key={ props.ReportMarkerStruct.id }
    position={ props.ReportMarkerStruct.location }
    onClick={ () => onClickReportMarker( props.ReportMarkerStruct ) }
    icon={ {
      url: ReportMarkerIcon,
      origin: new window.google.maps.Point( 0, 0 ),
      anchor: new window.google.maps.Point( 15, 15 ),
      scaledSize: new window.google.maps.Size( 30, 30 )
    } }
  />;
};

export default ReportMarker;