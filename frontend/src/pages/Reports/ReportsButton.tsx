import
{
  Modal,
  Group,
  Text,
  TextInput,
  Stack,
  Button,
  Paper,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { mapContainerStyleMini, center, zoom, miniOptions } from '../Map/settings';
import ReportMarker, { ReportMarkerType } from '../Map/Markers';


function ReportForm ()
{
  const form = useForm( {
    initialValues: {
      catName: "",
      notes: "",
    },
    validate: {
      catName: ( value ) => ( value === "" ? null : "Invalid Cat Name" )
    },
  } );

  const [ pointClicked, setPointClicked ] = useState<Boolean>( false );
  const [ point, setPoint ] = useState<ReportMarkerType>();

  const mapClicked = ( event: google.maps.MapMouseEvent ) =>
  {
    var tmpPoint: ReportMarkerType;

    var tmpLatLng = {
      lat: Number( event.latLng?.lat() ),
      lng: Number( event.latLng?.lng() )
    };
    tmpPoint = {
      id: 0,
      location: tmpLatLng,
    };
    console.log( tmpPoint );
    setPoint( tmpPoint );
    setPointClicked( true );
  };

  return (
    <Stack spacing="sm">
      <form>
        <TextInput
          withAsterisk
          label="Cat Name"
          placeholder="Cat Name"
          { ...form.getInputProps( "catName" ) }
        />

        <TextInput
          label="Optional Notes"
          placeholder="Notes"
          { ...form.getInputProps( "notes" ) }
        />

        <Group position="apart">
          <Text size="sm" pb={ 3 } pt={ 3 } pr={ 0 }>
            Location
          </Text>
          <Text size="xs">
            *click to choose location
          </Text>
        </Group>

        <Paper withBorder radius="sm" >
          <GoogleMap
            mapContainerStyle={ mapContainerStyleMini }
            options={ miniOptions as google.maps.MapOptions }
            center={ center }
            zoom={ zoom }
            onClick={ mapClicked }
          // onLoad={ onLoad }
          >
            {
              pointClicked && ( <ReportMarker ReportMarkerStruct={ point! } key={ point!.id } /> )
            }
          </GoogleMap>
        </Paper>


      </form>
      <Group>
        <Button variant="filled" color="indigo">
          Submit
        </Button>
      </Group>
    </Stack>
  );
}

export function ReportsButton ()
{
  const [ opened, setOpened ] = useState( false );

  return (
    <div>
      <Modal
        opened={ opened }
        onClose={ () => setOpened( false ) }
        title="New Report"
      >

        {/*<CatNameEditor />*/ }
        <ReportForm />

      </Modal>

      <Button
        variant="filled"
        color="indigo"
        onClick={ () => setOpened( true ) }
        style={ { position: "absolute", zIndex: "100" } }
      >
        New Report
      </Button>
    </div>
  );
}
export default ReportsButton;