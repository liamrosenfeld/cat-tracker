import { Button, Center, Paper, Text, Space } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

function NoPage() {
  const navigate = useNavigate();

  return (
    <Center>
      <Paper radius="md" p="xl" withBorder>
        <Text size="lg" weight={500}>
          Page Not Found
        </Text>
        <Space h="sm" />
        <Button onClick={() => navigate("/")}>
          Back Home
        </Button>
      </Paper>
    </Center>
  );
}

export default NoPage;
