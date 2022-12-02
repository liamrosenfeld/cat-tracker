import { useForm } from '@mantine/form';
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
  Center,
} from '@mantine/core';
import { IconAt, IconKey, IconUser } from '@tabler/icons';
import { useNavigate } from 'react-router-dom';

export function Register(props: PaperProps) {
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

  const navigate = useNavigate();

  return (
    <Center>
      <Paper radius="md" p="xl" withBorder {...props}>
        <Text size="lg" weight={500}>
          Welcome! Register:
        </Text>

        <Divider labelPosition="center" my="lg" />

        <form onSubmit={form.onSubmit(() => { })}>
          <Stack>
            <TextInput
              required
              label="Username"
              placeholder="public username"
              value={form.values.username}
              icon={<IconUser />}
              onChange={(event) => form.setFieldValue('username', event.currentTarget.value)}
            />

            <TextInput
              required
              label="UF Email"
              placeholder="email@ufl.edu"
              value={form.values.email}
              icon={<IconAt />}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
              error={form.errors.email}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="password"
              value={form.values.password}
              icon={<IconKey />}
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
      </Paper>
    </Center>
  );
}

export default Register;
