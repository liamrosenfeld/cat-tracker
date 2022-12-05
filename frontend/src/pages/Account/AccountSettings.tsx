import {
  Group,
  Text,
  TextInput,
  Space,
  Divider,
  Paper,
  Center,
  Alert,
  Stack,
  Button,
  PasswordInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle, IconCheck, IconPencil } from "@tabler/icons";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileContext } from "../../profile";

function UsernameEditor({ setError }: { setError: React.Dispatch<React.SetStateAction<string>> }) {
  let profile = useContext(ProfileContext);

  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");

  async function submitNameEdit() {
    // don't allow submitting an empty username
    if (input === "") { return; }

    // don't bother sending a request if it's the same
    if (input === profile.get?.name) {
      setEditing(false);
      return;
    }

    // get auth
    let token = localStorage.getItem("token");
    if (token == null) { return; }

    // send request
    let response = await fetch("/api/accounts/edit/username", {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token
      },
      body: new URLSearchParams({
        username: input
      })
    });

    // handle response
    switch (response.status) {
      case 200:
        // return to state before editing
        setError("");
        setEditing(false);

        // update header
        let currProfile = profile.get!;
        profile.set({ name: input, email: currProfile.email, image: currProfile.image });
        break;
      case 401:
        setError("Invalid user session")
        break;
      case 500:
        setError("Internal Server Error")
        break;
    }
  }

  if (editing) {
    return (
      <Group noWrap>
        <TextInput
          required
          placeholder="Username"
          value={input}
          onChange={(event) => { setInput(event.currentTarget.value) }}
        />
        <IconCheck onClick={submitNameEdit} />
      </Group>
    )
  } else {
    return (<Group noWrap>
      <Text>{profile.get!.name}</Text>
      <IconPencil onClick={() => { setInput(profile.get!.name); setEditing(true) }} />
    </Group>)
  }
}

function PasswordEditor({ setError }: { setError: React.Dispatch<React.SetStateAction<string>> }) {
  const [editing, setEditing] = useState(false);
  const form = useForm({
    initialValues: {
      old: "",
      new: ""
    },
    validate: {
      new: (val) => (val.length <= 6 ? "Password should include at least 6 characters" : null),
    },
  });

  async function submitPasswordEdit() {
    // don't allow empty
    if (form.values.new === "" || form.values.old === "") { return; }

    // get auth
    let token = localStorage.getItem("token");
    if (token == null) { return; }

    // send
    let response = await fetch("/api/accounts/edit/password", {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token
      },
      body: new URLSearchParams(form.values)
    });

    // handle
    switch (response.status) {
      case 200:
        setError("");
        setEditing(false);
        break;
      case 401:
        setError("Incorrect Old Password");
        break;
      case 500:
        setError("Internal Server Error");
        break;
    }
  }

  if (editing) {
    return (
      <form onSubmit={form.onSubmit(submitPasswordEdit)}>
        <Stack style={{ width: "175px" }}>
          <PasswordInput
            placeholder="Old Password"
            label="Old"
            value={form.values.old}
            onChange={(event) => { form.setFieldValue("old", event.currentTarget.value) }}
          />
          <PasswordInput
            placeholder="New Password"
            label="New"
            value={form.values.new}
            onChange={(event) => { form.setFieldValue("new", event.currentTarget.value) }}
            error={form.errors.new}
          />
          <Group noWrap spacing="xs">
            <Button onClick={() => { setEditing(false); form.reset() }} color="gray">Cancel</Button>
            <Button type="submit">Update</Button>
          </Group>
        </Stack>
      </form >
    )
  } else {
    return <IconPencil onClick={() => { setEditing(true) }} />
  }
}

export function AccountSettings() {
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/")
    }
  })

  let profile = useContext(ProfileContext);
  let navigate = useNavigate();

  const [requestError, setRequestError] = useState("");

  if (profile.get == null) {
    return (<></>);
  }

  return (
    <Center>
      <Paper withBorder radius="md" p="xl"
        sx={(_) => ({
          width: "60%",
          '@media (max-width: 700px)': {
            width: "100%",
          }
        })}
      >
        <Text size="xl" weight={500}>
          Account Settings
        </Text>

        <Space h="md" />

        <Group position="apart" noWrap>
          <Text>Username</Text>
          <UsernameEditor setError={setRequestError} />
        </Group>

        <Divider mt="sm" mb="sm" />

        <Group position="apart" noWrap>
          <Text>UF Email</Text>
          <Group>
            <Text>{profile.get.email}</Text>
          </Group>
        </Group>

        <Divider mt="sm" mb="sm" />

        <Group position="apart" noWrap>
          <Text>Password</Text>
          <PasswordEditor setError={setRequestError} />
        </Group>

        {requestError !== "" &&
          <>
            <Space h="md" />
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="orange"
              radius="md"
              withCloseButton onClose={() => setRequestError("")}
            >
              {requestError}
            </Alert>
          </>
        }
      </Paper>
    </Center>
  );
}

export default AccountSettings;
