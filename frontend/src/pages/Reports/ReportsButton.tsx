import {
  Modal,
  Group,
  Text,
  TextInput,
  Stack,
  Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from 'react';

function ReportForm() {
  const form = useForm({
    initialValues: {
      catName: "",
      notes: "",
    },
    validate: {
      catName: (value) => (value === "" ? null : "Invalid Cat Name")
    },
  });

  return (
    <Stack spacing="sm">
      <form>
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
      </form>
      <Group>
        <Button variant="filled" color="indigo">
          Submit
        </Button>
      </Group>
    </Stack>
  );
}

export function ReportsButton() {
  const [opened, setOpened] = useState(false);

  return (
    <div>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="New Report"
      >

        {/*<CatNameEditor />*/}
        <ReportForm />

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