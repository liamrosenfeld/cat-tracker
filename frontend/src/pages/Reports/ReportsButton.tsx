import {
  Modal,
  Group,
  Text,
  TextInput,
  Stack,
  Button,
  Paper,
  Space,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { mapContainerStyleMini, center, zoom, miniOptions } from '../Map/settings';
import ReportMarker from '../Map/Markers';
import { IconAlertCircle } from "@tabler/icons";

interface ReportRequest {
  catName: string,
  notes: string,
  lat: number | null,
  lng: number | null,
}


function ReportForm(props: {
  setOpened: (_: boolean) => void;
  reloadCats: () => void;
}) {
  const form = useForm({
    initialValues: {
      catName: "",
      notes: "",
      lat: null,
      lng: null,
    } as ReportRequest,
    validate: {
      catName: (value) => (value === "" ? "Must name the cat" : null)
    },
  });

  const [pointClicked, setPointClicked] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const mapClicked = (event: google.maps.MapMouseEvent) => {
    form.setFieldValue('lat', event.latLng?.lat() ?? null);
    form.setFieldValue('lng', event.latLng?.lng() ?? null);
    setPointClicked(true);
  };

  async function submitReport(form: ReportRequest) {
    let token = localStorage.getItem("token");
    if (token == null) { return; }

    if (form.lat == null || form.lng == null) {
      setSubmitError("Must select location");
      return;
    }

    let response = await fetch("/api/reports/new", {
      method: "POST",
      headers: new Headers({
        "Authorization": "Bearer " + token,
      }),
      body: new URLSearchParams({
        cat_name: form.catName,
        notes: form.notes,
        loc_x: form.lat.toString(),
        loc_y: form.lng.toString(),
      })
    });

    switch (response.status) {
      case 200:
        let id = await response.json();
        console.log(id);
        setSubmitError("");
        props.reloadCats();
        props.setOpened(false);
        break;
      case 401:
        // jwt is not valid -> logout
        localStorage.removeItem("token");
        break;
      default:
        console.error("unexpected error getting myself: " + response.statusText);
    }
  }

  return (
    <Stack spacing="sm">
      <form onSubmit={form.onSubmit(submitReport)}>
        <TextInput
          withAsterisk
          label="Cat Name"
          placeholder="Cat Name"
          {...form.getInputProps("catName")}
        />

        <TextInput
          label="Optional Notes"
          placeholder="Notes"
          {...form.getInputProps("notes")}
        />

        <Group position="apart">
          <Text size="sm" pb={3} pt={3} pr={0}>
            Location
          </Text>
          <Text size="xs">
            *click to choose location
          </Text>
        </Group>

        <Paper withBorder radius="sm" >
          <GoogleMap
            mapContainerStyle={mapContainerStyleMini}
            options={miniOptions as google.maps.MapOptions}
            center={center}
            zoom={zoom}
            onClick={mapClicked}
          >
            {
              pointClicked && (<ReportMarker ReportMarkerStruct={
                {
                  id: 0,
                  location: {
                    lat: form.values.lat!,
                    lng: form.values.lng!
                  }
                }
              } key={"current_loc"} />)
            }
          </GoogleMap>
        </Paper>

        <Space h="md" />

        <Button variant="filled" color="indigo" type="submit">
          Submit
        </Button>
      </form>

      {submitError !== "" &&
        <>
          <Space h="sm" />
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="orange"
            radius="md"
            withCloseButton onClose={() => setSubmitError("")}
          >
            {submitError}
          </Alert>
        </>
      }
    </Stack>
  );
}

export function ReportsButton(props: { reloadCats: () => void; }) {
  const [opened, setOpened] = useState(false);

  if (localStorage.getItem("token") == null) {
    return (<></>);
  }

  return (
    <div>
      <Modal
        centered
        opened={opened}
        onClose={() => setOpened(false)}
        title="New Report"
      >
        <ReportForm setOpened={setOpened} reloadCats={props.reloadCats} />
      </Modal>

      <Button
        variant="filled"
        color="indigo"
        onClick={() => setOpened(true)}
        style={{ position: "absolute", zIndex: "100" }}
      >
        New Report
      </Button>
    </div>
  );
}
export default ReportsButton;
