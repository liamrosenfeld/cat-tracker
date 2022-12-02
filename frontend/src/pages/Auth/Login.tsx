import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  PaperProps,
  Button,
  Divider,
  Anchor,
  Stack,
  Center
} from '@mantine/core';
import { IconAt, IconKey } from '@tabler/icons';

export function Login(props: PaperProps) {
  const form = useForm({
    initialValues: {
      email: '',
      password: ''
    },
  });

  const navigate = useNavigate();

  return (
    <Center>
      <Paper radius="md" p="xl" withBorder {...props}>
        <Text size="lg" weight={500}>
          Welcome Back! Login:
        </Text>

        <Divider labelPosition="center" my="lg" />

        <form onSubmit={form.onSubmit(() => { })}>
          <Stack>
            <TextInput
              required
              label="UF Email"
              placeholder="email@ufl.edu"
              value={form.values.email}
              icon={<IconAt />}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="password"
              value={form.values.password}
              icon={<IconKey />}
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
      </Paper>
    </Center>
  );
}

export default Login;
