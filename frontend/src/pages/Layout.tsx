import { Outlet } from "react-router-dom";
import { HeaderTabs } from "./Header";
import { AppShell, MantineProvider, useMantineTheme, } from "@mantine/core";

const Layout = () =>
{
  var userData = require( './Data.json' );
  const theme = useMantineTheme();

  return (
    <>
      <MantineProvider withNormalizeCSS withGlobalStyles>
        <AppShell
          styles={ {
            main: {
              background: theme.colorScheme === 'dark' ? theme.colors.dark[ 8 ] : theme.colors.gray[ 0 ],
            },
          } }
          fixed
          header={
            <HeaderTabs user={ userData.user } tabs={ userData.tabs } />
          }
        >
          <Outlet />
        </AppShell >
      </MantineProvider>
    </>
  );
};

export default Layout;
