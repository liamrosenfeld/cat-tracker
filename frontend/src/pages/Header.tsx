import
{
  Container,
  Avatar,
  Group,
  Text,
  Menu,
  Button,
  MediaQuery,
} from "@mantine/core";
import
{
  IconLogout,
  IconMessage,
  IconSettings,
  IconChevronDown,
  IconPaw,
} from "@tabler/icons";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileContext, ProfileInfo, ProfileSetter } from "../profile";

// Right side user Drop Down menu
function UserMenu ( { profile, setProfile }: { profile: ProfileInfo, setProfile: ProfileSetter; } )
{
  let navigate = useNavigate();

  // Removes profile information, local JWT, and send to login page
  function logout ()
  {
    localStorage.removeItem( "token" );
    console.log( setProfile );
    setProfile( null );
    navigate( "/login" );
  }

  return (
    // Right side Menu
    <Menu
      width={ 260 }
      position="bottom-end"
      transition="pop-top-right"
    >
      {/*Menu Display*/ }
      <Menu.Target>
        <Button variant="subtle" color="dark">
          <Group spacing={ 7 }>
            {/*Profile Picture*/ }
            <Avatar src={ profile.image } alt="Profile picture" radius="xl" size={ 24 } />

            {/*Profile Name*/ }
            <MediaQuery smallerThan="sm" styles={ { display: "none" } }>
              <Text weight="500" size="sm" mr="3">
                { profile.name }
              </Text>
            </MediaQuery>

            {/*Dropdown Arrow*/ }
            <IconChevronDown size="12" stroke="1.5" />

          </Group>
        </Button>
      </Menu.Target>

      {/*Menu Options*/ }
      <Menu.Dropdown>
        <Menu.Item
          icon={ <IconMessage size="14" stroke="1.5" /> }
          onClick={ () => navigate( "/account/settings" ) }
        >Your Reports</Menu.Item>

        <Menu.Item
          icon={ <IconSettings size="14" stroke="1.5" /> }
          onClick={ () => navigate( "/account/settings" ) }
        >Account settings</Menu.Item>

        <Menu.Item
          icon={ <IconLogout size="14" stroke="1.5" /> }
          onClick={ logout }
        >Logout</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

// full website Header
export function HeaderTabs ()
{
  let profile = useContext( ProfileContext );
  let navigate = useNavigate();

  return (
    <Container p="sm">
      <Group position="apart">
        {/*Website Banner*/ }
        <Group onClick={ () => navigate( "/" ) }>
          <IconPaw size={ 28 } />
          <Text>UF Cat Tracker</Text>
        </Group>

        {/*Right Side Menu*/ }
        {/*only if profile exists and is loaded*/ }
        { profile.get != null ?
          <UserMenu profile={ profile.get } setProfile={ profile.set } />
          :
          <Button onClick={ () => navigate( "/login" ) }>
            Log In
          </Button>
        }

      </Group>
    </Container>
  );
}
