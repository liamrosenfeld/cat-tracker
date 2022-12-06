import { useForm } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  Button,
  Space,
  Anchor,
  Stack,
  Center,
  Alert
} from '@mantine/core';
import { IconAt, IconKey, IconUser, IconAlertCircle } from '@tabler/icons';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { ProfileContext, populateProfile } from "../../profile";

interface RegisterForm {
  username: string,
  email: string,
  password: string;
}

export function Register() {
  const navigate = useNavigate();

  // don't allow logged in user to view
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/");
    }
  });

  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      password: ''
    },

    validate: {
      email: (val) => (/^\S+@(\S*\.)?ufl.edu$/.test(val) ? null : 'Must be a UF email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  const [submitError, setSubmitError] = useState<string>("");
  let setProfile = useContext(ProfileContext).set;

  async function submit(form: RegisterForm) {
    const data = new URLSearchParams({ ...form });
    let response = await fetch("/api/accounts/new", {
      method: "POST",
      body: data
    });

    switch (response.status) {
      case 200:
        let token = (await response.json())["access_token"];
        localStorage.setItem("token", token);
        await populateProfile(setProfile);
        navigate("/");
        break;
      case 409:
        setSubmitError("Email Already Taken");
        break;
      case 500:
        setSubmitError("Internal Server Error");
        break;
    }
  }

  return (
    <Center>
      <Paper radius="md" p="xl" withBorder>
        <Text size="lg" weight={500}>
          Welcome! Register:
        </Text>

        <Space h="sm" />

        <form onSubmit={form.onSubmit(submit)}>
          <Stack>
            <TextInput
              required
              label="Username"
              placeholder="public username"
              value={form.values.username}
              icon={<IconUser stroke="1.75" />}
              onChange={(event) => form.setFieldValue('username', event.currentTarget.value)}
            />

            <TextInput
              required
              label="UF Email"
              placeholder="email@ufl.edu"
              value={form.values.email}
              icon={<IconAt stroke="1.75" />}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
              error={form.errors.email}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="password"
              value={form.values.password}
              icon={<IconKey stroke="1.75" />}
              onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
              error={form.errors.password}
            />
          </Stack>

          <Group position="apart" mt="xl">
            <Anchor
              component="button"
              type="button"
              size="xs"
              onClick={() => navigate("/login")}
            >
              Already have an account? Login
            </Anchor>

            <Button type="submit">Register</Button>
          </Group>
        </form>

        {submitError !== "" &&
          <>
            <Space h="md" />
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

      </Paper>
    </Center >
  );
}

export default Register;
