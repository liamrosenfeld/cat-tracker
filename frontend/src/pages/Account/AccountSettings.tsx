import {
  Container,
  Group,
  Text,
  createStyles,
  Card,
  Button,
  TextInput,
} from "@mantine/core";
import { useSetState } from "@mantine/hooks";
import { IconCheck, IconPencil } from "@tabler/icons";
import { render } from "@testing-library/react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileContext, ProfileInfo, ProfileSetter } from "../../profile";

const useStyles = createStyles((theme) => ({
  card: {
    width: "66%"
  },
  item: {
    '& + &': {
      paddingTop: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      borderTop: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
        }`,
    },
  },
  title: {
    lineHeight: 1,
    paddingBottom: theme.spacing.sm,
  },
}));

export function AccountSettings() {
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/")
    }
  })

  const { classes } = useStyles();
  let profile = useContext(ProfileContext);
  let navigate = useNavigate();

  const onUsernameEdit = () => {
    console.log("username edit");
    setState({
      userComp: (
        <Group>
          <TextInput
            required
            placeholder="Username"
            value={profile.get?.name}
          />
          <IconCheck onClick={onUsernameUnEdit} />
        </Group>
      )
    });
  };

  const onUsernameUnEdit = () => {
    console.log("username unedit");
    setState({
      userComp: (
        <Group>
          <Text>{profile.get?.name}</Text>
          <IconPencil onClick={onUsernameEdit} />
        </Group>
      )
    });
  };

  const [state, setState] = useState({
    userComp: (
      <Group>
        <Text>{profile.get?.name}</Text>
        <IconPencil onClick={onUsernameEdit} />
      </Group>
    )
  });

  return ((
    profile.get != null ?
      <Container style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      >
        <Card withBorder radius="md" p="xl" className={classes.card}>
          <Text size="xl" className={classes.title} weight={500}>
            Account Settings
          </Text>

          <Group position="apart" className={classes.item} noWrap spacing="xl">
            <Text>Username</Text>
            <Group>{state.userComp}</Group>
          </Group>

          <Group position="apart" className={classes.item} noWrap spacing="xl">
            <Text>UF Email</Text>
            <Group>
              <Text>lydia@ufl.edu</Text>
            </Group>
          </Group>

          <Group position="apart" className={classes.item} noWrap spacing="xl">
            <Text>Password</Text>
            <Text>********</Text>
          </Group>

        </Card>
      </Container>
      :
      <Text>You're not logged in!</Text>
  ));
}

export default AccountSettings;