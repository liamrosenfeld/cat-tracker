import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  Button,
  Anchor,
  Stack,
  Center,
  Space,
  Alert
} from '@mantine/core';
import { IconAlertCircle, IconAt, IconKey } from '@tabler/icons';
import { useContext, useEffect, useState } from 'react';
import { populateProfile, ProfileContext } from '../../profile';

interface LoginForm {
  email: string,
  password: string,
}

export function Login() {
  const navigate = useNavigate();

  // don't allow logged in user to view
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/");
    }
  });

  const form = useForm({
    initialValues: {
      email: '',
      password: ''
    },
  });

  const [submitError, setSubmitError] = useState<string>("");
  let setProfile = useContext(ProfileContext).set;

  async function submit(form: LoginForm) {
    const data = new URLSearchParams({ ...form });
    let response = await fetch("/api/accounts/login", {
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
      case 401:
        setSubmitError("Invalid login");
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
          Welcome Back! Login:
        </Text>

        <Space h="sm" />

        <form onSubmit={form.onSubmit(submit)}>
          <Stack>
            <TextInput
              required
              label="UF Email"
              placeholder="email@ufl.edu"
              value={form.values.email}
              icon={<IconAt stroke="1.75" />}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="password"
              value={form.values.password}
              icon={<IconKey stroke="1.75" />}
              onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            />
          </Stack>

          <Group position="apart" mt="xl">
            <Anchor
              component="button"
              type="button"
              size="xs"
              onClick={() => navigate("/register")}
            >
              Don't have an account? Register
            </Anchor>
            <Button type="submit">Login</Button>
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
    </Center>
  );
}

export default Login;
