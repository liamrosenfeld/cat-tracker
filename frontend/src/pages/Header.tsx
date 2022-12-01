import { useState } from 'react';
import
{
  createStyles,
  Container,
  Avatar,
  UnstyledButton,
  Group,
  Text,
  Menu,
  Tabs,
  Burger,
  MediaQuery,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import
{
  IconLogout,
  IconMessage,
  IconSettings,
  IconTrash,
  IconSwitchHorizontal,
  IconChevronDown,
  IconPaw,
} from '@tabler/icons';
import { Link } from 'react-router-dom';

const useStyles = createStyles( ( theme ) => ( {
  header: {
    paddingTop: theme.spacing.sm,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[ 6 ] : theme.colors.gray[ 0 ],
    borderBottom: `1px solid ${ theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[ 2 ]
      }`,
  },

  mainSection: {
    paddingBottom: theme.spacing.sm,
  },

  user: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[ 0 ] : theme.black,
    padding: `${ theme.spacing.xs }px ${ theme.spacing.sm }px`,
    borderRadius: theme.radius.sm,
    transition: 'background-color 100ms ease',

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[ 8 ] : theme.white,
    },

    [ theme.fn.smallerThan( 'xs' ) ]: {
      display: 'none',
    },
  },

  burger: {
    [ theme.fn.largerThan( 'xs' ) ]: {
      display: 'none',
    },
  },

  userActive: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[ 8 ] : theme.white,
  },

  downArray: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    width: "100%",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[ 0 ] : theme.black,
    transition: 'background-color 100ms ease',

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[ 8 ] : theme.white,
    },
  },

  fat: {
    width: "100%",
  },

  tabs: {
    [ theme.fn.smallerThan( 'xs' ) ]: {
      display: 'none',
    },
  },

  tabsList: {
    borderBottom: '0 !important',
  },

  tab: {
    fontWeight: 500,
    height: 38,
    backgroundColor: 'transparent',

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[ 5 ] : theme.colors.gray[ 1 ],
    },

    '&[data-active]': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[ 7 ] : theme.white,
      borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[ 7 ] : theme.colors.gray[ 2 ],
    },
  },

  link:
  {
    textDecoration: 'none',
  }
} ) );

export interface HeaderTabsProps
{
  user: { name: string; image: string; };
  tabs: string[];
}

export function HeaderTabs ( { user, tabs }: HeaderTabsProps ) 
{
  const { classes, theme, cx } = useStyles();
  const [ opened, { toggle } ] = useDisclosure( false );
  const [ userMenuOpened, setUserMenuOpened ] = useState( false );
  const [ navMenuOpened, setNavMenuOpened ] = useState( false );
  var urlRoute = 'sds';
  const items = tabs.map( ( tab ) => ( (
    urlRoute = '/' + tab.toLowerCase(),
    <Link className={ classes.link } to={ urlRoute }>
      <Tabs.Tab value={ tab } key={ tab }>
        { tab }
      </Tabs.Tab>
    </Link>

  ) ) );

  const items2 = tabs.map( ( tab ) => ( (
    urlRoute = '/' + tab.toLowerCase(),
    <Link className={ cx( classes.link, classes.fat ) } to={ urlRoute }>
      <Menu.Item value={ tab } key={ tab }>
        { tab }
      </Menu.Item>
    </Link>

  ) ) );
  return (
    <div className={ classes.header }>
      <Container className={ classes.mainSection }>
        <Group position="apart">
          <Group>
            <IconPaw size={ 28 } />
            <Text>
              UF Cat Tracker
            </Text>
          </Group>

          <Menu
            width={ 260 }
            position="bottom-end"
            transition="pop-top-right"
            onClose={ () => setUserMenuOpened( false ) }
            onOpen={ () => setUserMenuOpened( true ) }
          >
            <Menu.Target>
              <UnstyledButton>
                <UnstyledButton
                  className={ cx( classes.user, { [ classes.userActive ]: userMenuOpened } ) }
                >
                  <Group spacing={ 7 }>
                    <Avatar src={ user.image } alt={ user.name } radius="xl" size={ 24 } />
                    <Text weight={ 500 } size="sm" sx={ { lineHeight: 1 } } mr={ 3 }>
                      { user.name }
                    </Text>
                    <IconChevronDown size={ 12 } stroke={ 1.5 } />
                  </Group>
                </UnstyledButton>
                <Burger opened={ opened } onClick={ toggle } className={ classes.burger } size="sm" />
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>General</Menu.Label>
              <Menu.Item icon={ <IconMessage size={ 14 } color={ theme.colors.blue[ 6 ] } stroke={ 1.5 } /> }>
                Your Reports
              </Menu.Item>

              <Menu.Label>Settings</Menu.Label>
              <Menu.Item icon={ <IconSettings size={ 14 } stroke={ 1.5 } /> }>Account settings</Menu.Item>
              <Menu.Item icon={ <IconSwitchHorizontal size={ 14 } stroke={ 1.5 } /> }>
                Change account
              </Menu.Item>
              <Menu.Item icon={ <IconLogout size={ 14 } stroke={ 1.5 } /> }>Logout</Menu.Item>

              <Menu.Divider />

              <Menu.Label>Advanced</Menu.Label>
              <Menu.Item color="red" icon={ <IconTrash size={ 14 } stroke={ 1.5 } /> }>
                Delete account
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Container>
      <Container>
        <Tabs
          defaultValue="Home"
          variant="outline"
          classNames={ {
            root: classes.tabs,
            tabsList: classes.tabsList,
            tab: classes.tab,
          } }
        >
          <Tabs.List>{ items }</Tabs.List>
        </Tabs>
        <MediaQuery largerThan="xs" styles={ { display: "none" } }>
          <Container>
            <Menu
              width={ "87%" }
              onClose={ () => setNavMenuOpened( false ) }
              onOpen={ () => setNavMenuOpened( true ) }
            >
              <Menu.Target>
                <UnstyledButton
                  className={ cx( classes.downArray, { [ classes.userActive ]: navMenuOpened } ) }
                >
                  <IconChevronDown size={ 20 } stroke={ 5 } />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                { items2 }
              </Menu.Dropdown>
            </Menu>

          </Container>

        </MediaQuery>


      </Container>

    </div>
  );
}